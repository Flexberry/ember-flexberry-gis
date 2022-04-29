/**
  @module ember-flexberry
*/

import { isNone } from '@ember/utils';

import { computed, get } from '@ember/object';
import BlockSlotComponent from 'ember-block-slots/components/block-slot';
import YieldSlotComponent from 'ember-block-slots/components/yield-slot';
import SlotsMixin from 'ember-block-slots';

/**
  Adds additional logic to <a href="https://github.com/ciena-blueplanet/ember-block-slots#usage">BlockSlots Mixin</a>
  for current application instance.

  @for ApplicationInstanceInitializer
  @method blockSlots.initialize
  @param {<a href="http://emberjs.com/api/classes/Ember.ApplicationInstance.html">Ember.ApplicationInstance</a>} applicationInstance Ember application instance.
*/
export function initialize() {
  SlotsMixin.reopen({
    parentViewExcludingSlots: computed('parentView', 'targetObject', function () {
      const getParent = function (context) {
        return get(context, 'parentView') || get(context, 'targetObject');
      };

      let parent = getParent(this);
      while (!isNone(parent) && (parent instanceof BlockSlotComponent || parent instanceof YieldSlotComponent)) {
        parent = getParent(parent);
      }

      return parent;
    }),
  });
}

export default {
  name: 'blockSlots',
  initialize,
};
