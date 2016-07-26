/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import DynamicActionsMixin from '../mixins/dynamic-actions';
import FlexberryLayersTreeComponentMixin from '../mixins/flexberry-layerstree-component';
import layout from '../templates/components/flexberry-layerstree';
import TreeNodeObject from '../objects/tree-node';

let FlexberryLayersTreeComponent = Ember.Component.extend(DynamicActionsMixin, FlexberryLayersTreeComponentMixin, {
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
  layers: undefined,

  nodes: Ember.computed('layers.@each', function() {
    let layers = this.get('layers');
    let nodes = this._convertLayersToNodes(layers);
    return nodes;
  }),

  _convertLayersToNodes(layers) {
    if (!layers || !Ember.isArray(layers)) {
      return null;
    }

    if (layers.length <= 0) {
      return [];
    }

    let nodes = layers.map((layer) => {
      return TreeNodeObject.create({
        caption: layer.get('name'),
        hasCheckbox: true,
        checkboxValue: layer.get('visibility'),
        iconClass: this.getIconClassByType(layer.get('type')),
        dynamicActions: this._convertDynamicActions(layer.get('dynamicActions')),
        nodes: this._convertLayersToNodes(layer.get('layers'))
      });
    });
    return nodes;
  },

  _convertDynamicActions(dynamicActions) {
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
  }
});

export default FlexberryLayersTreeComponent;
