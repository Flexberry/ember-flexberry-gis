/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  GIS search form controller.

  @class GisSearchFormController
  @extends <a href="http://emberjs.com/api/classes/Ember.Controller.html">Ember.Controller</a>
*/
export default Ember.Controller.extend({
  /**
    Hash containing search conditions.

    @property searchConditions
    @type Object
  */
  searchConditions: {
    /**
      Comma-separated list of words to search in any text field.
      @property searchConditions.anyText
      @type String
      @default null
    */
    anyText: null,

    /**
      Comma-separated list of key words. Used for search.
      @property searchConditions.searchKeyWords
      @type String
      @default null
    */
    keyWords: null,

    /**
      Scale filter conditions.

      @property searchConditions.scaleFilters
      @type Array
      @default []
    */
    scaleFilters: Ember.A(),

    /**
      Min longitude value. Used for search.
      @property searchConditions.minLng
      @type Number
      @default null
    */
    minLng: -180,

    /**
      Min latitude value. Used for search.
      @property searchConditions.minLat
      @type Number
      @default null
    */
    minLat: -90,

    /**
      Max longitude value. Used for search.
      @property searchConditions.maxLng
      @type Number
      @default null
    */
    maxLng: 180,

    /**
      Max latitude value. Used for search.
      @property searchConditions.maxLat
      @type Number
      @default null
    */
    maxLat: 90,

    /**
      Bounding box in EWKT format.
      @property searchConditions.boundingBoxEWKT
      @type String
      @default undefined
    */
    boundingBoxEWKT: undefined
  },

  /**
    Array of posible scale filter conditions.

    @property scaleFilterConditions
    @type String[]
    @default `['>', '>=', '<', '<=', '=', '<>']`
  */
  scaleFilterConditions: ['>', '>=', '<', '<=', '=', '<>'],

  /**
    Array of posible scale values.

    @property scales
    @type Number[]
    @default Ember.A([500, 1000, 2000, 5000, 10000, 25000, 50000, 100000, 200000, 500000, 1000000, 2500000, 5000000, 10000000])
  */
  scales: Ember.A([500, 1000, 2000, 5000, 10000, 25000, 50000, 100000, 200000, 500000, 1000000, 2500000, 5000000, 10000000]),

  /**
    Hash with ids of selected rows.

    @property _selectedRows
    @type Object
    @private
  */
  _selectedRows: {},

  /**
    Count of a selected rows.

    @property _selectedRowsCount
    @type Number
    @private
    @readOnly
  */
  _selectedRowsCount: Ember.computed('_selectedRows', function () {
    let selectedRows = this.get('_selectedRows');
    return Object.keys(selectedRows).filter((item) => Ember.get(selectedRows, item)).length;
  }),

  /**
    Metadata identifiers.

    @property _metadataIds
    @type String[]
    @private
    @readOnly
  */
  _metadataIds: Ember.computed('_selectedRows', function() {
    let selectedRows = this.get('_selectedRows');
    return Object.keys(selectedRows).filter((item) => Ember.get(selectedRows, item));
  }),

  /**
    Id of a selected map.

    @property _selectedMap
    @type String
    @private
  */
  _selectedMap: null,

  /**
    Observes selected rows count and selected map and changes a flag that enables 'Open in a map' button.

    @method _canOpenMapWithMetadataObserver
    @private
  */
  _canOpenMapWithMetadataObserver: Ember.observer('_selectedRowsCount', '_selectedMap', function () {
    this.set('_canOpenMapWithMetadata', this.get('_selectedRowsCount') > 0 && !Ember.isNone(this.get('_selectedMap')));
  }),

  /**
    The route name to transit when user clicks 'Open a map'.

    @property mapRouteName
    @type String
    @default 'map'
  */
  mapRouteName: 'map',

  /**
    The route name to transit when user clicks 'Open metadata in a map'.

    @property mapWithMetadataRouteName
    @type String
    @default 'map'
  */
  mapWithMetadataRouteName: 'map',

  /**
    The route name to transit when user clicks 'Open metadata in a new map'.

    @property
    @type String
    @default 'map.new'
  */
  newMapWithMetadataRouteName: 'map.new',

  actions: {
    /**
      Handles anyText 'clear' button click.

      @method actions.getSearchResults
    */
    onAnyTextClearButtonClick() {
      this.set('searchConditions.anyText', null);
    },

    /**
      Handles search button click and passes search data to the route.

      @method actions.getSearchResults
    */
    getSearchResults() {
      this.set('_selectedRows', {}); // clear selected rows
      this.notifyPropertyChange('_selectedRows');
      this.send('doSearch', { searchConditions: this.get('searchConditions') });
    },

    /**
      Handles action from child table component.

      @method actions.getData
      @param {String} field Path to property in which loaded data must be stored.
      @param {Object} data Hash object containing paging and filtering data.
    */
    getData(field, data) {
      let req = Ember.$().extend(data, {
        searchConditions: this.get('searchConditions'),
        fieldName: field
      });
      this.send('doSearch', req);
    },

    /**
      Handles add scale filter action.

      @method actions.addScaleFilterCondition
    */
    addScaleFilterCondition() {
      let searchConditions = this.get('searchConditions');
      if (searchConditions && Ember.isArray(searchConditions.scaleFilters)) {
        searchConditions.scaleFilters.addObject({ condition: '=', scale: '0' });
      }

      // Prevent submit.
      return false;
    },

    /**
      Handles delete scale filter action.

      @method actions.deleteScaleFilterCondition
      @param {Integer} index Index of the condition for delete.
    */
    deleteScaleFilterCondition(index) {
      let searchConditions = this.get('searchConditions');
      if (searchConditions && Ember.isArray(searchConditions.scaleFilters)) {
        searchConditions.scaleFilters.removeAt(index);
      }
    },

    /**
      Handles scale filter keyDown action.

      @method actions.scaleFilterKeyDown
    */
    scaleFilterKeyDown(e) {
      let key = e.which;

      // Allow only numbers, backspace, arrows, etc.
      return (key === 8 || key === 9 || key === 46 || (key >= 37 && key <= 40) ||
        (key >= 48 && key <= 57) || (key >= 96 && key <= 105));
    },

    /**
      Handles scale condition changing.

      @method actions.onScaleConditionChange
      @param {String} index Index of selected element.
      @param {Object} element Selected element.
      @param {String} value Selected value.
    */
    onScaleConditionChange(index, element, value) {
      this.set(`searchConditions.scaleFilters.${index}.condition`, value);
    },

    /**
      Handles click on row select checkbox.

      @method actions.onRowSelect
      @param {String} rowId Id of selected row.
      @param {Object} options Event options. We condider options.checked.
    */
    onRowSelect(rowId, options) {
      this.set(`_selectedRows.${rowId}`, options.checked);
      this.notifyPropertyChange('_selectedRows');
    },

    /**
      Handles bounding box changes.

      @method actions.onBoundingBoxChange
    */
    onBoundingBoxChange(e) {
      this.set('searchConditions.boundingBoxEWKT', e.bboxEWKT);
    },

    /**
      Clears selected rows.

      @method actions._clearSelectedRows
    */
    _clearSelectedRows() {
      this.set('_selectedRows', {});
      this.notifyPropertyChange('_selectedRows');
    }
  }
});
