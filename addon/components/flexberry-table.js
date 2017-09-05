import Ember from 'ember';
import layout from '../templates/components/flexberry-table';
import PaginatedControllerMixin from 'ember-flexberry/mixins/paginated-controller';

export default Ember.Component.extend(PaginatedControllerMixin, {
  layout,

  columnCount: Ember.computed('header', {
    get() {
      return Object.keys(this.get('header')).length;
    }
  }),

  _reload() {
    let l = this.get('perPageValue');
    let p = this.get('page');
    this.sendAction('getData', {
      modelName: this.attrs.modelName,
      projectionName: this.attrs.projectionName,
      top: l,
      skip: (p - 1) * l
    });
  },

  pageChanged: Ember.observer('page', () => {
    this._reload();
  }),

  actions: {
    perPageClick() {
      this._reload();
    }
  },
});
