/**
  @module ember-flexberry-gis
*/

let checkMapZoomLayer = (layer) => {
  const mapZoom = layer.leafletMap.getZoom();
  const minZoom = layer.minZoom;
  const maxZoom = layer.maxZoom;
  return !mapZoom || !minZoom || !maxZoom || minZoom <= mapZoom && mapZoom <= maxZoom;
};

let checkMapZoom = (layer) => {
  const mapZoom = _getMapZoom(layer.leafletMap);
  const minZoom = _getLayerOption(layer, 'minZoom');
  const maxZoom = _getLayerOption(layer, 'maxZoom');
  return !mapZoom || !minZoom || !maxZoom || minZoom <= mapZoom && mapZoom <= maxZoom;
};

let checkMapZoomStyle = (leafletMap, rule) => {
  const mapZoom = _getMapZoom(leafletMap);
  const minZoom = _getLayerOption(rule, 'minZoom');
  const maxZoom = _getLayerOption(rule, 'maxZoom');
  return !mapZoom || !minZoom || !maxZoom || minZoom <= mapZoom && mapZoom <= maxZoom;
};

let _getMapZoom = (map) => {
  if (map && map.getZoom) {
    let _mapZoom = map.getZoom();
    let _animZoom = map._animateToZoom;
    if (map._animatingZoom && !isNaN(_animZoom) && _animZoom !== _mapZoom) {
      return Number(_animZoom.toFixed(1));
    }

    return Number(_mapZoom.toFixed(1));
  }

  return null;
};

let _getLayerOption = (layer, propName) => {
  let zoomResult = layer[propName];
  if (!zoomResult) {
    const parentLayers = layer._eventParents;
    for (var key in parentLayers) {
      zoomResult = parentLayers[key][propName];
      if (zoomResult) {
        return zoomResult;
      }
    }
  }

  return zoomResult;
};

export {
  checkMapZoom, checkMapZoomLayer, checkMapZoomStyle
};
