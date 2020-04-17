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
  const mapZoom = _getMapZoom(layer._map);
  const minZoom = _getLayerOption(layer, 'minZoom');
  const maxZoom = _getLayerOption(layer, 'maxZoom');
  return !mapZoom || !minZoom || !maxZoom || minZoom <= mapZoom && mapZoom <= maxZoom;
};

let _getMapZoom = (map) => {
  if (map && map.getZoom) {
    return map.getZoom();
  }

  return null;
};

let _getLayerOption = (layer, propName) => {
  let zoomResult = layer[propName];
  if (!zoomResult) {
    for (var key in layer._eventParents) {
      zoomResult = parentLayer[key][propName];
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
