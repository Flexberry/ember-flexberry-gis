import Ember from 'ember';

/**
  Zoom map to bounds
  @method actions.zoomTo
  @param {Object} bounds Bounds which to bring closer.
  @param {Object} leafletMap Map.
  @param {Object} leafletObject Layer.
*/
let zoomToBounds = function (bounds, leafletMap, minZoom, maxZoom) {

  let sidebarElement = Ember.$('div[class*="sidebar-wrapper"].visible .sidebar');
  const widthPadding = sidebarElement.width() || 0;

  let bboxZoom = leafletMap.getBoundsZoom(bounds);
  minZoom = Number.parseInt(minZoom);
  maxZoom = Number.parseInt(maxZoom);
  let zoom = leafletMap.getBoundsZoom(bounds.pad(1));
  if (!isNaN(minZoom) && minZoom >= bboxZoom && (isNaN(maxZoom) || maxZoom >= bboxZoom)) {
    zoom = minZoom;
  } else if (!isNaN(maxZoom) && maxZoom < bboxZoom) {
    zoom = maxZoom;
  } else {
    bounds = bounds.pad(1);
  }

  fitBounds(leafletMap, bounds, { paddingTopLeft: [widthPadding, 0], maxZoom: zoom });
};

// Overwrites, because L.Map._getBoundsCenterZoom return min zoom from zoom of bounds and maxZoom from options.
let fitBounds = function (leafletMap, bounds, options) {
  if (!(bounds instanceof L.LatLngBounds) || Ember.isNone(leafletMap)) {
    return;
  }

  if (!bounds.isValid()) {
    throw new Error('Bounds are not valid.');
  }

  // стандартный L.Map._getBoundsCenterZoom возьмет минимальный zoom из полученного из Bounds и переданного в options
  // но нам это не подходит, т.к. при maxzoom, большем чем полученный из bounds, неправильно вычисляется сдвиг
  let getBoundsCenterZoom = (leafletMap, bounds, options) => {
    let toPoint = (coord) => {
      return new L.Point(coord[0], coord[1]);
    };

    let paddingTL = toPoint(options.paddingTopLeft || [0, 0]);
    let paddingBR = toPoint([0, 0]);
    let zoom = options.maxZoom;

    let paddingOffset = paddingBR.subtract(paddingTL).divideBy(2);
    let swPoint = leafletMap.project(bounds.getSouthWest(), zoom);
    let nePoint = leafletMap.project(bounds.getNorthEast(), zoom);
    let center = leafletMap.unproject(swPoint.add(nePoint).divideBy(2).add(paddingOffset), zoom);

    return {
      center: center,
      zoom: zoom
    };
  };

  let target = getBoundsCenterZoom(leafletMap, bounds, options);
  return leafletMap.setView(target.center, target.zoom);
};

export {
  zoomToBounds,
  fitBounds
};
