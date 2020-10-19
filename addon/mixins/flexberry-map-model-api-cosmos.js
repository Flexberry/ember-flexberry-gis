import Ember from 'ember';
import crsFactory4326 from 'ember-flexberry-gis/coordinate-reference-systems/epsg-4326';
import { Query } from 'ember-flexberry-data';

export default Ember.Mixin.create({
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
    let queryBuilder = new Query.Builder(this.get('store'))
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
    if (Ember.isNone(queryBuilder)) {
      return null;
    }

    return this.get('store').query(this.get('metadataModelName'), queryBuilder.build());
  },

  /**
    Finds layers by feature geometry and atributes. If 'feature' parameter is specified, then search condition is created by feature geometry
    which intersects layer's boundingBox. If 'atributes' parameter is specified, then search condition is created by combining attributes via OR,
    field for search is anyText. Adds search condition for Keyword 'cosmos'. All conditions are combined via AND.

    @method findCosmos.
    @param {Object} feature GeoJson Feature.
    @param {Array} atributes Array of search strings.
    @return {Promise} Array of layers models where feature geometry intersects layer's boundingBox and layers have desired atributes.
  */
  findCosmos(feature, atributes) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let filter = Ember.A();
      if (!Ember.isNone(feature)) {
        if (!feature.hasOwnProperty('crs')) {
          reject("Error: feature must have 'crs' attribute");
        }

        let crsName = feature.crs.properties.name;
        let knownCrs = Ember.getOwner(this).knownForType('coordinate-reference-system');
        let knownCrsArray = Ember.A(Object.values(knownCrs));
        let crsLayer = knownCrsArray.findBy('code', crsName).create();

        let coordsToLatLng = function (coords) {
          return crsLayer.unproject(L.point(coords));
        };

        let geoJSON = null;
        if (crsName !== 'EPSG:4326') {
          geoJSON = L.geoJSON(feature, { coordsToLatLng: coordsToLatLng.bind(this) });
        } else {
          geoJSON = L.geoJSON(feature);
        }

        let predicateBBox = new Query.GeographyPredicate('boundingBox');
        filter.push(predicateBBox.intersects(geoJSON.getLayers()[0].toEWKT(crsFactory4326.create())));
      }

      if (!Ember.isNone(atributes) && Ember.isArray(atributes)) {
        let equals = Ember.A();
        atributes.forEach((strSearch) => {
          equals.push(new Query.StringPredicate('anyText').contains(strSearch));
        });

        if (equals.length === 1) {
          filter.push(equals[0]);
        } else {
          filter.push(new Query.ComplexPredicate(Query.Condition.Or, ...equals));
        }
      }

      if (filter.length === 0) {
        reject('Error: failed to create a request condition');
      }

      let config = Ember.getOwner(this).resolveRegistration('config:environment');
      filter.push(new Query.StringPredicate('keyWords').contains(config.APP.keywordForCosmos));
      let condition = new Query.ComplexPredicate(Query.Condition.And, ...filter);
      let queryBuilder = this._getQueryBuilderLayerMetadata().where(condition);

      this._getMetadataModels(queryBuilder).then((meta) => {
        let models = meta;
        let result = [];
        if (meta && typeof meta.toArray === 'function') {
          models = meta.toArray();
        }

        models.forEach(model => {
          result.push(model);
        });

        resolve(result);
      }).catch((e) => {
        reject(e);
      });
    });
  }
});
