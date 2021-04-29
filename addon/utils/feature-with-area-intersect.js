import Ember from 'ember';
import jsts from 'npm:jsts';

/**
    Calculate intersection of geoLayer with featureA geometry and set area of that intersection to geoLayer.properties.intersectionArea

    @param {GeoJSON} featureA Layer id.
    @param {geoLayer}
    @param {leafletLayer}
    @param {mapModel}
    @returns geoLayer
    @private
  */
export default function featureWithAreaIntersect(featureA, geoLayer, leafletLayer, mapModel, scale) {
  if (leafletLayer instanceof L.Polygon) {
    let objB = geoLayer;
    let precisionModel = new jsts.geom.PrecisionModel(scale);
    let featureB = leafletLayer.options.crs.code === 'EPSG:4326' ? objB : mapModel._convertObjectCoordinates(leafletLayer.options.crs.code, objB);
    let geojsonReader = new jsts.io.GeoJSONReader();
    let objAJsts = geojsonReader.read(featureA.geometry);
    let objBJsts = geojsonReader.read(featureB.geometry);
    let objAJstsScaled = new jsts.precision.GeometryPrecisionReducer(precisionModel).reduce(objAJsts);
    let objBJstsScaled = new jsts.precision.GeometryPrecisionReducer(precisionModel).reduce(objBJsts);
    let intersected = objAJstsScaled.intersection(objBJstsScaled);
    let geojsonWriter = new jsts.io.GeoJSONWriter();
    let intersectionRes = geojsonWriter.write(intersected);
    if (intersectionRes) {
      let intersectArea = intersected.getArea();
      if (!Ember.isNone(geoLayer.properties)) {
        geoLayer.properties.intersectionArea = intersectArea;
      } else {
        geoLayer.properties = { intersectionArea: intersectArea };
      }
    }
  }

  return geoLayer;
}

/**
 * Calculate intersection area of two geoJson features, features should be in same crs
 *
 * @param {GeoJSON} geoJsonA
 * @param {GeoJSON} geoJsonB
 * @returns {double} area of intersection of features in measure units of coordinate references systems
*/
export function intersectionArea(geoJsonA, geoJsonB, scale) {
  let geojsonReader = new jsts.io.GeoJSONReader();
  let precisionModel = new jsts.geom.PrecisionModel(scale); // number - scale
  let objAJsts = geojsonReader.read(geoJsonA.geometry);
  let objBJsts = geojsonReader.read(geoJsonB.geometry);
  let objAJstsScaled = new jsts.precision.GeometryPrecisionReducer(precisionModel).reduce(objAJsts);
  let objBJstsScaled = new jsts.precision.GeometryPrecisionReducer(precisionModel).reduce(objBJsts);

  let intersected = objAJstsScaled.intersection(objBJstsScaled);
  return intersected.getArea();
}
