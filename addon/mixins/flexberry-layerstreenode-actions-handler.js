/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import FlexberryDdauCheckboxActionsHandlerMixin from './flexberry-ddau-checkbox-actions-handler';

export default Ember.Mixin.create({
  actions: {
    onTreenodeHeaderClick(...args) {
    },

    onTreenodeBeforeExpand(...args) {
    },

    onTreenodeBeforeCollapse(...args) {
    },

    onTreenodeVisibilityChange(...args) {
      let objectContainingActionHandler = Ember.Object.extend(FlexberryDdauCheckboxActionsHandlerMixin).create();
      let actionHandler = objectContainingActionHandler.get('actions.onCheckboxChange');

      actionHandler.apply(this, args);
    },

    onTreenodeBecameVisible(...args) {
      let objectContainingActionHandler = Ember.Object.extend(FlexberryDdauCheckboxActionsHandlerMixin).create();
      let actionHandler = objectContainingActionHandler.get('actions.onCheckboxCheck');

      actionHandler.apply(this, args);
    },

    onTreenodeBecameInvisible(...args) {
      let objectContainingActionHandler = Ember.Object.extend(FlexberryDdauCheckboxActionsHandlerMixin).create();
      let actionHandler = objectContainingActionHandler.get('actions.onCheckboxUncheck');

      actionHandler.apply(this, args);
    }
  }
});
