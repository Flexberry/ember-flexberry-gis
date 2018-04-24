import Ember from 'ember';
import layout from '../templates/components/flexberry-multiple-select';

export default Ember.Component.extend({
  layout,

  items: [],

  selectedItems: [],

  heading: undefined,

  useValueText: false,

  init() {
    this._super(...arguments);
    this.set('heading', 'heading');
    let test = ['test1', 'test2', 'test3'];
    this.set('items', test);
  }
});
