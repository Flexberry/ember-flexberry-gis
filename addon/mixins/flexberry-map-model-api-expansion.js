import Ember from 'ember';
import rhumbOperations from '../utils/rhumb-operations';
import { getLeafletCrs } from '../utils/leaflet-crs';
import jsts from 'npm:jsts';

export default Ember.Mixin.create(rhumbOperations, {

  /**
    Add object to layer.

    @method addObjectToLayer
    @param {string} layerId Layer ID.
    @param {string} crsName Name of coordinate reference system, in which to give coordinates.
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

    let [layer, leafletObject] = this._getModelLeafletObject(layerId);

    if (Ember.isNone(layer)) {
      throw new Error('No layer with such id.');
    }

    let crs = leafletObject.options.crs;
    if (!Ember.isNone(crsName)) {
      crs = getLeafletCrs('{ "code": "' + crsName.toUpperCase() + '", "definition": "" }', this);
    }

    let coordsToLatLng = function (coords) {
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
    Create multi-circuit object.

    @method createMulti
    @param {array} objects Array of objects to union.
    Example:
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
    @returns {Object} new multi-circuit object.
  */
  createMulti(objects, failIfInvalid = true) {
    let geojsonReader = new jsts.io.GeoJSONReader();
    let geojsonWriter = new jsts.io.GeoJSONWriter();
    let geometries = [];
    let separateObjects = [];
    let resultObject = null;

    if (objects.length === 0) {
      throw 'error: data is empty';
    } else if (objects.length === 1) {
      return objects[0];
    }

    objects.forEach((element, i) => {
      if (!Ember.isNone(element.crs)) {
        objects[i] =
          element.crs.properties.name.toUpperCase() === 'EPSG:4326' ? element
          : this._convertObjectCoordinates(element.crs.properties.name.toUpperCase(), element);
      } else {
        throw "error: object must have 'crs' attribute";
      }
    }, this);

    //read the geometry of features
    objects.forEach((element, i) => {
      let g = geojsonReader.read(element.geometry);

      if (g.isValid()) {
        geometries.push(g);
        let j = geometries.length - 1;
        if (j !== 0 && this.getGeometryKind(geometries[j]) !== this.getGeometryKind(geometries[j - 1])) {
          throw 'error: type mismatch. Objects must have the same type';
        }
      } else {
        console.error('invalid geometry (object ' + i + ')');
        console.error(element.geometry);

        if (failIfInvalid) {
          throw 'error: invalid geometry';
        }
      }
    });

    //check the intersections and calculate the difference between objects
    for (let i = 0; i < geometries.length; i++) {
      let current = geometries[i];
      for (var j = 0; j < geometries.length; j++) {
        if (i !== j) {
          if (geometries[i].intersects(geometries[j])) {
            current = current.difference(geometries[j]);
          }
        }
      }

      separateObjects.push(current);
    }

    if (separateObjects.length === 0) {
      return null;
    }

    //union the objects
    separateObjects.forEach((element, i) => {
      if (i === 0) {
        resultObject = element;
      } else {
        resultObject = resultObject.union(element);
      }
    });

    let unionres = geojsonWriter.write(resultObject);

    const multiObj = {
      type: 'Feature',
      geometry: {
        type: unionres.type,
        coordinates: unionres.coordinates
      },
      crs: {
        type: 'name',
        properties: {
          name: 'EPSG:4326'
        }
      }
    };

    return multiObj;
  },

  /**
    Get geometry kind by geometry
    @param {geometry} g geometry
    @returns {int} kind
  */
  getGeometryKind(g) {
    let type = g.getGeometryType();

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
    Create Object by rhumb.

    @method createPolygonObjectRhumb
    @param {string} layerId Layer id.
    @param {Object} data Coordinate objects.
    Example:
    var data = {
          type: 'LineString',
          crs: 'EPSG:3857',
          properties: { name: 'test_polygon' },
          startPoint: [85, 79],
          skip:0,
          points: [
            { rhumb: 'ЮВ', angle: 86.76787457562546, distance: 8182.6375760837955 },
            { rhumb: 'СВ', angle: 79.04259420114585, distance: 8476.868426796427 },
            { rhumb: 'ЮЗ', angle: 86.0047147391561, distance: 16532.122718537685 }
          ]
        };
    @returns {Object} New GeoJSON Feature.
  */
  createPolygonObjectRhumb(layerId, data) {
    let [, leafletObject] = this._getModelLeafletObject(layerId);
    const obj = this.createObjectRhumb(data, leafletObject.options.crs, this);

    return obj;
  }
});
