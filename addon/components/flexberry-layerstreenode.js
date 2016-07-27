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
  layers: undefined,
  iconClass: Ember.computed('type', function() {
    let type = this.get('type');
    return this.getIconClassByType(type);
  }),

  _hasLayers: Ember.computed('layers.[]', function() {
    let layers = this.get('layers');

    return Ember.isArray(layers) && layers.length > 0;
  }),

  _convertedDynamicActions: Ember.computed('dynamicActions', function() {
    let dynamicActions = this.get('dynamicActions');

    if (!dynamicActions || !Ember.isArray(dynamicActions)) {
      return null;
    }

    if (dynamicActions.length <= 0) {
      return [];
    }

    let nodesDynamicActions = dynamicActions.map((dynamicAction) => {
      let dynamicActionOn = dynamicAction.on;
      switch (dynamicActionOn) {
        case 'visibilityChange':
          dynamicActionOn = 'checkboxChange';
          break;
        case 'becameVisible':
          dynamicActionOn = 'checkboxCheck';
          break;
        case 'becameInvisible':
          dynamicActionOn = 'checkboxUncheck';
          break;
      }

      dynamicAction.on = dynamicActionOn;
      return dynamicAction;
    });
    return nodesDynamicActions;
  })
});

export default FlexberryLayersTreeNodeComponent;
