/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/flexberry-table';
import PaginatedControllerMixin from 'ember-flexberry/mixins/paginated-controller';

/**
  Flexberry table component with [Semantic UI table](https://semantic-ui.com/collections/table.html) style
  and paging handling.
*/
export default Ember.Component.extend(PaginatedControllerMixin, {
  layout,

  /**
    Count of columns.
  */
  _columnCount: Ember.computed('header', {
    get() {
      return Object.keys(this.get('header')).length;
    }
  }),

  /**
    Handling of page num change.
  */
  _pageChanged: Ember.observer('page', function () {
    this._reload();
  }),

  actions: {
    /**
      Handling of per page value change
    */
    perPageClick() {
      this._reload();
    }
  },

  /**
    Handles selected page num or per-page value change.
    Invokes component's `#crossLink "FlexberryTable/sendingActions.getData:method"`'getData'`/crossLink` action.
  */
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

  /**
    Component's action invoking when selected page or per-page value changed.

    @method sendingActions.getData
    @param {Object} req Action's event object.
  */
});
