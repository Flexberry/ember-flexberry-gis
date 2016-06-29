import Ember from 'ember';

export default Ember.Component.extend({
  value: undefined,

  linkToField: undefined,

  renderMainTemplate: 'renderMainTemplate',

  renderInto: undefined,

  init() {
    this._super(...arguments);

    Ember.assert('renderInto should be defined', this.get('renderInto'));
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
    let linkToField = this.get('linkToField');
    this.sendAction('renderMainTemplate', linkToField, this.get('renderInto'));
  }
});
