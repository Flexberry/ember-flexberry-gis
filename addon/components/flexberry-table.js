/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/flexberry-table';
import PaginatedControllerMixin from 'ember-flexberry/mixins/paginated-controller';
import SlotsMixin from 'ember-block-slots';

/**
  Flexberry table component with [Semantic UI table](https://semantic-ui.com/collections/table) style and paging handling.

  @class FlexberryTableComponent
  @uses PaginatedControllerMixin
  @uses <a href="https://github.com/ciena-blueplanet/ember-block-slots#usage">SlotsMixin</a>
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @extends <a href="https://github.com/ciena-blueplanet/ember-block-slots">Ember block slots</a>
*/
export default Ember.Component.extend(PaginatedControllerMixin, SlotsMixin, {
  /**
    Computes - how many block-slots are used.

    @property _additionalColumnsCount
    @type Number
    @private
    @readonly
    @private
  */
  _additionalColumnsCount: Ember.computed('_slots.[]', function() {
    let slots = ['column-header-head-0', 'column-cell-head-1', 'column-header-tail-0'];
    let result = 0;
    slots.forEach((item) => {
      if (this._isRegistered(item)) {
        result++;
      }
    });
    return result;
  }),

  /**
    Count of columns.

    @property _columnCount
    @type Number
    @private
    @readOnly
  */
  _columnCount: Ember.computed('header', {
    get() {
      let additionalColumnsCount = this.get('_additionalColumnsCount');
      return Object.keys(this.get('header')).length + additionalColumnsCount;
    }
  }),

  /**
    Selected cell name.
    It's been using while cell editing.

    @property _selectedCellName
    @type String
    @default null
    @private
  */
  _selectedCellName: null,

  /**
    Reference to component's template.
  */
  layout,

  /**
    Component's additional class names.
  */
  class: null,

  /**
    Flag that indicates whether cell editing is allowed.

    @property allowEdit
    @type Boolean
    @default false
  */
  allowEdit: false,

  /**
    Hash containing field names.

    @property fieldNames
    @type Object
    @default null
  */
  fieldNames: null,

  /**
    Hash containing type names related to field names.

    @property fieldTypes
    @type Object
    @default null
  */
  fieldTypes: null,

  /**
    Hash containing type parsers related to field names.

    @property fieldParsers
    @type Object
    @default null
  */
  fieldParsers: null,

  /**
    Hash containing type validators related to field names.

    @property fieldValidators
    @type Object
    @default null
  */
  fieldValidators: null,

  /**
    Flag that indicates whether 'rows per page' select is available or isn't.

    @property perPageAvailable
    @type Boolean
    @default true
  */
  perPageAvailable: true,

  actions: {
    /**
      Handles changes in component's {{#crossLink "FlexberryTableComponent/page:property"}}'perPageValue' property{{/crossLink}}.

      @method actions.perPageClick
    */
    perPageClick() {
      this._reload();
    },

    /**
      Handles cell 'click' event.

      @method actions.onCellClick
      @param {String} newSelectedCellName New selected cell name.
      @param {Object} e Event object.
    */
    onCellClick(newSelectedCellName, e) {
      if (Ember.isNone(newSelectedCellName)) {
        return;
      }

      this.set('_selectedCellName', newSelectedCellName);

      // Convert native event object into jQuery event object.
      e = Ember.$.event.fix(e);

      // Wait while input will be embeded into clicked cell (after render), and focus on it.
      Ember.run.scheduleOnce('afterRender', this, function () {
        let $cellInput = Ember.$(e.target).find('input').first();
        $cellInput.focus();
      });
    },

    /**
      Handles cell textbox 'focusout' event.

      @method actions.onCellInputChange
      @param {Object} options Hash containing action's options.
      @param {Object} options.row Row containing changed property.
      @param {String} options.fieldName Changed property name.
      @param {String} inputText Actual input text.
      @param {Object} e Event object.
    */
    onCellInputFocusOut({ row, fieldName }, inputText, e) {
      inputText = inputText;
      let fieldParsers = this.get('fieldParsers');
      let fieldValidators = this.get('fieldValidators');

      let value = fieldParsers[fieldName](inputText);
      let valueIsValid = fieldValidators[fieldName](value);
      if (valueIsValid) {
        Ember.set(row, fieldName, value);
        this.sendAction('rowEdited', Ember.guidFor(row));
      }

      this.set('_selectedCellName', null);
    },

    /**
      Handles cell checkbox 'onChange' action.

      @param {Object} row Row containing changed cell.
      @param {Object} e Event object.
     */
    onCellCheckboxChange(row, e) {
      this.sendAction('rowEdited', Ember.guidFor(row));
    },

    /**
      Handles cell textbox 'keydown' event.

      @method actions.onCellInputKeyDown
      @param {Object} options Hash containing action's options.
      @param {Object} options.row Row containing changed property.
      @param {String} options.fieldName Changed property name.
      @param {String} inputText Actual input text.
      @param {Object} e Event object.
    */
    onCellInputKeyDown(options, inputText, e) {
      // If Enter (keycode: 13) or Esc (keycode: 27) was pressed, remove input from the cell.
      let code = e.keyCode || e.which;
      if (code === 13 || code === 27) {
        e.preventDefault();
        this.send('onCellInputFocusOut', options, inputText, e);
      }
    }
  },

  /**
    Observes {{#crossLink "FlexberryTableComponent/page:property"}}'page' property{{/crossLink}} and handles changes in it.

    @method _pageDidChange
    @private
  */
  _pageDidChange: Ember.observer('page', function () {
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
  },

  /**
    Component's action invoking when component needs assosiated data to be loaded or reloaded.

    @method sendingActions.getData
    @param {Object} req Action's event object.
  */

  /**
    Component's action invoking when table row data is edited.
    @method sendingActions.rowEdited
    @param {String} rowId Edited row's id.
  */
});
