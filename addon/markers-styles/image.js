/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseMarkerStyle from './-private/base';

/**
  Class implementing default stylization for markers.

  @class ImageMarkerStyle
  @extends BaseMarkerStyle
*/
export default BaseMarkerStyle.extend({
  /**
    Gets default style settings.

    @method getDefaultStyleSettings
    @return {Object} Hash containing default style settings.
  */
  getDefaultStyleSettings() {
    return {
      // Marker icon URL.
      iconUrl: L.Icon.Default.imagePath + 'marker-icon.png',

      // Icon size.
      iconSize: [25, 41],

      // Icon anchor relative to it's size.
      iconAnchor: [12, 41],

      // Marker shadow icon URL.
      shadowUrl: L.Icon.Default.imagePath + 'marker-shadow.png',

      // Shadow icon size.
      shadowSize: [41, 41],

      // Shadow icon anchor relative to it's size.
      shadowAnchor: [12, 41],

      iconType: 'default'
    };
  },

  /**
    Applies marker-style to the specified leaflet marker.

    @method renderOnLeafletMarker
    @param {Object} options Method options.
    @param {<a =ref="http://leafletjs.com/reference-1.2.0.html#marker">L.Marker</a>} options.marker Leaflet marker to which marker-style must be applied.
    @param {Object} options.style Hash containing style settings.
  */
  renderOnLeafletMarker({ marker, style }) {
    if (Ember.isNone(marker.styleIsSet) || !marker.styleIsSet) {
      marker.setIcon(new L.Icon(style));
    }
  }
});
