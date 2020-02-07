import Ember from 'ember';
import rhumbOperations from '../utils/rhumb-operations';
import { getLeafletCrs } from '../utils/leaflet-crs';

export default Ember.Mixin.create(rhumbOperations, {

  /**
    Add object to layer.

    @method addObjectToLayer
    @param {string} layerId Layer id.
    @param {string} crsName crs name.
    @param {Object} object Object.
    Example:
    var object = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[30, 10], [40, 40], [20, 40], [10, 20], [30, 10]]
        },
      properties: {
        name: 'test_polygon'
      }
    };
    @returns {Object} New featureLayer.
  */
  addObjectToLayer(layerId, object, crsName) {
    if (Ember.isNone(object)) {
      throw new Error('Passed object is null.');
    }

    let [layer, leafletObject] = this._getModelLayerFeature(layerId);

    if (Ember.isNone(layer)) {
      throw new Error('No layer with such id.');
    }

    let crs = leafletObject.options.crs;
    if (!Ember.isNone(crsName)) {
      crs = getLeafletCrs('{ "code": "' + crsName.toUpperCase() + '", "definition": "" }', this);
    }

    let coordsToLatLng = function(coords) {
      return crs.unproject(L.point(coords));
    };

    let geoJSON = null;
    if (crs.code !== 'EPSG:4326') {
      geoJSON = L.geoJSON(object, { coordsToLatLng: coordsToLatLng.bind(this) });
    } else {
      geoJSON = L.geoJSON(object);
    }

    let newObj = geoJSON.getLayers()[0];

    leafletObject.addLayer(newObj);

    newObj.layerId = layerId;

    return newObj;
  },

  /**
    Create polygon object by rhumb.

    @method createPolygonObjectRhumb
    @param {string} layerId Layer id.
    @param {Object} data Coordinate objects.
    Example:
    var data = {
          type: 'LineString',
          crs: 'EPSG:3857',
          properties: { name: 'test_polygon' },
          startPoint: [85, 79],
          points: [
            { rib: '1;2', rhumb: 'ЮВ;86.76787457562546', distance: 8182.6375760837955 },
            { rib: '2;3', rhumb: 'СВ;79.04259420114585', distance: 8476.868426796427 },
            { rib: '3;1', rhumb: 'ЮЗ;86.0047147391561', distance: 16532.122718537685 }
          ]
        };
    @returns {Object} New featureLayer.
  */
  createPolygonObjectRhumb(layerId, data) {
    let [, leafletObject, featureLayer] = this._getModelLayerFeature(layerId);
    const obj = this.createObjectRhumb(data, leafletObject.options.crs, this);
    return this.addObjectToLayer(layerId, obj, data.crs);
  }

});
