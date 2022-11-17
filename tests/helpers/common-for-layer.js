import Ember from 'ember';

export default function createLeafletMap() {
  let bounds = L.latLngBounds(L.latLng(58.4436454695997, 56.369991302490234), L.latLng(58.46793791815783, 56.53478622436524));

  let getBounds = function() {
    return bounds;
  };

  let getPane = function() {
    return undefined;
  };

  let createPane = function() {
    return {};
  };

  let hasLayer = function() {
    return true;
  };

  let removeLayer = function() {
    return {};
  };

  let leafletMap = L.map(document.createElement('div'));
  leafletMap.getBounds = getBounds;
  leafletMap.getPane = getPane;
  leafletMap.createPane = createPane;
  leafletMap.removeLayer = removeLayer;
  leafletMap.hasLayer = hasLayer;
  let editTools = new L.Editable(leafletMap);
  Ember.set(leafletMap, 'editTools', editTools);

  return leafletMap;
}
