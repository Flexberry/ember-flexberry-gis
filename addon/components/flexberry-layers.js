/**
  @module ember-flexberry-gis
 */

import Ember from 'ember';
import layout from '../templates/components/flexberry-layers';

/**
  Component for render layers array.
  @class FlexberryLayersComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend({
  layout,

  tagName: '',

  /**
    Array of NewPlatformFlexberryGISMapLayer.
    @property layers
    @type Array
    @default null
  */
  layers: null,

  /**
    Leaflet map.

    @property leafletMap
    @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
    @default null
  */
  leafletMap: null,

  /**
    Leaflet container for layers.

    @property leafletContainer
    @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>|<a href="http://leafletjs.com/reference-1.0.0.html#layergroup">L.LayerGroup</a>
    @default null
  */
  leafletContainer: null
});
