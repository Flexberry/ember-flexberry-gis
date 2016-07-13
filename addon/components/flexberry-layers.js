import Ember from 'ember';
import layout from '../templates/components/flexberry-layers';

/**
  Component for render layers array
*/
export default Ember.Component.extend({
  layout,

  /**
    Array of MapLayer
  */
  layers: null,

  /**
    Leaflet container for child layers
  */
  container: null,

  /**
    reference to flexberry-map component
   */
  map: null,

  tagName: ''
});
