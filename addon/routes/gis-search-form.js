/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import { Query } from 'ember-flexberry-data';

/**
  Route for GIS search form.
  Loads data according to filters and paging settings

  @class GisSearchFormRoute
  @extends <a href="http://emberjs.com/api/classes/Ember.Route.html">Ember.Route</a>
*/
export default Ember.Route.extend({
  /**
    A hook you can use to setup the controller for the current route.
    [More info](http://emberjs.com/api/classes/Ember.Route.html#method_setupController).

    @method setupController
    @param {Ember.Controller} controller
    @param {Object} model
  */
  setupController(controller, model) {
    this._super(controller, model);

    controller.set('tabSettings', [{
      title: 'gis-search-form.layer-metadata.title',
      modelName: 'new-platform-flexberry-g-i-s-layer-metadata',
      projectionName: 'LayerMetadataL',
      top: 5,
      fieldName: 'layerMetadata',
      tab: 'layer-metadata',
      header: {
        name: 'gis-search-form.layer-metadata.header.name',
        type: 'gis-search-form.layer-metadata.header.type'
      }
    }, {
      title: 'gis-search-form.maps.title',
      modelName: 'new-platform-flexberry-g-i-s-map',
      projectionName: 'MapL',
      top: 5,
      fieldName: 'maps',
      tab: 'maps',
      header: {
        name: 'gis-search-form.maps.header.name',
        lat: 'gis-search-form.maps.header.lat',
        lng: 'gis-search-form.maps.header.lng',
        zoom: 'gis-search-form.maps.header.zoom',
        public: 'gis-search-form.maps.header.public'
      }
    }]);
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
    @param {*} modelName
    @param {*} projectionName
    @param {*} top
    @param {*} skip
    @param {*} searchConditions
    @return {<a href="https://emberjs.com/api/ember/2.4/classes/RSVP.Promise">Ember.RSVP.Promise</a>} Promise which will be resolved with loaded data.
    @private
   */
  _getQuery(modelName, projectionName, top, skip, searchConditions) {
    let queryBuilder = new Query.Builder(this.get('store'))
      .from(modelName)
      .selectByProjection(projectionName);

    // If there are conditions - add them to the query
    if (searchConditions.keyWords) {
      let keyWordsConditions = searchConditions.keyWords.split(',').map((item) => {
        let str = item.trim();
        return new Query.StringPredicate('keyWords').contains(str);
      });
      if (keyWordsConditions.length) {
        let condition = keyWordsConditions.length > 1 ? new Query.ComplexPredicate(Query.Condition.Or, ...keyWordsConditions) : keyWordsConditions[0];
        queryBuilder = queryBuilder.where(condition);
      }

      // TODO add all conditions handling
    }

    if (top) { queryBuilder = queryBuilder.top(top); }

    if (skip) { queryBuilder = queryBuilder.skip(skip); }

    queryBuilder = queryBuilder.count();

    return this.get('store').query(modelName, queryBuilder.build());
  }
});
