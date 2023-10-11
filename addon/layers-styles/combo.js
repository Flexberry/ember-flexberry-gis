/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import SimpleLayerStyle from './simple';

/**
  Class implementing simple stylization for vector layers.

  @class BaseLayerStyle
*/
export default SimpleLayerStyle.extend({
  /**
    Applies layer-style to the specified leaflet layer.

    @method renderOnLeafletLayer
    @param {Object} options Method options.
    @param {<a =ref="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>} options.leafletLayer Leaflet layer to which layer-style must be applied.
    @param {Object} options.style Hash containing style settings.
  */
  renderOnLeafletLayer({ leafletLayer, style }) {
    if (leafletLayer instanceof L.LayerGroup) {
      // First we must clean group layer's style options,
      // otherwise already defined style options won't be changed.
      leafletLayer.options.style = {};

      leafletLayer.eachLayer((layer) => {
        this._renderOnLeafletLayer({ leafletLayer: layer, style });
      });
    } else if (leafletLayer instanceof L.Path) {
      this._renderOnLeafletPath({ path: leafletLayer, style });
    } else if (leafletLayer instanceof L.Marker) {
      this._renderOnLeafletMarker({ marker: leafletLayer, style });
    }
  },

  /**
    Applies layer-style to the specified leaflet marker.

    @method _renderOnLeafletLayer
    @param {Object} options Method options.
    @param {<a =ref="http://leafletjs.com/reference-1.2.0.html#marker">L.Marker</a>} options.marker Leaflet marker to which layer-style must be applied.
    @param {Object} options.style Hash containing style settings.
  */
  _renderOnLeafletMarker({ marker, style }) {
    if (style && Ember.isArray(style.marker)) {
      let icons = Ember.A();
      style.marker.forEach(styleSetting => {
        let type = Ember.get(styleSetting, 'type');
        let style = Ember.get(styleSetting, 'style');
        if (Ember.isNone(marker.styleIsSet) || !marker.styleIsSet) {
          if (type === 'image') {
            icons.addObject(new L.Icon(style));
          } else {
            icons.addObject(new L.Icon.Default());
          }
        }
      });
      marker.setIcon(icons);
    } else {
      let type = Ember.get(style.marker, 'type');
      let styleOptions = Ember.get(style.marker, 'style');
      if (Ember.isNone(marker.styleIsSet) || !marker.styleIsSet) {
        if (type === 'image') {
          marker.setIcon(new L.Icon(styleOptions));
        } else {
          marker.setIcon(new L.Icon.Default());
        }
      }
    }
  }
});
