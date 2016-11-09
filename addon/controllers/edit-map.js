/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import EditFormController from 'ember-flexberry/controllers/edit-form';
import FlexberryMapActionsHandlerMixin from '../mixins/flexberry-map-actions-handler';
import FlexberryMaplayerActionsHandlerMixin from '../mixins/flexberry-maplayer-actions-handler';

/**
  Edit map controller.

  @class EditMapController
  @extends EditFormController
  @uses FlexberryMapActionsHandlerMixin
  @uses FlexberryMaplayerActionsHandlerMixin
*/
export default EditFormController.extend(
  FlexberryMapActionsHandlerMixin,
  FlexberryMaplayerActionsHandlerMixin, {
  /**
    Leaflet map.

    @property leafletMap
    @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
    @default null
  */
  leafletMap: null,

  /**
    Layer links object thats use for query data on map load

    @property layerLinks
    @type Ember.Array
    @default null
   */
  layerLinks: null,

  queryParams: ['geofilter'],

  /**
    Query parameter, contains json serialized object with property names and values
    @property filter
    @type String
    @default null
   */
  geofilter: null,

  /**
    Deserialized valued of filter property
    @property queryFilter
    @type object
    @computed
   */
  queryFilter: Ember.computed('geofilter', function () {
    let filter = this.get('geofilter');
    if (!Ember.isNone(filter)) {
      try {
        return JSON.parse(filter);
      } catch (e) {
        console.log('Wrong JSON query filter string: ' + filter);
      }
    }

    return {};
  }),

  /**
    Creates new layer as specified layer's child
    (overridden method from {{#crossLink "FlexberryMaplayerActionsHandlerMixin:createLayer:method"}}
    FlexberryMaplayerActionsHandlerMixin
    {{/crossLink}}).

    @method createLayer
    @param {Object} options Method options.
    @param {String} options.parentLayerPath Path to parent layer.
    @param {String} options.parentLayer Parent layer.
    @param {Object} options.layerProperties Object containing new layer properties.
    @returns {Object} Created layer.
    @private
  */
  createLayer(options) {
    options = options || {};
    let parentLayer = Ember.get(options, 'parentLayer');
    let layerProperties = Ember.get(options, 'layerProperties');

    let store = this.get('store');
    let layer = store.createRecord('new-platform-flexberry-g-i-s-map-layer', layerProperties);
    layer.set('parent', parentLayer);

    return layer;
  },

  /**
    Updates specified layer with given properties.
    (overridden method from {{#crossLink "FlexberryMaplayerActionsHandlerMixin:editLayer:method"}}
    FlexberryMaplayerActionsHandlerMixin
    {{/crossLink}}).

    @method editLayer
    @param {Object} options Method options.
    @param {String} options.layerPath Path to editing layer.
    @param {String} options.layer Editing layer.
    @param {Object} options.layerProperties Object containing edited layer properties.
    @returns {Object} Edited layer.
    @private
  */
  editLayer(options) {
    return this._super(...arguments);
  },

  /**
    Removes specified layer from layers hierarchy
    (overridden method from {{#crossLink "FlexberryMaplayerActionsHandlerMixin:/removeLayer:method"}}
    FlexberryMaplayerActionsHandlerMixin
    {{/crossLink}}).

    @method removeLayer
    @param {Object} options Method options.
    @param {String} options.layerPath Path to removing layer.
    @param {String} options.layer Removing layer itself.
    @returns {Object} Removed layer.
    @private
  */
  removeLayer(options) {
    options = options || {};
    let layer = Ember.get(options, 'layer');

    if (!Ember.isNone(layer)) {
      layer.deleteRecord();
    }

    let layers = Ember.get(layer, 'layers');
    if (Ember.isArray(layers)) {
      layers.forEach((childLayer) => {
        this.removeLayer({
          layer: childLayer
        });
      });
    }

    return layer;
  },

  /**
    Saves layers hierarchy related to current map project.

    @method saveLayers
    @return {<a href="http://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>} Save operation promise.
  */
  saveLayers() {
    let saveLayer = (layer) => {
      if (Ember.isNone(layer)) {
        return new Ember.RSVP.Promise((resolve, reject) => {
          // Return already resolved promise if layer is none.
          resolve();
        });
      }

      Ember.assert(
        `Wrong type of \`layer.save\` property, actual is \`${Ember.typeOf(layer.save)}\` but \`function\` is expected.`,
        Ember.typeOf(layer.save) === 'function');

      // Save layer itself & then it's child layers.
      return layer.save().then(() => {
        return new Ember.RSVP.Promise((resolve, reject) => {
          let childLayers = Ember.A(Ember.get(layer, 'layers') || []);
          let childLayersPromises = Ember.A();

          // Save child layers.
          childLayers.forEach((childLayer) => {
            childLayersPromises.pushObject(saveLayer(childLayer));
          });

          // Wait for all child promises to be resolved & resolve parent promise
          // (or reject if one of the child promises has been rejected).
          Ember.RSVP.all(childLayersPromises).then(() => {
            resolve();
          }).catch((reason) => {
            reject(reason);
          });
        });
      });
    };

    return saveLayer(this.get('model.rootLayer'));
  },

  /**
    Deletes layers hierarchy related to current map project.

    @method deleteLayers
    @return {<a href="http://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>} Delete operation promise.
  */
  deleteLayers() {
    let deleteLayer = (layer) => {
      return new Ember.RSVP.Promise((resolve, reject) => {
        if (Ember.isNone(layer)) {
          // Return already resolved promise if layer is none.
          resolve();
        } else {
          Ember.assert(
            `Wrong type of \`layer.destroyRecord\` property, actual is \`${Ember.typeOf(layer.destroyRecord)}\`, ` +
            `but \`function\` is expected.`,
            Ember.typeOf(layer.destroyRecord) === 'function');

          // Delete child layers first.
          let childLayers = Ember.A(Ember.get(layer, 'layers') || []);
          let childLayersPromises = Ember.A();
          childLayers.forEach((childLayer) => {
            childLayersPromises.pushObject(deleteLayer(childLayer));
          });

          // Wait for all child layers promises to be resolved & delete parent layer.
          // (or reject if one of the child promises has been rejected).
          Ember.RSVP.all(childLayersPromises).then(() => {
            // Clear property containing child layers references.
            childLayers.clear();
            Ember.set(layer, 'layers', null);

            return layer.destroyRecord();
          }).then(() => {
            resolve();
          })
          .catch((reason) => {
            reject(reason);
          });
        }
      });
    };

    return deleteLayer(this.get('model.rootLayer'));
  },

  /**
    Saves model related to current route, and returns to parent route after successful save (if 'close' parameter is true).
    (overridden method from {{#crossLink "EditFormController/delete:method"}}edit-form controller{{/crossLink}}.

    @param {Boolean} close Flag: indicates whether current route must be closed after successful save or not.
    @method save
    @return {<a href="http://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>} Save operation promise.
  */
  save(close) {
    this.send('dismissErrorMessages');
    this.onSaveActionStarted();

    // Save layers hierarchy, then save map project.
    this.saveLayers().then(() => {
      // Save map project.
      return this.get('model').save();
    }).then(() => {
      this.onSaveActionFulfilled();

      if (close) {
        this.close();
      } else {
        let routeName = this.get('routeName');
        if (Ember.typeOf(routeName) === 'string' && routeName.indexOf('.new') > 0)
        {
          this.transitionToRoute(routeName.slice(0, -4), this.get('model'));
        }
      }
    }).catch((reason) => {
      this.onSaveActionRejected(reason);
    }).finally((data) => {
      this.onSaveActionAlways(data);
    });
  },

  /**
    Deletes model related to current route, and returns to parent route after successful deletion.
    (overridden method from {{#crossLink "EditFormController/delete:method"}}edit-form controller{{/crossLink}}.

    @method delete
    @return {<a href="http://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>} Delete operation promise.
  */
  delete() {
    this.send('dismissErrorMessages');
    this.onDeleteActionStarted();

    // Delete layers hierarchy, then delete map project.
    this.deleteLayers().then(() => {
      // Delete map project.
      return this.get('model').destroyRecord();
    }).then(() => {
      this.onDeleteActionFulfilled();
    }).catch((reason) => {
      this.onDeleteActionRejected(reason);
    }).finally((data) => {
      this.onDeleteActionAlways(data);
    });
  }
});
