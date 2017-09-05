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

  actions: {
    /**
      Handles search click and passes search data to the route.
    */
    getSearchResults() {
      this.transitionToRoute({
        queryParams: this.get('searchConditions')
      });
    }
  }
});
