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
    Configuration hash for this route's queryParams. [More info](http://emberjs.com/api/classes/Ember.Route.html#property_queryParams).

    @property queryParams
    @type Object
   */
  queryParams: {
    keyWords: { refreshModel: true },
    scaleFrom: { refreshModel: true },
    scaleTo: { refreshModel: true },
    minLng: { refreshModel: true },
    minLat: { refreshModel: true },
    maxLng: { refreshModel: true },
    maxLat: { refreshModel: true }
  },

  /**
    [Model hook](http://emberjs.com/api/classes/Ember.Route.html#method_model) that returns a model object according to request.

    @method model
    @param {Object} params
    @return {*} Model object according to request.
  */
  model(params) {
    const layerMetadataModelName = 'new-platform-flexberry-g-i-s-layer-metadata';
    const layerMetadataProjectionName = 'LayerMetadataL';
    const mapsModelName = 'new-platform-flexberry-g-i-s-map';
    const mapsProjectionName = 'MapL';

    let layerMetadataBuilder = new Query.Builder(this.get('store'))
      .from(layerMetadataModelName)
      .selectByProjection(layerMetadataProjectionName);
    let mapsBuilder = new Query.Builder(this.get('store'))
      .from(mapsModelName)
      .selectByProjection(mapsProjectionName);

    // If there are conditions - add them to the query
    if (params.keyWords) {
      let keyWordsConditions = params.keyWords.split(',').map((item) => {
        let str = item.trim();
        return new Query.StringPredicate('keyWords').contains(str);
      });
      if (keyWordsConditions.length) {
        let condition = keyWordsConditions.length > 1 ? new Query.ComplexPredicate(Query.Condition.Or, ...keyWordsConditions) : keyWordsConditions[0];
        layerMetadataBuilder = layerMetadataBuilder.where(condition);
        mapsBuilder = mapsBuilder.where(condition);
      }
    }

    let getMetadata = this.get('store').query(layerMetadataModelName, layerMetadataBuilder.build());
    let getMaps = this.get('store').query(mapsModelName, mapsBuilder.build());
    return Ember.RSVP.all([getMetadata, getMaps]);
  },
  setupController(controller, model) {
    this._super(controller, model);

    // Pass query params to search conditions
    controller.set('searchConditions', controller.getProperties(['keyWords', 'scaleFrom', 'scaleTo', 'minLng', 'minLat', 'maxLng', 'maxLat']));

    // Add named data params to controller
    controller.set('layerMetadata', model[0]);
    controller.set('mapsData', model[1]);
  },
  actions: {
    loadData(req) {
      let that = this;

      let b1 = new Query.Builder(this.store)
        .from('new-platform-flexberry-g-i-s-layer-metadata')
        .selectByProjection('LayerMetadataL')
        .count();
      let getMetadata = this.store.query('new-platform-flexberry-g-i-s-layer-metadata', b1.build());

      let b2 = new Query.Builder(this.store)
        .from('new-platform-flexberry-g-i-s-map')
        .selectByProjection('MapL')
        .count();
      let getMaps = this.store.query('new-platform-flexberry-g-i-s-map', b2.build());

      Ember.RSVP.all([getMetadata, getMaps]).then((data) => {
        that._metadata = data[0];
        that._metadataCount = data[0].meta.count;
        that._maps = data[1];
        that._mapsCount = data[1].meta.count;
        that.refresh();
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
    },

    getDataExt(req) {
      let that = this;
      that.changingModel = req.modelName;
      let builder = new Query.Builder(this.store)
        .from(req.modelName)
        .selectByProjection(req.projectionName)
        .top(req.top)
        .skip(req.skip)
        .count();
      let query = this.store.query(req.modelName, builder.build());
      query.then((data) => {
        switch (that.changingModel) {
          case 'new-platform-flexberry-g-i-s-layer-metadata':
            that._metadata = data;
            that._metadataCount = data.meta.count;
          break;
          case 'new-platform-flexberry-g-i-s-map':
            that._maps = data;
            that._mapsCount = data.meta.count;
          break;
        }
        that.refresh();
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
    }
  }
});
