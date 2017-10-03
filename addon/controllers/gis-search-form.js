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
    Model for search panel.
  */
  searchConditions: {
    /**
      Comma-separated list of key words. Used for search.

      @property searchConditions.searchKeyWords
      @type String
      @default null
    */
    keyWords: null,

    /**
      Left boundary of scale limitation.

      @property searchConditions.scaleFrom
      @type Number
      @default null
    */
    scaleFrom: null,

    /**
      Right boundary of scale limitation.

      @property searchConditions.scaleTo
      @type Number
      @default null
    */
    scaleTo: null,

    /**
      Min longitude value. Used for search.

      @property searchConditions.minLng
      @type Number
      @default null
    */
    minLng: null,

    /**
      Min latitude value. Used for search.

      @property searchConditions.minLat
      @type Number
      @default null
    */
    minLat: null,

    /**
      Max longitude value. Used for search.

      @property searchConditions.maxLng
      @type Number
      @default null
    */
    maxLng: null,

    /**
      Max latitude value. Used for search.

      @property searchConditions.maxLat
      @type Number
      @default null
    */
    maxLat: null
  },

  /**
    Indicates - when to show error message.

    @property showFormErrorMessage
    @readOnly
  */
  showFormErrorMessage: Ember.computed('error', function () {
    if (this.get('error')) {
      return true;
    } else {
      return false;
    }
  }),

  /**
    Hash with ids of selected rows.
  */
  _selectedRows: {},

  /**
    Count of a selected rows.
  */
  _selectedRowsCount: Ember.computed('_selectedRows', function () {
    let selectedRows = this.get('_selectedRows');
    return Object.keys(selectedRows).filter((item) => Ember.get(selectedRows, item)).length;
  }),

  _metadataIds: Ember.computed('_selectedRows', function() {
    let selectedRows = this.get('_selectedRows');
    return Object.keys(selectedRows).filter((item) => Ember.get(selectedRows, item));
  }),

  /**
    Id of a selected map.
  */
  _selectedMap: null,

  /**
    Observes selected rows count and selected map and changes a flag that enables 'Open in a map' button.
  */
  _canOpenMapWithMetadataObserver: Ember.observer('_selectedRowsCount', '_selectedMap', function () {
    this.set('_canOpenMapWithMetadata', this.get('_selectedRowsCount') > 0 && !Ember.isNone(this.get('_selectedMap')));
  }),

  /**
    The route name to transit when user clicks 'Open a map'.

    @default 'map'
  */
  mapRouteName: 'map',

  /**
    The route name to transit when user clicks 'Open metadata in a map'.

    @default 'map'
  */
  mapWithMetadataRouteName: 'map',

  /**
    The route name to transit when user clicks 'Open metadata in a new map'.

    @default 'map.new'
  */
  newMapWithMetadataRouteName: 'map.new',

  actions: {
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
      Clears selected rows.

      @method actions._clearSelectedRows
    */
    _clearSelectedRows() {
      this.set('_selectedRows', {});
      this.notifyPropertyChange('_selectedRows');
    }
  }
});
