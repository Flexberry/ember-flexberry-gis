/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  GIS search form controller.

  @class GisSearchFormController
  @extends Ember.Controller
*/
export default Ember.Controller.extend({
  /**
    Model for search panel
  */
  searchConditions: {
    /**
      Comma-separated list of key words. Used for search.

      @property searchKeyWords
      @type String
      @default null
    */
    keyWords: null,

    /**
      Left boundary of scale limitation.

      @type Number
      @default null
    */
    scaleFrom: null,

    /**
      Right boundary of scale limitation.

      @type Number
      @default null
    */
    scaleTo: null,

    /**
      Min longitude value. Used for search.

      @property searchMinLng
      @type Number
      @default null
    */
    minLng: null,

    /**
      Min latitude value. Used for search.

      @property searchMinLat
      @type Number
      @default null
    */

    minLat: null,
    /**
      Max longitude value. Used for search.

      @property searchMaxLng
      @type Number
      @default null
    */
    maxLng: null,

    /**
      Max latitude value. Used for search.

      @property searchMaxLat
      @type Number
      @default null
    */
    maxLat: null
  },

  /**
    Indicates - when to show error message.
  */
  showFormErrorMessage: Ember.computed('error', function () {
    if (this.get('error')) { return true; } else { return false; }
  }),

  actions: {
    /**
      Handles search button click and passes search data to the route.
    */
    getSearchResults() {
      let req = { searchConditions: this.get('searchConditions') };
      this.send('doSearch', req);
    },

    /**
      Handles action from child table component
      @param {*} field Field in which component waits the result data
      @param {*} data Paging settings
     */
    getData(field, data) {
      let req = Ember.$().extend(data, {
        searchConditions: this.get('searchConditions'),
        fieldName: field
      });
      this.send('doSearch', req);
    }
  }
});
