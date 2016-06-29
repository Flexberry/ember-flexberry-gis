import Ember from 'ember';

export default Ember.Component.extend({
  value: undefined,

  saveValueToFieldName: undefined,

  linkToFieldValue: undefined,

  renderMainTemplate: 'renderMainTemplate',

  renderInto: undefined,

  init() {
    this._super(...arguments);
  },

  didInsertElement() {
    this._super(...arguments);
    this._linkToFieldChanged();
    this.addObserver('linkToField', this, this._linkToFieldChanged);
  },

  willDestroyElement() {
    this.removeObserver('linkToField', this, this._linkToFieldChanged);
  },

  _linkToFieldChanged() {
    let renderInto = this.get('renderInto');
    Ember.assert('renderInto should be defined', renderInto);

    let saveValueToFieldName = this.get('saveValueToFieldName');
    Ember.assert('saveValueToFieldName should be defined', saveValueToFieldName);

    let linkToFieldValue = this.get('linkToFieldValue');
    let value = this.get('value');

    this.sendAction('renderMainTemplate', linkToFieldValue, value, renderInto, saveValueToFieldName);
  }
});
