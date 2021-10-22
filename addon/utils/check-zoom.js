/**
  @module ember-flexberry-gis
*/

const checkMapZoomLayer = (layer) => {
  const mapZoom = layer.leafletMap.getZoom();
  const { minZoom, } = layer;
  const { maxZoom, } = layer;
  return !mapZoom || !minZoom || !maxZoom || minZoom <= mapZoom && mapZoom <= maxZoom;
};

const checkMapZoom = (layer) => {
  const mapZoom = _getMapZoom(layer.leafletMap);
  const minZoom = _getLayerOption(layer, 'minZoom');
  const maxZoom = _getLayerOption(layer, 'maxZoom');
  return !mapZoom || !minZoom || !maxZoom || minZoom <= mapZoom && mapZoom <= maxZoom;
};

let _getMapZoom = (map) => {
  if (map && map.getZoom) {
    const _mapZoom = map.getZoom();
    const _animZoom = map._animateToZoom;
    if (map._animatingZoom && !isNaN(_animZoom) && _animZoom !== _mapZoom) {
      return _animZoom;
    }

    return _mapZoom;
  }

  return null;
};

let _getLayerOption = (layer, propName) => {
  let zoomResult = layer[propName];
  if (!zoomResult) {
    const parentLayers = layer._eventParents;
    for (const key in parentLayers) {
      zoomResult = parentLayers[key][propName];
      if (zoomResult) {
        return zoomResult;
      }
    }
  }

  return zoomResult;
};

export {
  checkMapZoom, checkMapZoomLayer
};
