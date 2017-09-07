/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/flexberry-table';
import PaginatedControllerMixin from 'ember-flexberry/mixins/paginated-controller';

/**
  Flexberry table component with [Semantic UI table](https://semantic-ui.com/collections/table) style and paging handling.

  @class FlexberryTableComponent
  @uses PaginatedControllerMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend(PaginatedControllerMixin, {
  /**
    Reference to component's template.
  */
  layout,

  /**
    Count of columns.

    @property _columnCount
    @type Number
    @private
    @readOnly
  */
  _columnCount: Ember.computed('header', {
    get() {
      return Object.keys(this.get('header')).length;
    }
  }),

  actions: {
    /**
      Handles changes in component's {{#crossLink "FlexberryTableComponent/page:property"}}'perPageValue' property{{/crossLink}}.

      @method actions.perPageClick
    */
    perPageClick() {
      this._reload();
    }
  },

  /**
    Observes {{#crossLink "FlexberryTableComponent/page:property"}}'page' property{{/crossLink}} and handles changes in it.

    @method _pageDidChange
    @private
  */
  _pageDidChange: Ember.observer('page', function() {
    this._reload();
  }),

  /**
    Handles changes in component's
    {{#crossLink "FlexberryTableComponent/page:property"}}'page'{{/crossLink}} or
    {{#crossLink "FlexberryTableComponent/perPageValue:property"}}'perPageValue'{{/crossLink}} properties
    Invokes component's {{#crossLink "FlexberryTableComponent/sendingActions.getData:method"}}'getData'{{/crossLink}} action.

    @method _createInnerSettings
    @private
  */
  _reload() {
    let perPageValue = this.get('perPageValue');
    let pageNum = this.get('page');
    this.sendAction('getData', {
      modelName: this.get('modelName'),
      projectionName: this.get('projectionName'),
      top: perPageValue,
      skip: pageNum > 0 ? (pageNum - 1) * perPageValue : 0
    });
  }

  /**
    Component's action invoking when component needs assosiated data to be loaded or reloaded.

    @method sendingActions.getData
    @param {Object} req Action's event object.
  */
});
