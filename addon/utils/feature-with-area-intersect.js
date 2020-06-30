import jsts from 'npm:jsts';
import area from 'npm:@turf/area';

export default function featureWithAreaIntersect(featureA, geoLayer, leafletLayer, mapModel) {
  let objB = geoLayer;
  let featureB = leafletLayer.options.crs.code === 'EPSG:4326' ? objB : mapModel._convertObjectCoordinates(leafletLayer.options.crs.code, objB);
  let geojsonReader = new jsts.io.GeoJSONReader();
  let objAJsts = geojsonReader.read(featureA.geometry);
  let objBJsts = geojsonReader.read(featureB.geometry);
  let intersected = objAJsts.intersection(objBJsts);
  let geojsonWriter = new jsts.io.GeoJSONWriter();
  let intersectionRes = geojsonWriter.write(intersected);
  if (intersectionRes) {
    geoLayer.intesectionArea = area(intersectionRes);
  }

  return geoLayer;
}
