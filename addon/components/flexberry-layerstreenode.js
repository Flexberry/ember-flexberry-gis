/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import DynamicActionsMixin from '../mixins/dynamic-actions';
import FlexberryLayersTreeComponentMixin from '../mixins/flexberry-layerstree-component';
import layout from '../templates/components/flexberry-layerstreenode';

let FlexberryLayersTreeNodeComponent = Ember.Component.extend(DynamicActionsMixin, FlexberryLayersTreeComponentMixin, {
  /**
    Reference to component's template.
  */
  layout,
  //tagName:'',

  name: undefined,
  type: undefined,
  visibility: undefined,
  settings: undefined,
  coordinateReferenceSystem: undefined,
  iconClass: Ember.computed('type', function() {
    let type = this.get('type');
    return this.getIconClassByType(type);
  })
});

export default FlexberryLayersTreeNodeComponent;
