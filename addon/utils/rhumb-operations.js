/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import rhumbBearing from 'npm:@turf/rhumb-bearing';
import rhumbDistance from 'npm:@turf/rhumb-distance';

/**
  Builds leaflet coordinate reference system (CRS).

  @for Utils.Layers
  @method getLeafletCrs
  @param {String} coordinateReferenceSystem Serialized JSON with the following structure: { code: '...', definition: '...' },
        'code' is necessary CRS code, 'definition' is optional CRS definition in Proj4 format.
  @param {String} context Ember object with available getOwner method.

  Usage:
  controllers/my-form.js
  ```javascript
    import { getLeafletCrs } from 'ember-flexberry-gis/utils/leaflet-crs'l
    let crs = getLeafletCrs('{ code: "ESPG:3857", definition: "" }', this)

  ```
*/

/**
  Get the object thumb.

  @method  getRhumb
  @param {string} layerId Layer id.
  @param {string} objectId Object id.
  @return {array} Table rhumb.
*/
const getRhumb = (mapLayer, mapApi, layerId, objectId) => {
  // const layer = this.get('mapLayer').findBy('id', layerId);
  const layer = mapLayer.findBy('id', layerId);
  const leafletObject = Ember.get(layer, '_leafletObject');

  var cors;
  leafletObject.eachLayer(function (object) {
    const id = this.getLayerFeatureId(mapApi, layer, object);
    if (!Ember.isNone(id) && objectId === id) {
      cors = object._latlngs;
    }
  }.bind(this));

  if (Ember.isNone(cors)) {
    throw new Error('Object not found');
  }

  let result = [];

  var rowPush = function (vertexNum1, vertexNum2, point1, point2) {
    const pointFrom = helpers.point([point2.lat, point2.lng]);
    const pointTo = helpers.point([point1.lat, point1.lng]);

    // We get the distance and translate into meters.
    const distance = rhumbDistance.default(pointFrom, pointTo, { units: 'kilometers' }) * 1000;

    // Get the angle.
    const bearing = rhumbBearing.default(pointFrom, pointTo);

    let rhumb;

    // Calculates rhumb.
    if (bearing < -90 && bearing > -180) {
      // СВ
      rhumb = 'СВ;' + (Math.abs(bearing) - 90);
    } else if (bearing <= 180 && bearing > 90) {
      // ЮВ
      rhumb = 'ЮВ;' + (bearing - 90);
    } else if (bearing <= 90 && bearing > 0) {
      // ЮЗ
      rhumb = 'ЮЗ;' + (90 - bearing);
    } if (bearing <= 0 && bearing >= -90) {
      // СЗ
      rhumb = 'СЗ;' + Math.abs(-90 - bearing);
    }

    return {
      rib: `${vertexNum1 + 1};${vertexNum2 + 1}`,
      rhumb: rhumb,
      distance: distance
    };
  };

  let startPoint = null;
  for (let i = 0; i < cors.length; i++) {
    for (let j = 0; j < cors[i].length; j++) {
      let n;
      let point1;
      let point2;
      let item = cors[i][j];

      // Polygon.
      if (!Ember.isNone(item.length)) {
        for (let k = 0; k < item.length; k++) {
          startPoint = k === 0 ? item[k] : startPoint;
          point1 = item[k];
          n = !Ember.isNone(item[k + 1]) ? k + 1 : 0;
          point2 = item[n];

          result.push(rowPush(k, n, point1, point2));
        }

        // LineString.
      } else {
        startPoint = j === 0 ? item : startPoint;
        point1 = item;
        n = !Ember.isNone(cors[i][j + 1]) ? j + 1 : 0;
        point2 = cors[i][n];

        result.push(rowPush(j, n, point1, point2));
      }
    }
  }

  return {
    startPoint: startPoint,
    coordinates: result
  };
};

/**
  Get object id by object and layer.

  @method _getLayerFeatureId
  @param {Object} mapApi Map Api.
  @param {Object} layer Layer.
  @param {Object} layerObject Object.
  @return {number} Id object.
*/
const getLayerFeatureId = (mapApi, layer, layerObject) => {
  // const getLayerFeatureId = this.get('mapApi').getFromApi('getLayerFeatureId');
  const getLayerFeatureId = mapApi.getFromApi('getLayerFeatureId');
  if (typeof getLayerFeatureId === 'function') {
    return getLayerFeatureId(layer, layerObject);
  }

  return Ember.get(layerObject, 'feature.id');
};


export {
  getRhumb,
  getLayerFeatureId
};
