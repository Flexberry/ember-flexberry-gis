/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Sets specified opacity for the specified leaflet layer.

  @for Utils.LeafletOpacity
  @method setLeafletLayerOpacity
  @param {Object} options Method options.
  @param {<a href="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>} options.leafletLayer Leaflet layer which opacity must be changed.
  @param {Number} options.opacity Opacity value.
*/
let setLeafletLayerOpacity = function({ leafletLayer, opacity }) {
  if (typeof leafletLayer.setOpacity === 'function') {
    leafletLayer.setOpacity(opacity);
  } else if (typeof leafletLayer.setStyle === 'function') {
    let oldStyle = Ember.get(leafletLayer, 'options.style') || {};
    if (typeof oldStyle === 'function') {
      Ember.Logger.error(
        `Option 'style' of the specified leaflet layer is a callback function, ` +
        `so it's opacity can't be simply changed through call to 'setStyle' method.`);
    } else {
      let newStyle = Ember.$.extend(true, {}, oldStyle, { opacity: opacity, fillOpacity: opacity });
      leafletLayer.setStyle(newStyle);
    }
  }

  if (leafletLayer instanceof L.MarkerClusterGroup) {
    setLeafletLayerOpacity({ leafletLayer: Ember.get(leafletLayer, '_featureGroup'), opacity });
  }

  if (typeof leafletLayer.eachLayer === 'function') {
    leafletLayer.eachLayer((nestedLeafletLayer) => {
      setLeafletLayerOpacity({ leafletLayer: nestedLeafletLayer, opacity });
    });
  }
};

export {
  setLeafletLayerOpacity
};
