/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import EditFormRoute from 'ember-flexberry/routes/edit-form';
import MapLayersLoaderMixin from '../mixins/map-layers-loader';
import { Query } from 'ember-flexberry-data';

/**
  Edit map route.
  Loads map project & related layers hierarchy.

  @class MapRoute
  @extends EditFormRoute
  @uses MapLayersLoaderMixin
*/
export default EditFormRoute.extend(MapLayersLoaderMixin, {
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
    }
  },

  /**
    Name of model to be used as layer link defined by query parameters.

    @property layerLinkModelName
    @type String
    @default 'new-platform-flexberry-g-i-s-layer-link'
  */
  layerLinkModelName: 'new-platform-flexberry-g-i-s-layer-link',

  /**
    Name of model projection to be used with layer link defined by query parameters.

    @property layerLinkProjection
    @type String
    @default 'LayerLinkD'
  */
  layerLinkProjection: 'LayerLinkD',

  /**
    Loaded layer links.

    @property layerLinks
    @type Object[]
    @default null
  */
  layerLinks: null,

  /**
    Name of CSW connection model projection to be used as record's properties limitation.

    @property cswConnectionProjection
    @type String
    @default 'MapE'
  */
  cswConnectionProjection: 'CswConnectionE',

  /**
    Name of CSW connection model to be used as form's record type.

    @property modelName
    @type String
    @default 'new-platform-flexberry-g-i-s-csw-connection'
  */
  cswConnectionModelName: 'new-platform-flexberry-g-i-s-csw-connection',

  /**
    Loaded CSW connections.

    @property cswConnections
    @type Object[]
    @default null
  */
  cswConnections: null,

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
    Loads layer links defined in query params.

    @method loadLayerLinks
    @param {Object} params Query parameters.
    @return {<a href="http://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>}
    Promise which will return available layer links after it will be resolved.
  */
  loadLayerLinks(params) {
    params = params || {};

    // Don't send request if layer links are not defined in query params.
    if (Ember.isBlank(params.setting)) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        resolve(null);
      });
    }

    let store = this.get('store');
    let modelName = this.get('layerLinkModelName');
    let query = new Query.Builder(store)
      .from(modelName)
      .selectByProjection(this.get('layerLinkProjection'))
      .where('mapObjectSetting', Query.FilterOperator.Eq, params.setting);

    return store.query(modelName, query.build()).then(layerLinks => {
      this.set('layerLinks', layerLinks.toArray());
    });
  },

  /**
    Loads available CSW connections.

    @method loadCswConnections
    @param {Object} params Query parameters.
    @return {<a href="http://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>}
    Promise which will return available CSW connections after it will be resolved.
  */
  loadCswConnections(params) {
    let store = this.get('store');
    let modelName = this.get('cswConnectionModelName');
    let query = new Query.Builder(store)
      .from(modelName)
      .selectByProjection(this.get('cswConnectionProjection'));

    return store.query(modelName, query.build()).then((cswConnections) => {
      this.set('cswConnections', cswConnections.toArray());
    });
  },

  /**
    [Model hook](http://emberjs.com/api/classes/Ember.Route.html#method_model) that returns a map project for current route.

    @method model
    @param {Object} params
    @param {Object} transition
    @return {<a href="http://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>}
    Promise which will return map project related to current route & it's layers hierarchy.
  */
  model(params) {
    let mapPromise = this.loadMapLayers(this._super(...arguments));

    return this.loadLayerLinks(params).then(() => {
      this.loadCswConnections(params);
    }).then(() => {
      return this.loadMapLayers(mapPromise);
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
    let layers = model.get('rootLayer.layers');
    if (layers) {
      model.set('rootLayer.layers', this.sortLayersByIndex(layers));
    }

    controller.set('layerLinks', this.get('layerLinks'));
    controller.set('cswConnections', this.get('cswConnections'));
  },

  sortLayersByIndex(layers) {
    let result = layers;
    if (result) {
      result = result.sortBy('index');
      result.forEach((item) => {
        if (item.get('type') === 'group') {
          item.set('layers', this.sortLayersByIndex(item.get('layers')));
        }
      }, this);
    }

    return result;
  }
});
