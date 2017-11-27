/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import { Query } from 'ember-flexberry-data';
import FlexberryBoundingboxMapLoaderMixin from '../mixins/flexberry-boundingbox-map-loader';

/**
  Route for GIS search form.
  Loads data according to filters and paging settings
  @class GisSearchFormRoute
  @extends <a href="http://emberjs.com/api/classes/Ember.Route.html">Ember.Route</a>
*/
export default Ember.Route.extend(FlexberryBoundingboxMapLoaderMixin, {
  /**
    Query settings for layer metadata loading.
  */
  _metadataSettings: {
    title: 'forms.gis-search-form.layer-metadata.title',
    modelName: 'new-platform-flexberry-g-i-s-layer-metadata',
    projectionName: 'LayerMetadataL',
    top: 5,
    fieldName: 'layerMetadata',
    tab: 'layer-metadata'
  },

  /**
    Query settings for maps loading.
  */
  _mapSettings: {
    title: 'forms.gis-search-form.maps.title',
    modelName: 'new-platform-flexberry-g-i-s-map',
    projectionName: 'MapGisSearchFormL',
    top: 5,
    fieldName: 'maps',
    tab: 'maps'
  },

  /**
    A hook you can implement to convert the URL into the model for this route.
    [More info](http://emberjs.com/api/classes/Ember.Route.html#method_model).

    @method model
    @param {Object} params
    @param {Object} transition
  */
  model() {
    return Ember.RSVP.hash({
      // Get available maps list to be displayed in founded layer metadata toolbar.
      availableMaps: this._getQuery(this.get('_mapSettings.modelName'), this.get('_mapSettings.projectionName'), null, null, null),

      // Get map model to be displayed in `flexberry-boundingbox` component.
      boundingBoxComponentMap: this.getBoundingBoxComponentMapModel()
    });
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

    controller.set('tabSettings', [this.get('_mapSettings'), this.get('_metadataSettings')]);
  },

  actions: {
    /**
      Loads data according to search query.

      @method actions.doSearch
    */
    doSearch(req) {
      let controller = this.get('controller');
      let tabSettings = controller.get('tabSettings');
      controller.set('error', null);
      controller.set('isLoading', true);

      // wheter it's a request from a specific control or a common one
      if (req.modelName) {
        // update top setting for common search
        let idx = tabSettings.findIndex((item) => { return item.modelName === req.modelName; });
        tabSettings[idx].top = req.top;
        this.get('controller').set('tabSettings', tabSettings);

        var query = this._getQuery(req.modelName, req.projectionName, req.top, req.skip, req.searchConditions);
        query.then((data) => {
          this.get('controller').set(req.fieldName, data);
        }).catch((error) => {
          let controller = this.get('controller');
          controller.set('error', error);
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
        }).catch((error) => {
          let controller = this.get('controller');
          controller.set('error', error);
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
    let condition;
    let filterConditions = Ember.A();

    let getOrSeparatedCondition = (searchObject, key) => {
      let conditions = searchObject.split(',').map((item) => {
        let str = item.trim();
        return new Query.StringPredicate(key).contains(str);
      });
      if (Ember.isArray(conditions)) {
        return conditions.length > 1 ? new Query.ComplexPredicate(Query.Condition.Or, ...conditions) : conditions[0];
      }

      return null;
    };

    if (searchConditions && searchConditions.keyWords) {
      let keyWordsCondition = getOrSeparatedCondition(searchConditions.keyWords, 'keyWords');
      if (keyWordsCondition) {
        filterConditions.addObject(keyWordsCondition);
      }
    }

    if (searchConditions && searchConditions.anyText) {
      let anyTextConditions = getOrSeparatedCondition(searchConditions.anyText, 'anyText');
      if (anyTextConditions) {
        filterConditions.addObject(anyTextConditions);
      }
    }

    if (searchConditions && searchConditions.scaleFilters && searchConditions.scaleFilters.length) {
      let scaleConditions = searchConditions.scaleFilters.map((item) => {
        let currentCondition = Ember.$('<textarea/>').html(item.condition).text();
        if (currentCondition === '=') {
          currentCondition = '==';
        }

        let scale = parseInt(item.scale) || 0;
        return new Query.SimplePredicate('scale', currentCondition, scale);
      });

      if (scaleConditions.length) {
        let scaleCondition = scaleConditions.length > 1 ? new Query.ComplexPredicate(Query.Condition.And, ...scaleConditions) : scaleConditions[0];
        filterConditions.addObject(scaleCondition);
      }
    }

    if (searchConditions && !Ember.isNone(searchConditions.boundingBoxEWKT)) {

      let boundingBoxIntersectionCondition = new Query.GeographyPredicate('boundingBox').intersects(searchConditions.boundingBoxEWKT);
      let boundingBoxIsNullCondition = new Query.SimplePredicate('boundingBox', Query.FilterOperator.Eq, null);

      filterConditions.addObject(new Query.ComplexPredicate(Query.Condition.Or, boundingBoxIsNullCondition, boundingBoxIntersectionCondition));
    }

    if (filterConditions.length) {
      condition = filterConditions.length > 1 ? new Query.ComplexPredicate(Query.Condition.And, ...filterConditions) : filterConditions[0];
    }

    if (condition) { queryBuilder = queryBuilder.where(condition); }

    if (top) { queryBuilder = queryBuilder.top(top); }

    if (skip) { queryBuilder = queryBuilder.skip(skip); }

    queryBuilder = queryBuilder.count();

    return this.get('store').query(modelName, queryBuilder.build());
  }
});
