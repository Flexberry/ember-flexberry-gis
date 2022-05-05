import { isNone } from '@ember/utils';
import $ from 'jquery';

/**
  Zoom map to bounds
  @method actions.zoomTo
  @param {Object} bounds Bounds which to bring closer.
  @param {Object} leafletMap Map.
  @param {Object} leafletObject Layer.
*/
const zoomToBounds = function (bounds, leafletMap, minZoom, maxZoom) {
  const sidebarElement = $('div[class*="sidebar-wrapper"].visible .sidebar');
  const widthPadding = sidebarElement.width() || 0;

  const bboxZoom = leafletMap.getBoundsZoom(bounds);
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

  fitBounds(leafletMap, bounds, { paddingTopLeft: [widthPadding, 0], maxZoom: zoom, });
};

// Overwrites, because L.Map._getBoundsCenterZoom return min zoom from zoom of bounds and maxZoom from options.
let fitBounds = function (leafletMap, bounds, options) {
  if (!(bounds instanceof L.LatLngBounds) || isNone(leafletMap)) {
    return;
  }

  if (!bounds.isValid()) {
    throw new Error('Bounds are not valid.');
  }

  const target = leafletMap._getBoundsCenterZoom(bounds, options);
  return leafletMap.setView(target.center, options.maxZoom, options);
};

export {
  zoomToBounds,
  fitBounds
};