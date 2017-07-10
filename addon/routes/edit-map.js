/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import EditFormRoute from 'ember-flexberry/routes/edit-form';

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
    }
  },

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
    Setups controller for the current route.
    [More info](http://emberjs.com/api/classes/Ember.Route.html#method_setupController).

    @method setupController
    @param {Ember.Controller} controller
    @param {Object} model
  */
  setupController(controller, model) {
    this._super(...arguments);
    let layers = model.get('mapLayer').filter(layer => Ember.isEmpty(layer.get('parent')));

    if (layers) {
      model.set('hierarchy', this.sortLayersByIndex(layers));
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

    this.transitionTo({ queryParams: currentParams });
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
    }
  },

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
