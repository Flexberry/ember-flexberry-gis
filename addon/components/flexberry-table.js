import Ember from 'ember';
import layout from '../templates/components/flexberry-table';
import PaginatedControllerMixin from 'ember-flexberry/mixins/paginated-controller';

export default Ember.Component.extend(PaginatedControllerMixin, {
  layout,

  _columnCount: Ember.computed('header', {
    get() {
      return Object.keys(this.get('header')).length;
    }
  }),

  _pageChanged: Ember.observer('page', function () {
    this._reload();
  }),

  actions: {
    perPageClick() {
      this._reload();
    }
  },

  _reload() {
    let perPageValue = this.get('perPageValue');
    let pageNum = this.get('page');
    this.sendAction('getData', {
      modelName: this.get('modelName'),
      projectionName: this.get('projectionName'),
      top: perPageValue,
      skip: (pageNum - 1) * perPageValue
    });
  }
});
