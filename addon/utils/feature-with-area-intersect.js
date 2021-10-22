import { isNone } from '@ember/utils';
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
    const objB = geoLayer;
    const precisionModel = new jsts.geom.PrecisionModel(scale);
    const featureB = leafletLayer.options.crs.code === 'EPSG:4326' ? objB : mapModel._convertObjectCoordinates(leafletLayer.options.crs.code, objB);
    const geojsonReader = new jsts.io.GeoJSONReader();
    const objAJsts = geojsonReader.read(featureA.geometry);
    const objBJsts = geojsonReader.read(featureB.geometry);
    const objAJstsScaled = new jsts.precision.GeometryPrecisionReducer(precisionModel).reduce(objAJsts);
    const objBJstsScaled = new jsts.precision.GeometryPrecisionReducer(precisionModel).reduce(objBJsts);
    const intersected = objAJstsScaled.intersection(objBJstsScaled);
    const geojsonWriter = new jsts.io.GeoJSONWriter();
    const intersectionRes = geojsonWriter.write(intersected);
    if (intersectionRes) {
      const intersectArea = intersected.getArea();
      if (!isNone(geoLayer.properties)) {
        geoLayer.properties.intersectionArea = intersectArea;
      } else {
        geoLayer.properties = { intersectionArea: intersectArea, };
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
  const geojsonReader = new jsts.io.GeoJSONReader();
  const precisionModel = new jsts.geom.PrecisionModel(scale); // number - scale
  const objAJsts = geojsonReader.read(geoJsonA.geometry);
  const objBJsts = geojsonReader.read(geoJsonB.geometry);
  const objAJstsScaled = new jsts.precision.GeometryPrecisionReducer(precisionModel).reduce(objAJsts);
  const objBJstsScaled = new jsts.precision.GeometryPrecisionReducer(precisionModel).reduce(objBJsts);

  const intersected = objAJstsScaled.intersection(objBJstsScaled);
  return intersected.getArea();
}
