/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/flexberry-layerstree';
import FlexberryTreeComponent from './flexberry-tree';
import FlexberryLayersTreenodeComponent from './flexberry-layerstreenode';

const flexberryClassNamesPrefix = 'flexberry-layerstree';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix
};

let FlexberryLayersTreeComponent = FlexberryTreeComponent.extend({
  /**
    Reference to component's template.
  */
  layout,
  flexberryClassNames,

  classNames: [flexberryClassNames.wrapper],

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

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryLayersTreeComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryLayersTreeComponent;
