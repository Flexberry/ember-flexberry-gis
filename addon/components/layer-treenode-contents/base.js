/**
  @module ember-flexberry-gis
*/

import Component from '@ember/component';
import DynamicActionsMixin from 'ember-flexberry/mixins/dynamic-actions';

/**
  Base layer tree header component.
  Layer components should be inheriting from this.

  @class BaseLayerTreenodeContentComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses DynamicActionsMixin
 */
export default Component.extend(DynamicActionsMixin, {
  /**
    Map layer model.

    @property layer
    @type NewPlatformFlexberryGISMapLayerModel
    @default null
  */
  layer: null,
});
