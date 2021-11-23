/**
  @module ember-flexberry-gis
*/

import { A, isArray } from '@ember/array';

import {
  isEmpty,
  isNone,
  isBlank,
  isPresent
} from '@ember/utils';
import { Promise, all } from 'rsvp';
import { inject as service } from '@ember/service';
import EditFormRoute from 'ember-flexberry/routes/edit-form';
import { createLayerFromMetadata } from 'ember-flexberry-gis/utils/create-layer-from-metadata';
import QueryBuilder from 'ember-flexberry-data/query/builder';
import Condition from 'ember-flexberry-data/query/condition';
import FilterOperator from 'ember-flexberry-data/query/filter-operator';
import { SimplePredicate, ComplexPredicate } from 'ember-flexberry-data/query/predicate';

/**
  Edit map route.
  Loads map project & related layers hierarchy.

  @class MapRoute
  @extends EditFormRoute
*/
export default EditFormRoute.extend({
  queryParams: {
    setting: {
      refreshModel: false,
      replace: false,
      as: 'setting',
    },
    geofilter: {
      refreshModel: false,
      replace: false,
      as: 'geofilter',
    },
    zoom: {
      refreshModel: false,
      replace: false,
      as: 'zoom',
    },
    lat: {
      refreshModel: false,
      replace: false,
      as: 'lat',
    },
    lng: {
      refreshModel: false,
      replace: false,
      as: 'lng',
    },
    metadata: {
      refreshModel: false,
      replace: false,
      as: 'metadata',
    },
  },

  /**
   Service for Map loading from store
   */
  mapStore: service(),

  /**
    Service for managing map API.

    @property mapApi
    @type MapApiService
  */
  mapApi: service(),

  /**
    Name of model projection to be used as record's properties limitation.

    @property modelProjection
    @type String
    @default 'MapE'
  */
  modelProjection: 'MapE',

  /**
    Name of model to be used as form's record type.

    @property modelName
    @type String
    @default 'new-platform-flexberry-g-i-s-map'
  */
  modelName: 'new-platform-flexberry-g-i-s-map',

  /**
    Name of metadata model projection to be used as layer metadata properties limitation.

    @property metadataProjection
    @type String
    @default 'LayerMetadataE'
  */
  metadataProjection: 'LayerMetadataE',

  /**
    Name of metadata model to be used as layer metadata record type.

    @property metadataModelName
    @type String
    @default 'new-platform-flexberry-g-i-s-layer-metadata'
  */
  metadataModelName: 'new-platform-flexberry-g-i-s-layer-metadata',

  /**
    [Model hook](http://emberjs.com/api/classes/Ember.Route.html#method_model) that returns a map project for current route.
    Additionally loads layers according to metadata param.

    @method model
    @param {Object} params
    @param {Object} transition
    @return {*} Model of map project for current route.
  */
  model(params, transition) {
    const mapId = params.id;
    const modelQuery = this.get('mapStore').getMapById(mapId);
    const metadataQuery = this._getMetadata(params.metadata);

    return new Promise((resolve, reject) => {
      all([modelQuery, metadataQuery]).then((data) => {
        const [model, metadata] = data;
        this._addMetadata(model, metadata);
        resolve(model);
      }).catch((error) => {
        reject(error);
      });
    });
  },

  /**
    Setups controller for the current route.
    [More info](http://emberjs.com/api/classes/Ember.Route.html#method_setupController).

    @method setupController
    @param {Ember.Controller} controller
    @param {Object} model
  */
  setupController(controller, model) {
    this._super(...arguments);
    const layers = model.get('mapLayer');

    this.setLayerCategories(model, layers);

    const urlParams = ['zoom', 'lat', 'lng'];
    const currentParams = {};
    urlParams.forEach((param) => {
      currentParams[param] = controller.get(param);
      if (!isBlank(currentParams[param])) {
        model.set(param, currentParams[param]);
      } else {
        currentParams[param] = model.get(param);
      }
    });

    this.get('mapApi').addToApi('mapModel', model);

    this.transitionTo({
      queryParams: currentParams,
    });
  },

  setLayerCategories(model, layers) {
    if (layers) {
      let rootLayers = layers.filter(layer => isEmpty(layer.get('parent')));

      let hierarchy = this.sortLayersByIndex(rootLayers);
      model.set('hierarchy', hierarchy);

      let backgroundLayers = A();
      backgroundLayers.addObjects(hierarchy.filterBy('settingsAsObject.backgroundSettings.canBeBackground', true));
      model.set('backgroundLayers', backgroundLayers);

      let other = hierarchy.filter((layer) => {
        return isNone(layer.get('settingsAsObject')) || !layer.get('settingsAsObject.backgroundSettings.canBeBackground');
      });
      let otherLayers = A();
      otherLayers.addObjects(other);
      model.set('otherLayers', otherLayers);
    }
  },

  /**
    A hook you can use to reset controller values either when the model changes or the route is exiting.
    [More info](http://emberjs.com/api/classes/Ember.Route.html#method_resetController).

    @method resetController
    @param {Ember.Controller} controller
    @param {Boolean} isExisting
   */
  resetController(controller, isExiting) {
    this._super(...arguments);
    if (isExiting) {
      controller.set('zoom', null);
      controller.set('lat', null);
      controller.set('lng', null);
      controller.set('metadata', null);
    }

    this.get('mapApi').addToApi('mapModel', undefined);
  },

  /**
    Produces metadata loading request.

    @param {String} metadata Metadata ids to be used as query limitation.
  */
  _getMetadata(metadata) {
    if (!isPresent(metadata)) {
      return null;
    }

    let queryBuilder = new QueryBuilder(this.get('store'))
      .from(this.get('metadataModelName'))
      .selectByProjection(this.get('metadataProjection'));

    const conditions = metadata.split(',').map((item) => {
      const id = item.trim().toLowerCase();
      return new SimplePredicate('id', FilterOperator.Eq, id);
    });
    if (isArray(conditions)) {
      const condition = conditions.length > 1 ? new ComplexPredicate(Condition.Or, ...conditions) : conditions[0];
      queryBuilder = queryBuilder.where(condition);
    }

    return this.get('store').query(this.get('metadataModelName'), queryBuilder.build());
  },

  /**
    Adds metadata to the model mapLayer collection.

    @param {NewPlatformFlexberryGISMap} model Map model.
    @param {NewPlatformFlexberryGISLayerMetadata[]} metadata Metadata collection.
  */
  _addMetadata(model, metadata) {
    if (!isArray(metadata)) {
      return;
    }

    metadata.forEach((item) => {
      const newLayer = createLayerFromMetadata(item, this.get('store'));
      model.get('mapLayer').pushObject(newLayer);
    });
  },

  /**
    Recursively creates layers hierarchy.

    @method sortLayersByIndex
    @param layers FlexberryGisMapLayer[]
    @returns FlexberryGisMapLayer[]
  */
  sortLayersByIndex(layers) {
    let result = layers;
    if (result) {
      result = result.sortBy('index').reverse();
      result.forEach((item) => {
        if (isArray(item.get('layers'))) {
          item.set('layers', this.sortLayersByIndex(item.get('layers')));
        }
      }, this);
    }

    return result;
  },
});
