import Ember from 'ember';
import jsts from 'npm:jsts';
import area from 'npm:@turf/area';

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
      let intesectArea = area(intersectionRes);
      if (!Ember.isNone(geoLayer.properties)) {
        geoLayer.properties.intesectionArea = intesectArea;
      } else {
        geoLayer.properties = { intesectionArea: intesectArea };
      }
    }
  }

  return geoLayer;
}
