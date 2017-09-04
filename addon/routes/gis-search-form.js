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
        let condition = keyWordsConditions.length > 1 ? new Query.ComplexPredicate(Query.Condition.And, ...keyWordsConditions) : keyWordsConditions[0];
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
  }
});
