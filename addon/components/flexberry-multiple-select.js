import Ember from 'ember';
import layout from '../templates/components/flexberry-multiple-select';

export default Ember.Component.extend({
  layout,

  items: ['test1', 'test2', 'test3'],

  selectedItems: [],

  heading: 'Test combobox',

  useValueText: false,

  selectorName: 'fb-selector',

  init() {
    this._super(...arguments);
    let items = this.get('items');
    let heading = this.get('heading');

    this.set('heading', heading);
    this.set('items', items);
  },

  didInsertElement() {
    let selName = this.get('selectorName');
    this.$('#' + selName)
    .dropdown({
      onChange: this.onSelectorChange
    });
  },

  onSelectorChange(e) {
    //не прорабатывает. как заменить?

    Ember.set('selectedItems', e);

    console.log(Ember.get('selectedItems'));
  }
});
