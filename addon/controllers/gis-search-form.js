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
  _selectedRowsCount: Ember.computed('_selectedRows', function() {
    let selectedRows = this.get('_selectedRows');
    return Object.keys(selectedRows).filter(function(item) {
      return Ember.get(selectedRows, item);
    }).length;
  }),

  /**
    Id of a selected map.
  */
  _selectedMap: null,

  /**
    Observes selected rows count and selected map and changes a flag that enables 'Open in a map' button.
  */
  _canOpenMapWithMetadataObserver: Ember.observer('_selectedRowsCount', '_selectedMap', function() {
    this.set('_canOpenMapWithMetadata', this.get('_selectedRowsCount') > 0 && !Ember.isNone(this.get('_selectedMap')));
  }),

  /**
    The route name to transit when user clicks 'Open a map'.
  */
  mapRouteName: null,

  /**
    The route name to transit when user clicks 'Open metadata in a map'.
   */
  mapWithMetadataRouteName: null,

  actions: {
    /**
      Handles search button click and passes search data to the route.

      @method actions.getSearchResults
    */
    getSearchResults() {
      let req = { searchConditions: this.get('searchConditions') };
      this.set('_selectedRows', {}); // clear selected rows
      this.notifyPropertyChange('_selectedRows');
      this.send('doSearch', req);
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
      Handles click on 'open map' button.

      @method actions.goToMap
      @param {Object} mapModel Model of the map to transition
    */
    goToMap(mapModel) {
      // may be it should pass event.ctrlKey
      this.transitToMap(mapModel);
    },

    /**
      Handles click on 'open a map with metadata' button.

      @method actions.goToMapWithMetadata
    */
    goToMapWithMetadata() {
      let selectedRows = this.get('_selectedRows');
      let metadataIds = Object.keys(selectedRows).filter(function(item) {
        return Ember.get(selectedRows, item);
      });
      this.transitToMapWithMetadata(this.get('_selectedMap'), metadataIds);
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
  },

  /**
    Handles transition to selected map.

    @method transitToMap
    @param {Object} mapModel Model of the map to transition
  */
  transitToMap(mapModel) {
    let mapRoute = this.get('mapRouteName');
    Ember.assert(`The parameter 'mapRouteName' shouldn't be empty!`, !Ember.isNone(mapRoute));
    this.transitionToRoute(mapRoute, mapModel.get('object'));
  },

  /**
    Handles transition to selected map with metadata.

    @method transitToMapWithMetadata
    @param {String} mapId Map id
    @param {Array} selectedMetadataIds Selected metadata ids
  */
  transitToMapWithMetadata(mapId, selectedMetadataIds) {
    let mapRoute = this.get('mapWithMetadataRouteName');
    Ember.assert(`The parameter 'mapWithMetadataRouteName' shouldn't be empty!`, !Ember.isNone(mapRoute));
    this.transitionToRoute(mapRoute, mapId, selectedMetadataIds);
  }
});
