/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/flexberry-vector-layers-settings';

export default Ember.Component.extend({

  /**
    Reference to component's template.
  */
  layout,

  visibilityOutline: false,

  colorOutline: '#000000',

  thicknessOutline: 0,

  opacityOutline: 0,

  _itemsLineCap: Ember.A(['butt', 'round', 'square', 'inherit']),

  valueLineCap: 'round',

  _itemsLineJoin: Ember.A(['miter', 'round', 'bevel', 'inherit']),

  valueLineJoin: 'round',

  _itemsDashArray: Ember.A(['5, 5', '5, 10', '10, 5', '5, 1', '1, 5', '0.9', '15, 10, 5', '15, 10, 5, 10', '15, 10, 5, 10, 15', '5, 5, 1, 5']),

  valueDashArray: null,

  valueDashOffset: null,

  leafletMap: null,

  actions: {

    /**
      Handler for font colorpicker's 'change' action.

      @method actions.onColorOutlineChange
    */
    onColorOutlineChange(e) {
      this.set('colorOutline', e.newValue);
    },

    onOpacityOutlineChange(e) {
      this.set('opacityOutline', e.newValue);
    },

  }
});
