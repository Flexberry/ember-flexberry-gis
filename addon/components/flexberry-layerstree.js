/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import DynamicActionsMixin from '../mixins/dynamic-actions';
import layout from '../templates/components/flexberry-layerstree';

let FlexberryLayersTreeComponent = Ember.Component.extend(DynamicActionsMixin, {
  /**
    Reference to component's template.
  */
  layout,
  //tagName:'',

  class: undefined,
  exclusive: false,
  collapsible: true,
  animateChildren: false,
  duration: 350,
  layers: undefined
});

export default FlexberryLayersTreeComponent;
