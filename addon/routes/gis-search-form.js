/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import { Query } from 'ember-flexberry-data';

/**
  Route for GIS search form.
  Loads data according to filters and paging settings

  @class GisSearchFormRoute
  @extends Ember.Route
*/
export default Ember.Route.extend({
  /**
    Model for layer metadata list

    @property _metadata
    @type Array
    @default null
  */
  _metadata: null,

  /**
    Model for maps list

    @property _maps
    @type Array
    @default null
  */
  _maps: null,

  /**
    [Model hook](http://emberjs.com/api/classes/Ember.Route.html#method_model) that returns a model object according to request.

    @method model
    @param {Object} params
    @param {Object} transition
    @return {*} Model object according to request.
  */
  model() {
    return { metadata: this.get('_metadata'), maps: this.get('_maps') };
  },

  actions: {
    /**
      Loads the data according to request and refreshes current route
 
      @param {Object} req
    */
    loadData(req) {
      let that = this;

      const layerMetadataModelName = 'new-platform-flexberry-g-i-s-layer-metadata';
      const layerMetadataProjectionName = 'LayerMetadataL';
      const mapsModelName = 'new-platform-flexberry-g-i-s-map';
      const mapsProjectionName = 'MapL';

      // For the present it loads all the data
      let layerMetadataBuilder = new Query.Builder(this.get('store'))
        .from(layerMetadataModelName)
        .selectByProjection(layerMetadataProjectionName);
      let getMetadata = this.get('store').query(layerMetadataModelName, layerMetadataBuilder.build());

      let mapsBuilder = new Query.Builder(this.get('store'))
        .from(mapsModelName)
        .selectByProjection(mapsProjectionName);
      let getMaps = this.get('store').query(mapsModelName, mapsBuilder.build());

      Ember.RSVP.all([getMetadata, getMaps]).then((data) => {
        that._metadata = data[0];
        that._maps = data[1];
        that.refresh();
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
    }
  }
});
