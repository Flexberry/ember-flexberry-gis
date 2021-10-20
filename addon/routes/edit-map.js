/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import EditFormRoute from 'ember-flexberry/routes/edit-form';
import { createLayerFromMetadata } from 'ember-flexberry-gis/utils/create-layer-from-metadata';
import { Query } from 'ember-flexberry-data';

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
      as: 'setting'
    },
    geofilter: {
      refreshModel: false,
      replace: false,
      as: 'geofilter'
    },
    zoom: {
      refreshModel: false,
      replace: false,
      as: 'zoom'
    },
    lat: {
      refreshModel: false,
      replace: false,
      as: 'lat'
    },
    lng: {
      refreshModel: false,
      replace: false,
      as: 'lng'
    },
    metadata: {
      refreshModel: false,
      replace: false,
      as: 'metadata'
    }
  },

  /**
   Service for Map loading from store
   */
  mapStore: Ember.inject.service(),

  /**
    Service for managing map API.

    @property mapApi
    @type MapApiService
  */
  mapApi: Ember.inject.service(),

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
    let mapId = params.id;
    let modelQuery = this.get('mapStore').getMapById(mapId);
    let metadataQuery = this._getMetadata(params.metadata);

    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.RSVP.all([modelQuery, metadataQuery]).then((data) => {
        let [model, metadata] = data;
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
    let layers = model.get('mapLayer');

    this.setLayerCategories(model, layers);

    let urlParams = ['zoom', 'lat', 'lng'];
    let currentParams = {};
    urlParams.forEach((param) => {
      currentParams[param] = controller.get(param);
      if (!Ember.isBlank(currentParams[param])) {
        model.set(param, currentParams[param]);
      } else {
        currentParams[param] = model.get(param);
      }
    });

    this.get('mapApi').addToApi('mapModel', model);

    this.transitionTo({
      queryParams: currentParams
    });
  },

  setLayerCategories(model, layers) {
    if (layers) {
      let rootLayers = layers.filter(layer => Ember.isEmpty(layer.get('parent')));

      let hierarchy = this.sortLayersByIndex(rootLayers);
      model.set('hierarchy', hierarchy);

      let backgroundLayers = Ember.A();
      backgroundLayers.addObjects(hierarchy.filterBy('settingsAsObject.backgroundSettings.canBeBackground', true));
      model.set('backgroundLayers', backgroundLayers);

      let other = hierarchy.filter((layer) => {
        return Ember.isNone(layer.get('settingsAsObject')) || !layer.get('settingsAsObject.backgroundSettings.canBeBackground');
      });
      let otherLayers = Ember.A();
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
    if (!Ember.isPresent(metadata)) {
      return null;
    }

    let queryBuilder = new Query.Builder(this.get('store'))
      .from(this.get('metadataModelName'))
      .selectByProjection(this.get('metadataProjection'));

    let conditions = metadata.split(',').map((item) => {
      let id = item.trim().toLowerCase();
      return new Query.SimplePredicate('id', Query.FilterOperator.Eq, id);
    });
    if (Ember.isArray(conditions)) {
      let condition = conditions.length > 1 ? new Query.ComplexPredicate(Query.Condition.Or, ...conditions) : conditions[0];
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
    if (!Ember.isArray(metadata)) {
      return;
    }

    metadata.forEach((item) => {
      let newLayer = createLayerFromMetadata(item, this.get('store'));
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
        if (Ember.isArray(item.get('layers'))) {
          item.set('layers', this.sortLayersByIndex(item.get('layers')));
        }
      }, this);
    }

    return result;
  }
});
