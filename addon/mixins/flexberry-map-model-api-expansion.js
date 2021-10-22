import { Promise, allSettled } from 'rsvp';
import { A } from '@ember/array';
import { isNone } from '@ember/utils';
import Mixin from '@ember/object/mixin';
import jsts from 'npm:jsts';
import rhumbOperations from '../utils/rhumb-operations';
import { getLeafletCrs } from '../utils/leaflet-crs';
import { geometryToJsts } from '../utils/layer-to-jsts';

export default Mixin.create(rhumbOperations, {

  /**
    Add object to layer.

    @method addObjectToLayer
    @param {string} layerId Layer ID.
    @param {string} crsName Name of coordinate reference system, in which to give coordinates.
    @param {GeoJson} object geoJson object that should be added to specified layer.
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
    if (isNone(object)) {
      throw new Error('Passed object is null.');
    }

    const [layer, leafletObject] = this._getModelLeafletObject(layerId);

    if (isNone(layer)) {
      throw new Error('No layer with such id.');
    }

    let { crs, } = leafletObject.options;
    if (!isNone(crsName)) {
      crs = getLeafletCrs(`{ "code": "${crsName.toUpperCase()}", "definition": "" }`, this);
    }

    const coordsToLatLng = function (coords) {
      return crs.unproject(L.point(coords));
    };

    let geoJSON = null;
    if (crs.code !== 'EPSG:4326') {
      geoJSON = L.geoJSON(object, { coordsToLatLng: coordsToLatLng.bind(this), });
    } else {
      geoJSON = L.geoJSON(object);
    }

    const newObj = geoJSON.getLayers()[0];

    const e = { layers: [newObj], results: A(), };
    leafletObject.fire('load', e);

    return new Promise((resolve, reject) => {
      allSettled(e.results).then(() => {
        newObj.layerId = layerId;
        resolve(newObj);
      });
    });
  },

  /**
    Create multi-circuit object. Transforms geometries into JSTS objects. Checks whether types and crs are same.
    If geometries intersects, it unions or differents geometries depending on the parameter isUnion.
    After that, it merges all geometries that don't intersects. Using GeoJSONWriter converts jsts object to geoJSON.

    Example of method call:
    ```javascript
    let objects = [
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [[56.18425, 58.07197],
                [56.21068, 58.07197],
                [56.21068, 58.07987],
                [56.18425, 58.07987],
                [56.18425, 58.07197]]
            ]
          },
          "crs": {
            "type": "name",
            "properties": {
              "name": "EPSG:4326"
            }
          }
        },
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [[56.19712, 58.06770],
                [56.22322, 58.06770],
                [56.22322, 58.07551],
                [56.19712, 58.07551],
                [56.19712, 58.06770]]
            ]
          },
          "crs": {
            "type": "name",
            "properties": {
              "name": "EPSG:4326"
            }
          }
        },
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [[56.21644, 58.07864],
                [56.23197, 58.07864],
                [56.23197, 58.08608],
                [56.21644, 58.08608],
                [56.21644, 58.07864]]
            ]
          },
          "crs": {
            "type": "name",
            "properties": {
              "name": "EPSG:4326"
            }
          }
        }];
    var result = mapApi.mapModel.createMulti(objects, true);
    ```

    @method createMulti
    @param {array} objects Array of objects in GeoJSON format.
    @param {Boolean} isUnion Flag: indicates whether to union geometries or to different.
    @param {Boolean} failIfInvalid Flag: indicates whether to throw error if invalid geometries.
    @param {Boolean} forceMulti Flag: indicates whether to make geometries as multi.
    @returns {Object} New multi-circuit object in GeoJSO format.
  */
  createMulti(objects, isUnion = false, failIfInvalid = true, forceMulti = true) {
    return this._getMulti(objects, isUnion, failIfInvalid, true, forceMulti);
  },

  _getMulti(objects, isUnion = false, failIfInvalid = true, isJsts = false, forceMulti = true) {
    const separateObjects = [];
    let resultObject = null;
    const geometries = [];
    const scale = this.get('mapApi').getFromApi('precisionScale');
    objects.forEach((element, i) => {
      let g = element;
      if (isJsts) {
        g = geometryToJsts(element.geometry, scale);
        g.setSRID(element.crs.properties.name.split(':')[1]);
      }

      if (g.isValid()) {
        geometries.push(g);
        const j = geometries.length - 1;
        if (j !== 0 && this.getGeometryKind(geometries[j]) !== this.getGeometryKind(geometries[j - 1])) {
          throw 'error: type mismatch. Objects must have the same type';
        } else if (j !== 0 && geometries[j].getSRID() !== geometries[j - 1].getSRID()) {
          throw 'error: CRS mismatch. Objects must have the same crs';
        }
      } else if (failIfInvalid) {
        throw 'error: invalid geometry';
      }
    });

    // check the intersections and calculate the difference between objects
    for (let i = 0; i < geometries.length; i++) {
      let current = geometries[i];
      for (let j = 0; j < geometries.length; j++) {
        if (i !== j) {
          if (geometries[i].intersects(geometries[j])) {
            if (isUnion) {
              current = current.union(geometries[j]);
            } else {
              current = current.difference(geometries[j]);
            }
          }
        }
      }

      separateObjects.push(current);
    }

    if (separateObjects.length === 0) {
      return null;
    }

    // union the objects
    separateObjects.forEach((element, i) => {
      if (i === 0) {
        resultObject = element;
      } else {
        resultObject = resultObject.union(element);
      }
    });

    const geojsonWriter = new jsts.io.GeoJSONWriter();
    const unionres = geojsonWriter.write(resultObject);
    const crsResult = `EPSG:${isNone(geometries) ? '' : geometries[0].getSRID()}`;

    let { type, } = unionres;
    let { coordinates, } = unionres;
    if (unionres.type.indexOf('Multi') < 0 && forceMulti) {
      type = `Multi${unionres.type}`;
      coordinates = [unionres.coordinates];
    }

    const multiObj = {
      type: 'Feature',
      geometry: {
        type,
        coordinates,
      },
      crs: {
        type: 'name',
        properties: {
          name: crsResult,
        },
      },
    };

    return multiObj;
  },

  /**
    Get geometry kind by geometry
    @param {geometry} g geometry
    @returns {int} kind
  */
  getGeometryKind(g) {
    const type = g.getGeometryType();

    switch (type) {
      case 'Polygon':
      case 'MultiPolygon':
        return 1;
      case 'LineString':
      case 'MultiLineString':
        return 2;
      case 'Point':
        return 3;
    }

    return 0;
  },

  /**
    Create object by rhumb for [LineString, Polygon]. Start point coordinates convert in crs of layer.
    Accepts angles in degrees, converting them to radians. Accepts names of direction is [NE, SE, NW, SW].
    Accepts distance in units accepted for CRS of layer. Calculation rhumb by point, distance and angle.
    Returns coordinates skipping 'skip' from the first rhumb in crs of layer.

    @method createPolygonObjectRhumb
    @param {string} layerId Layer id.
    @param {Object} data Rhumbs parameters.
    Example:
    var data = {
          type: 'LineString',
          crs: 'EPSG:3857',
          properties: { name: 'test_polygon' },
          startPoint: [85, 79],
          skip:0,
          points: [
            { rhumb: 'SE', angle: 86.76787457562546, distance: 8182.6375760837955 },
            { rhumb: 'NE', angle: 79.04259420114585, distance: 8476.868426796427 },
            { rhumb: 'SW', angle: 86.0047147391561, distance: 16532.122718537685 }
          ]
        };
    @returns {Object} New GeoJSON Feature in crs of layer.
  */
  createPolygonObjectRhumb(layerId, data) {
    const [, leafletObject] = this._getModelLeafletObject(layerId);
    const obj = this.createObjectRhumb(data, leafletObject.options.crs, this);

    return obj;
  },

  /**
    Create polyline object to interserct polyline to polygon. Transforms geometries into JSTS objects. Checks whether types and crs are same.
    Intersects of two objects is the desired line. Using GeoJSONWriter converts jsts object to geoJSON.

    Example of method call:
    ```javascript
    let aGeoJson = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [[56.184253, 58.071975],
            [56.210689,58.071975],
            [56.2106895, 58.079873],
            [56.184253, 58.079873],
            [56.184253,58.071975]]
        ]
      },
      "crs": {
        "type": "name",
        "properties": {
          "name": "EPSG:4326"
        }
      }
    };
    let bGeoJson = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [56.17, 58.071975],
          [56.22, 58.071975]
        ]
      },
      "crs": {
        "type": "name",
        "properties": {
          "name": "EPSG:4326"
        }
      }
    };
    let result = mapApi.mapModel.trimLineToPolygon(aGeoJson, bGeoJson);
    ```

    @method trimLineToPolygon
    @param {object} polygonGeoJson Polygon object in GeoJSON format.
    @param {object} lineGeom Polyline object in GeoJSON format.
    @returns {Promise} New polyline from intersecr two objects in GeoJSON format.
  */
  trimLineToPolygon(polygonGeoJson, lineGeoJson) {
    return new Promise((resolve, reject) => {
      let resultObject = null;

      const polygonGeom = geometryToJsts(polygonGeoJson.geometry);
      polygonGeom.setSRID(polygonGeoJson.crs.properties.name.split(':')[1]);
      const lineGeom = geometryToJsts(lineGeoJson.geometry);
      lineGeom.setSRID(lineGeoJson.crs.properties.name.split(':')[1]);
      if (polygonGeom.isValid() && lineGeom.isValid()) {
        if (polygonGeom.getSRID() !== lineGeom.getSRID()) {
          reject('CRS mismatch. Objects must have the same crs');
          return;
        }
      } else {
        reject('invalid geometry');
        return;
      }

      resultObject = lineGeom.intersection(polygonGeom);

      const geojsonWriter = new jsts.io.GeoJSONWriter();
      const intersectionRes = geojsonWriter.write(resultObject);
      if (intersectionRes.coordinates.length === 0) {
        reject('objects does\' not intersect');
        return;
      }

      const crsResult = `EPSG:${lineGeom.getSRID()}`;

      const intersectObj = {
        type: 'Feature',
        geometry: {
          type: intersectionRes.type,
          coordinates: intersectionRes.coordinates,
        },
        crs: {
          type: 'name',
          properties: {
            name: crsResult,
          },
        },
      };

      resolve(intersectObj);
    });
  },
});
