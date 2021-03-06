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
export default function featureWithAreaIntersect(featureA, geoLayer, leafletLayer, mapModel) {
  if (leafletLayer instanceof L.Polygon) {
    let objB = geoLayer;
    let featureB = leafletLayer.options.crs.code === 'EPSG:4326' ? objB : mapModel._convertObjectCoordinates(leafletLayer.options.crs.code, objB);
    let geojsonReader = new jsts.io.GeoJSONReader();
    let objAJsts = geojsonReader.read(featureA.geometry);
    let objBJsts = geojsonReader.read(featureB.geometry);
    let intersected = objAJsts.intersection(objBJsts);
    let geojsonWriter = new jsts.io.GeoJSONWriter();
    let intersectionRes = geojsonWriter.write(intersected);
    if (intersectionRes) {
      let intersectArea = intersected.geometry.getArea();
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
export function intersectionArea(geoJsonA, geoJsonB) {
  let geojsonReader = new jsts.io.GeoJSONReader();
  let objAJsts = geojsonReader.read(geoJsonA.geometry);
  let objBJsts = geojsonReader.read(geoJsonB.geometry);
  let intersected = objAJsts.intersection(objBJsts);
  return intersected.getArea();
}
