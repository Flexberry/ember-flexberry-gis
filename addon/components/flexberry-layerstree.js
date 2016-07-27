/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import DynamicActionsMixin from '../mixins/dynamic-actions';
import layout from '../templates/components/flexberry-layerstree';
import FlexberryTreeComponent from './flexberry-tree';
import FlexberryLayersTreenodeComponent from './flexberry-layerstreenode';

let FlexberryLayersTreeComponent = FlexberryTreeComponent.extend({
  /**
    Reference to component's template.
  */
  layout,

  layers: undefined,

  _hasLayers: Ember.computed('layers.[]', function() {
    let layers = this.get('layers');

    return Ember.isArray(layers) && layers.length > 0;
  }),

  _isNotInsideTreeNode: Ember.computed('parentView', function() {
    let parentView = this.get('parentView');

    return !(parentView instanceof FlexberryLayersTreenodeComponent);
  }),
});

export default FlexberryLayersTreeComponent;
