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
    Leaflet container for layers.
    @property leafletContainer
    @type L.Map|L.LayerGroup
    @default null
  */
  leafletContainer: null,

});
