import { A, isArray } from '@ember/array';
import { Promise } from 'rsvp';
import { isNone } from '@ember/utils';
import Mixin from '@ember/object/mixin';
import crsFactory4326 from 'ember-flexberry-gis/coordinate-reference-systems/epsg-4326';
import { getCrsByName } from '../utils/get-crs-by-name';
import { geometryToJsts } from '../utils/layer-to-jsts';
import { createLayerFromMetadata } from '../utils/create-layer-from-metadata';
import {
  setIndexes
} from '../utils/change-index-on-map-layers';

import QueryBuilder from 'ember-flexberry-data/query/builder';
import Condition from 'ember-flexberry-data/query/condition';
import { ComplexPredicate, StringPredicate, GeographyPredicate } from 'ember-flexberry-data/query/predicate';

export default Mixin.create({
  /**
    Keyword for cosmos images.

    @property cosmosKeywords
    @type String
    @default 'cosmos'
  */
  cosmosKeywords: 'cosmos',

  /**
    Name of metadata model projection to be used as layer metadata properties limitation.

    @property metadataProjection
    @type String
    @default 'LayerMetadataE'
  */
  metadataProjection: 'LayerMetadataE',

  /**
    Name of metadata model to be used as layer metadata record type.

    @property metadataModelName
    @type String
    @default 'new-platform-flexberry-g-i-s-layer-metadata'
  */
  metadataModelName: 'new-platform-flexberry-g-i-s-layer-metadata',

  /**
    Produces query builder by metadata model name and metadata projection.

    @method _getQueryBuilderLayerMetadata
    @return {Object} Query builder
  */
  _getQueryBuilderLayerMetadata() {
    let queryBuilder = new QueryBuilder(this.get('store'))
    .from(this.get('metadataModelName'))
    .selectByProjection(this.get('metadataProjection'));
    return queryBuilder;
  },

  /**
    Produces metadata loading request by queryBuilder.

    @method _getMetadataModels
    @param {Object} queryBuilder Query builder.
    @return {Promise} models
  */
  _getMetadataModels(queryBuilder) {
    if (isNone(queryBuilder)) {
      return null;
    }

    return this.get('store').query(this.get('metadataModelName'), queryBuilder.build());
  },

  /**
    Finds layers by feature geometry and atributes. If 'feature' parameter is specified, then search condition is created by feature geometry
    which intersects layer's boundingBox. If 'atributes' parameter is specified, then search condition is created by combining attributes via OR,
    field for search is anyText. All conditions are combined via AND. For the found LayerMetadatas, the intersection area is calculated if the
    search was performed by geometryIntersectsBbox.

    @method findLayerMetadata.
    @param {Object} geometryIntersectsBbox GeoJson Feature to intersect with boundingBox.
    @param {Array} attributes Array of search strings.
    @return {Promise} Array of object. Object consisting of 'layerMatadata' is layers models where feature geometry intersects layer's boundingBox
    and layers have desired attributes, and 'areaIntersections' is area of intersections.
  */
  findLayerMetadata(geometryIntersectsBbox, attributes) {
    return new Promise((resolve, reject) => {
      let filter = A();
      let crsName;
      let crsLayer;
      if (!isNone(geometryIntersectsBbox)) {
        if (!geometryIntersectsBbox.hasOwnProperty('crs')) {
          reject("Error: geometryIntersectsBbox must have 'crs' attribute");
        }

        crsName = geometryIntersectsBbox.crs.properties.name;
        crsLayer = getCrsByName(crsName, this).crs;

        let coordsToLatLng = function (coords) {
          return crsLayer.unproject(L.point(coords));
        };

        let geoJSON = L.geoJSON(geometryIntersectsBbox, { coordsToLatLng: coordsToLatLng.bind(this) });

        let predicateBBox = new GeographyPredicate('boundingBox');
        filter.push(predicateBBox.intersects(geoJSON.getLayers()[0].toEWKT(crsFactory4326.create())));
      }

      if (!isNone(attributes) && isArray(attributes)) {
        let equals = A();
        attributes.forEach((strSearch) => {
          equals.push(new StringPredicate('anyText').contains(strSearch));
        });

        if (equals.length === 1) {
          filter.push(equals[0]);
        } else {
          filter.push(new ComplexPredicate(Condition.Or, ...equals));
        }
      }

      if (filter.length === 0) {
        reject('Error: failed to create a request condition');
      }

      let condition;
      if (filter.length === 1) {
        condition = filter[0];
      } else {
        condition = new ComplexPredicate(Condition.And, ...filter);
      }

      let queryBuilder = this._getQueryBuilderLayerMetadata().where(condition);

      this._getMetadataModels(queryBuilder).then((meta) => {
        let models = meta;
        let result = [];
        if (meta && typeof meta.toArray === 'function') {
          models = meta.toArray();
        }

        models.forEach(model => {
          let resObject = {
            layerMatadata: model
          };
          if (!isNone(geometryIntersectsBbox)) {
            let bbox = model.get('boundingBox');
            let bboxLayer = L.geoJSON(bbox).getLayers()[0];
            let bboxJsts = bboxLayer.toJsts(crsLayer);
            let featureJsts = geometryToJsts(geometryIntersectsBbox.geometry);
            featureJsts.setSRID(crsName.split(':')[1]);
            resObject.areaIntersections = bboxJsts.intersection(featureJsts).getArea();
          }

          result.push(resObject);
        });

        resolve(result);
      }).catch((e) => {
        reject(e);
      });
    });
  },

  /**
    Finds a layer by layer id. Creates a layer from layerMetadata, sets index and map.
    Adds layer in hierarchy.

    @method addLayerFromLayerMetadata.
    @param {String} layerId Layer ID.
    @param {integer} index.
    @return {Promise} layer model.
  */
  addLayerFromLayerMetadata(layerId, index) {
    return new Promise((resolve, reject) => {
      let queryBuilder = this._getQueryBuilderLayerMetadata().byId(layerId);
      this._getMetadataModels(queryBuilder).then((meta) => {
        if (meta.content.length === 0) {
          return reject(`LayerMetadata ${layerId} not found.`);
        } else {
          let model = meta.content[0];
          if (meta && typeof meta.toArray === 'function') {
            model = meta.toArray()[0];
          }

          let mapLayer = createLayerFromMetadata(model, this.get('store'));
          mapLayer.set('index', index);
          mapLayer.set('map', this);
          let canBeBackground = mapLayer.get('settingsAsObject.backgroundSettings.canBeBackground');
          const layers = this.get('hierarchy');
          const layersInTree = this.get('otherLayers');
          const layerBackground = this.get('backgroundLayers');
          layers.addObject(mapLayer);
          if (canBeBackground) {
            if (!isNone(layerBackground)) {
              layerBackground.addObject(mapLayer);
            }
          } else {
            if (!isNone(layersInTree)) {
              layersInTree.addObject(mapLayer);
            }
          }

          let rootArray = this.get('mapLayer');
          rootArray.pushObject(mapLayer);
          if (isNone(index)) {
            setIndexes(rootArray, layers);
          }

          resolve(mapLayer);
        }
      });
    });
  }
});
