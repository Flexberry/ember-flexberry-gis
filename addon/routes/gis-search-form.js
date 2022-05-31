/**
  @module ember-flexberry-gis
*/

import { isNone } from '@ember/utils';

import $ from 'jquery';
import { A, isArray } from '@ember/array';
import { hash, all } from 'rsvp';
import Route from '@ember/routing/route';

import QueryBuilder from 'ember-flexberry-data/query/builder';
import Condition from 'ember-flexberry-data/query/condition';
import FilterOperator from 'ember-flexberry-data/query/filter-operator';
import {
  SimplePredicate, ComplexPredicate, StringPredicate, GeographyPredicate
} from 'ember-flexberry-data/query/predicate';
import FlexberryBoundingboxMapLoaderMixin from '../mixins/flexberry-boundingbox-map-loader';

/**
  Route for GIS search form.
  Loads data according to filters and paging settings
  @class GisSearchFormRoute
  @extends <a href="http://emberjs.com/api/classes/Ember.Route.html">Ember.Route</a>
*/
export default Route.extend(FlexberryBoundingboxMapLoaderMixin, {
  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    this._metadataSettings = this._metadataSettings || {
      title: 'forms.gis-search-form.layer-metadata.title',
      modelName: 'new-platform-flexberry-g-i-s-layer-metadata',
      projectionName: 'LayerMetadataL',
      top: 5,
      fieldName: 'layerMetadata',
      tab: 'layer-metadata',
    };

    this._mapSettings = this._mapSettings || {
      title: 'forms.gis-search-form.maps.title',
      modelName: 'new-platform-flexberry-g-i-s-map',
      projectionName: 'MapGisSearchFormL',
      top: 5,
      fieldName: 'maps',
      tab: 'maps',
    };
  },

  /**
    A hook you can implement to convert the URL into the model for this route.
    [More info](http://emberjs.com/api/classes/Ember.Route.html#method_model).

    @method model
    @param {Object} params
    @param {Object} transition
  */
  model() {
    return hash({
      // Get available maps list to be displayed in founded layer metadata toolbar.
      availableMaps: this._getQuery(this.get('_mapSettings.modelName'), this.get('_mapSettings.projectionName'), null, null, null),

      // Get map model to be displayed in `flexberry-boundingbox` component.
      boundingBoxComponentMap: this.getBoundingBoxComponentMapModel(),
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
      const controller = this.get('controller');
      const tabSettings = controller.get('tabSettings');
      controller.set('error', null);
      controller.set('isLoading', true);

      // wheter it's a request from a specific control or a common one
      if (req.modelName) {
        // update top setting for common search
        const idx = tabSettings.findIndex((item) => item.modelName === req.modelName);
        tabSettings[idx].top = req.top;
        this.get('controller').set('tabSettings', tabSettings);

        const query = this._getQuery(req.modelName, req.projectionName, req.top, req.skip, req.searchConditions);
        query.then((data) => {
          this.get('controller').set(req.fieldName, data);
        }).catch((error) => {
          const _controller = this.get('controller');
          _controller.set('error', error);
        }).finally(() => {
          this.get('controller').set('isLoading', false);
        });
      } else {
        const queries = tabSettings.map((item) => this._getQuery(item.modelName, item.projectionName, item.top, null, req.searchConditions));
        all(queries).then((data) => {
          for (let i = 0; i < tabSettings.length; i++) {
            this.get('controller').set(tabSettings[i].fieldName, data[i]);
          }
        }).catch((error) => {
          const _controller = this.get('controller');
          _controller.set('error', error);
        }).finally(() => {
          this.get('controller').set('isLoading', false);
        });
      }
    },
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
    let queryBuilder = new QueryBuilder(this.get('store'))
      .from(modelName)
      .selectByProjection(projectionName);

    // If there are conditions - add them to the query.
    let condition;
    const filterConditions = A();

    const getOrSeparatedCondition = (searchObject, key) => {
      const conditions = searchObject.split(',').map((item) => {
        const str = item.trim();
        return new StringPredicate(key).includes(str);
      });
      if (isArray(conditions)) {
        return conditions.length > 1 ? new ComplexPredicate(Condition.Or, ...conditions) : conditions[0];
      }

      return null;
    };

    if (searchConditions && searchConditions.keyWords) {
      const keyWordsCondition = getOrSeparatedCondition(searchConditions.keyWords, 'keyWords');
      if (keyWordsCondition) {
        filterConditions.addObject(keyWordsCondition);
      }
    }

    if (searchConditions && searchConditions.anyText) {
      const anyTextConditions = getOrSeparatedCondition(searchConditions.anyText, 'anyText');
      if (anyTextConditions) {
        filterConditions.addObject(anyTextConditions);
      }
    }

    if (searchConditions && searchConditions.scaleFilters && searchConditions.scaleFilters.length) {
      const scaleConditions = searchConditions.scaleFilters.map((item) => {
        let currentCondition = $('<textarea/>').html(item.condition).text();
        if (currentCondition === '=') {
          currentCondition = '==';
        }

        const scale = parseInt(item.scale, 10) || 0;
        return new SimplePredicate('scale', currentCondition, scale);
      });

      if (scaleConditions.length) {
        const scaleCondition = scaleConditions.length > 1 ? new ComplexPredicate(Condition.And, ...scaleConditions) : scaleConditions[0];
        filterConditions.addObject(scaleCondition);
      }
    }

    if (searchConditions && !isNone(searchConditions.boundingBoxEWKT)) {
      const boundingBoxIntersectionCondition = new GeographyPredicate('boundingBox').intersects(searchConditions.boundingBoxEWKT);
      const boundingBoxIsNullCondition = new SimplePredicate('boundingBox', FilterOperator.Eq, null);

      filterConditions.addObject(new ComplexPredicate(Condition.Or, boundingBoxIsNullCondition, boundingBoxIntersectionCondition));
    }

    if (filterConditions.length) {
      condition = filterConditions.length > 1 ? new ComplexPredicate(Condition.And, ...filterConditions) : filterConditions[0];
    }

    if (condition) { queryBuilder = queryBuilder.where(condition); }

    if (top) { queryBuilder = queryBuilder.top(top); }

    if (skip) { queryBuilder = queryBuilder.skip(skip); }

    queryBuilder = queryBuilder.count();

    return this.get('store').query(modelName, queryBuilder.build());
  },
});
