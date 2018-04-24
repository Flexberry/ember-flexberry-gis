import Ember from 'ember';
import layout from '../templates/components/flexberry-multiple-select';

export default Ember.Component.extend({
  layout,

  items: [],

  selectedItems: [],

  heading: undefined,

  allowAdditions: false,

  selectorName: 'fb-selector',

  init() {
    this._super(...arguments);
    let items = this.get('items');
    let selectedItems = this.get('selectedItems');
    let heading = this.get('heading');

    this.set('items', items);
    this.set('selectedItems', selectedItems);
    this.set('heading', heading);
  },

  didInsertElement() {
    let selName = this.get('selectorName');
    let allowAdditions = this.get('allowAdditions');
    let selectedItems = this.get('selectedItems');

    this.$('#' + selName)
    .dropdown({
      allowAdditions: allowAdditions,
      onChange: (e) => {
        this.set('selectedItems', e);
        this.sendAction('onChange', e);
      }
    });
  }
});
