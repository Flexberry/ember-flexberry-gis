/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import DynamicActionsMixin from 'ember-flexberry/mixins/dynamic-actions';

/**
  Base layer tree header component.
  Layer components should be inheriting from this.

  @class BaseLayerTreenodeContentComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
 */
export default Ember.Component.extend(DynamicActionsMixin, {
  settingsAsObject: null
});
