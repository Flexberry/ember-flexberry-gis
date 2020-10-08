import Ember from 'ember';
import jsts from 'npm:jsts';
import crsFactory4326 from 'ember-flexberry-gis/coordinate-reference-systems/epsg-4326';
import { Query } from 'ember-flexberry-data';

export default Ember.Mixin.create({
  /**
    Produces metadata loading request cosmos.
  */
  _getMetadataCosmos() {
    let metadataProjection = 'LayerMetadataE';
    let metadataModelName = 'new-platform-flexberry-g-i-s-layer-metadata';
    //let condition = new Query.StringPredicate('keywords').contains('cosmos')
    let queryBuilder = new Query.Builder(this.get('store'))
    .from(metadataModelName)
    .selectByProjection(metadataProjection);
    //.where(condition);

    return this.get('store').query(metadataModelName, queryBuilder.build());
  },

  /*
    Shows layers specified by IDs.

    @method findCosmos.
    @param {Object} feature Array of layer IDs.
    @return nothing
  */
  findCosmos(feature) {
    let crsName = feature.crs.properties.name;
    if (Ember.isNone(crsName)) {
      return "Error: feature must have 'crs' attribute";
    }

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

    let jstsGeoJSONReader = new jsts.io.GeoJSONReader();
    let featureLayerGeoJSON = geoJSON.toProjectedGeoJSON(crsFactory4326.create());
    let jstsGeoJSON = jstsGeoJSONReader.read(feature);
    const cosmos = this.get('layerMetadata').filter((layer) => {
      if (layer.get('keywords').indexOf('cosmos') !== -1 ) {
        let bbox = layer.get('boundingbox');

      }
    });
  },

  /**
    Returns layerMetadata model thats corresponds to passed layerId.

    @method getLayerMetadata
    @param {String} layerId Layer ID
    @returns {Promisse} layerMetadata model
  */
  getLayerMetadata(layerId) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      this._getMetadataCosmos().then((meta) => {
        const layer = meta.content.findBy('id', layerId);
        if (Ember.isNone(layer)) {
          reject(`Layer metadata '${layerId}' not found`);
        }

        resolve(layer);
      }).catch((e) => {
        reject(e);
      });
    });
  },
});
