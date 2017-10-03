/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import EditFormRoute from 'ember-flexberry/routes/edit-form';
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
    Injected local-storage-service.

    @property service
    @type <a href="http://emberjs.com/api/classes/Ember.Service.html">Ember.Service</a>
    @default service:local-storage
  */
  service: Ember.inject.service('local-storage'),

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
    let modelQuery = this._super.apply(this, arguments);
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

    if (layers) {
      let rootLayers = layers.filter(layer => Ember.isEmpty(layer.get('parent')));

      model.set('hierarchy', this.sortLayersByIndex(rootLayers));
      this.initLayersFromLocalStorage(model.get('id'), layers);
    }

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

    this.transitionTo({
      queryParams: currentParams
    });
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
  },

  /**
    Produces metadata loading request.

    @param {String} metadata Metadata ids to be used as query limitation.
  */
  _getMetadata(metadata) {
    if (Ember.isPresent(metadata)) {
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
    }

    return null;
  },

  /**
    Adds metadata to the model mapLayer collection.

    @param {*} model Map model.
    @param {*} metadata Metadata collection.
  */
  _addMetadata(model, metadata) {
    if (Ember.isArray(metadata)) {
      metadata.forEach((item) => {
        let newLayer = this.get('store').createRecord('new-platform-flexberry-g-i-s-map-layer', {
          name: item.get('name'),
          description: item.get('description'),
          keyWords: item.get('keyWords'),
          type: item.get('type'),
          settings: item.get('settings'),
          scale: item.get('scale'),
          coordinateReferenceSystem: item.get('coordinateReferenceSystem'),
          boundingBox: item.get('boundingBox'),

          // If user has chosen to open metadata on map, then layer created on metadata basics must be visible by default.
          visibility: true
        });
        model.get('mapLayer').pushObject(newLayer);
      });
    }
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
  },

  /**
    Binds data from localStorage to layers' properties.

    @method initLayersFromLocalStorage
    @param mapId {String}
    @param layers FlexberryGisMapLayer[]
  */
  initLayersFromLocalStorage(mapId, layers) {
    let localLayers = this.get('service').getFromStorage('layers', mapId);

    for (let local of localLayers) {
      // Find suitable layer.
      let layer = layers.findBy('id', local.id);

      if (Ember.isBlank(layer)) {
        continue;
      }

      // Remove id to avoid explicit merge.
      delete local.id;

      // Bind properties to maplayer from local stored layer.
      for (let p in local) {
        if (!local.hasOwnProperty(p)) {
          return;
        }

        let value = Ember.get(local, p);

        // If property is object - it should be merged.
        layer.set(p, typeof local[p] !== 'object' ? value : Object.assign(layer.get(p), value));
      }
    }
  }
});
