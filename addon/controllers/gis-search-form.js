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
    Comma-separated list of key words. Used for search.

    @property keyWords
    @type String
    @default null
  */
  keyWords: null,
  
  /**
    Scale. Used for search.

    // TODO For the next change it to 2 limitations >= ... < ...
  */
  scale: null,
  
  /**
    Min longitude value. Used for search.

    @property minLng
    @type String
    @default null
  */
  minLng: null,
  
  /**
    Min latitude value. Used for search.

    @property minLat
    @type String
    @default null
  */
  minLat: null,
  
  /**
    Max longitude value. Used for search.

    @property maxLng
    @type String
    @default null
  */
  maxLng: null,
  
  /**
    Max latitude value. Used for search.

    @property maxLat
    @type String
    @default null
  */
  maxLat: null,
  
  actions: {
    /**
      Handles search click and passes search data to the route.
    */
    getSearchResults() {
      this.send('loadData', {
        keyWords: this.get('keyWords'),
        scale: this.get('scale'),
        minLng: this.get('minLng'),
        minLat: this.get('minLat'),
        maxLng: this.get('maxLng'),
        maxLat: this.get('maxLat')
      });
    }
  }
});
