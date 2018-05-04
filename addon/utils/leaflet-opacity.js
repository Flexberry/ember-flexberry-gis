/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
    Max opacity value for geometries

    @for Utils.LeafletOpacity
    @property maxGeometryOpacity
    @type Number
    @default 0.65
*/
let maxGeometryOpacity = 0.65;

/**
    Max fill opacity value for geometries 

    @for Utils.LeafletOpacity
    @property maxGeometryFillOpacity
    @type Number
    @default 0.2
*/
let maxGeometryFillOpacity = 0.2;

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

      // Option 1: set opacity directly
      leafletLayer.options.opacity = opacity * maxGeometryOpacity;
      leafletLayer.options.fillOpacity = opacity * maxGeometryFillOpacity;
      leafletLayer.redraw();
            
      // Option 2: set opacity with layer.setStyle
      /*
      oldStyle = {};
      
      // layer.options properties that are not Path options 
      // https://leafletjs.com/reference-1.3.0.html#path-option 
      let propertiesToExclude = ['onEachFeature', 'coordsToLatLng', 'crs', 'filter', 'geojson', 'style'];
      
      for (let [key, value] of Object.entries(leafletLayer.options)) {
        if (!propertiesToExclude.includes(key)) {
          oldStyle[key] = value;
        }
      }

      let newStyle = Ember.$.extend(true, {}, oldStyle, 
        { opacity: opacity * maxGeometryOpacity, fillOpacity: opacity * maxGeometryFillOpacity });
      leafletLayer.setStyle(newStyle);
      */
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
