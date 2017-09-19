/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import { Query } from 'ember-flexberry-data';

/**
  Query settings for layer metadata loading.
*/
let _metadataSettings = {
  title: 'forms.gis-search-form.layer-metadata.title',
  modelName: 'new-platform-flexberry-g-i-s-layer-metadata',
  projectionName: 'LayerMetadataL',
  top: 5,
  fieldName: 'layerMetadata',
  tab: 'layer-metadata'
};

/**
  Query settings for maps loading.
*/
let _mapSettings = {
  title: 'forms.gis-search-form.maps.title',
  modelName: 'new-platform-flexberry-g-i-s-map',
  projectionName: 'MapL',
  top: 5,
  fieldName: 'maps',
  tab: 'maps'
};

/**
  Route for GIS search form.
  Loads data according to filters and paging settings

  @class GisSearchFormRoute
  @extends <a href="http://emberjs.com/api/classes/Ember.Route.html">Ember.Route</a>
*/
export default Ember.Route.extend({

  model() {
    // model for dropdown list on the 'open metadata in a map' panel
    return this._getQuery(_mapSettings.modelName, _mapSettings.projectionName, null, null, null);
  },

  /**
    A hook you can use to setup the controller for the current route.
    [More info](http://emberjs.com/api/classes/Ember.Route.html#method_setupController).

    @method setupController
    @param {<a href="http://emberjs.com/api/classes/Ember.Route.html">Ember.Controller</a>} controller Related controller.
    @param {Object} model Related model.
  */
  setupController(controller, model) {
    this._super(controller, model);

    controller.set('tabSettings', [_metadataSettings, _mapSettings]);
  },

  actions: {
    /**
      Loads data according to search query

      @method actions.doSearch
     */
    doSearch(req) {
      let tabSettings = this.get('controller').get('tabSettings');
      this.get('controller').set('error', null);
      this.get('controller').set('isLoading', true);

      // wheter it's a request from a specific control or a common one
      if (req.modelName) {
        // update top setting for common search
        let idx = tabSettings.findIndex((item) => { return item.modelName === req.modelName; });
        tabSettings[idx].top = req.top;
        this.get('controller').set('tabSettings', tabSettings);

        var query = this._getQuery(req.modelName, req.projectionName, req.top, req.skip, req.searchConditions);
        query.then((data) => {
          this.get('controller').set(req.fieldName, data);
        }).catch((errorMessage) => {
          this.get('controller').set('error', errorMessage);
        }).finally(() => {
          this.get('controller').set('isLoading', false);
        });
      } else {
        let queries = tabSettings.map((item) => {
          return this._getQuery(item.modelName, item.projectionName, item.top, null, req.searchConditions);
        });
        Ember.RSVP.all(queries).then((data) => {
          for (let i = 0; i < tabSettings.length; i++) {
            this.get('controller').set(tabSettings[i].fieldName, data[i]);
          }
        }).catch((errorMessage) => {
          this.get('controller').set('error', errorMessage);
        }).finally(() => {
          this.get('controller').set('isLoading', false);
        });
      }
    }
  },

  /**
    Produces data loading request.

    @method _getQuery
    @param {String} modelName Name of model to be loaded.
    @param {Stirng} projectionName Name of projection related to model, which must be used to loaad it.
    @param {Number} top Count of records to be loaded.
    @param {Number} skip Count of records to be skipped.
    @param {Object} searchConditions Hash object containing filtering data.
    @return {<a href="https://emberjs.com/api/ember/2.4/classes/RSVP.Promise">Ember.RSVP.Promise</a>} Promise which will be resolved with loaded data.
    @private
   */
  _getQuery(modelName, projectionName, top, skip, searchConditions) {
    let queryBuilder = new Query.Builder(this.get('store'))
      .from(modelName)
      .selectByProjection(projectionName);

    // If there are conditions - add them to the query.
    if (searchConditions && searchConditions.keyWords) {
      let keyWordsConditions = searchConditions.keyWords.split(',').map((item) => {
        let str = item.trim();
        return new Query.StringPredicate('keyWords').contains(str);
      });
      if (keyWordsConditions.length) {
        let condition = keyWordsConditions.length > 1 ? new Query.ComplexPredicate(Query.Condition.Or, ...keyWordsConditions) : keyWordsConditions[0];
        queryBuilder = queryBuilder.where(condition);
      }

      // TODO add all conditions handling.
    }

    if (top) { queryBuilder = queryBuilder.top(top); }

    if (skip) { queryBuilder = queryBuilder.skip(skip); }

    queryBuilder = queryBuilder.count();

    return this.get('store').query(modelName, queryBuilder.build());
  }
});
