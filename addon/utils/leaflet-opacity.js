/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

let maxGeometryOpacity = 0.65;

let maxGeometryFillOpacity = 0.2;

/**
  Sets specified opacity for the specified leaflet layer.

  @for Utils.LeafletOpacity
  @method setLeafletLayerOpacity
  @param {Object} options Method options.
  @param {<a href="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>} options.leafletLayer Leaflet layer which opacity must be changed.
  @param {Number} options.opacity Opacity value.
  @param {Number} [options.maxGeomOpacity] Max opacity value for geometries.
  @param {Number} [options.maxGeomFillOpacity] Max fill opacity value for geometries.
*/
let setLeafletLayerOpacity = function({ leafletLayer, opacity,
  maxGeomOpacity = maxGeometryOpacity, maxGeomFillOpacity = maxGeometryFillOpacity }) {
  if (typeof leafletLayer.setOpacity === 'function') {
    leafletLayer.setOpacity(opacity);
  } else if (typeof leafletLayer.setStyle === 'function') {
    let style = Ember.get(leafletLayer, 'options.style') || {};
    if (typeof style === 'function') {
      let opacityFromFunction = 1;
      if (leafletLayer.feature) {
        let styleFromFunction = style(leafletLayer.feature) || {};
        opacityFromFunction = styleFromFunction.opacity || 1;
      }

      leafletLayer.setStyle({ opacity: opacity * maxGeomOpacity * opacityFromFunction, fillOpacity: opacity * maxGeomFillOpacity * opacityFromFunction });
    } else {
      leafletLayer.setStyle({ opacity: opacity, fillOpacity: opacity });
    }
  }

  if (leafletLayer instanceof L.MarkerClusterGroup) {
    setLeafletLayerOpacity({ leafletLayer: Ember.get(leafletLayer, '_featureGroup'), opacity, maxGeomOpacity, maxGeomFillOpacity });
  }

  if (typeof leafletLayer.eachLayer === 'function') {
    leafletLayer.eachLayer((nestedLeafletLayer) => {
      setLeafletLayerOpacity({ leafletLayer: nestedLeafletLayer, opacity, maxGeomOpacity, maxGeomFillOpacity });
    });
  }
};

export {
  setLeafletLayerOpacity, maxGeometryOpacity
};
