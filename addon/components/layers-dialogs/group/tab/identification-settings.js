import Ember from 'ember';
import layout from '../../../../templates/components/layers-dialogs/group/tab/identification-settings';

export default Ember.Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  label: 'components.layers-dialogs.settings.group.tab.identification-settings',

  class: 'toggle',

  value: undefined,

  _checkboxValue: undefined,

  _checkboxDidChange: Ember.observer('_checkboxValue', function() {
    let obj = {
      canBeIdentified: this.get('_checkboxValue')
    };
    this.set('value', obj);
  }),

  init() {
    this._super(...arguments);
    let value = this.get('value');
    this.set('_checkboxValue', value.canBeIdentified);
  }
});
