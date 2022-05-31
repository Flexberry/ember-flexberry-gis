/**
  @module ember-flexberry-gis
*/

import { A } from '@ember/array';

import $ from 'jquery';
import { getOwner } from '@ember/application';
import { isBlank, isNone } from '@ember/utils';
import { observer, get, computed } from '@ember/object';
import { on } from '@ember/object/evented';
import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';

import Ember from 'ember';
import { getBounds } from 'ember-flexberry-gis/utils/get-bounds-from-polygon';

/**
  Mixin containing additional logic for layer and layer-like models.
  @class LayerModelMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Mixin.create({
  /**
    Injected local-storage service.

    @property localStorageService
    @type <a href="http://emberjs.com/api/classes/Ember.Service.html">Ember.Service</a>
  */
  localStorageService: service('local-storage'),

  archTime: null,

  /**
    Object with layer's settings.
    @property settingsAsObject
    @type Object
    @default null
    @readOnly
  */
  settingsAsObject: null,

  /**
    Observes changes in 'settings' property and comutes related 'settingsAsObject' property.
    Computation implemented with observer, because sometimes browser doesn't recompute settingsAsObject,
    when it's computed property.

    @method _settingsDidChange
    @private
  */
  _settingsDidChange: on('init', observer('settings', 'map', 'map.mapLayer', function () {
    const stringToDeserialize = this.get('settings');
    let settingsAsObject = {};

    if (!isBlank(stringToDeserialize)) {
      try {
        const layerClassFactory = getOwner(this).knownForType('layer', this.get('type'));
        const defaultSettings = layerClassFactory.createSettings();
        settingsAsObject = $.extend(true, defaultSettings, JSON.parse(stringToDeserialize));
      } catch (e) {
        Ember.Logger.error(`Computation of 'settingsAsObject' property for '${this.get('name')}' layer has been failed: ${e}`);
      }
    }

    this.set('settingsAsObject', settingsAsObject);

    // Some layer properties can be stored in local-storage, so resulting layer model must be extended with them.
    this._applyLayerPropertiesFromLocalStorage();
  })),

  /**
    Applies layer properties stored in local-storage.

    @method _applyLayerPropertiesFromLocalStorage
    @private
  */
  _applyLayerPropertiesFromLocalStorage() {
    const mapId = this.get('map.id');
    const layerId = this.get('id');
    const localStorageLayer = isBlank(mapId) || isBlank(layerId) || isNone(this.get('localStorageService'))
      ? null
      : this.get('localStorageService').getFromStorage('layers', mapId).findBy('id', layerId);
    if (!isNone(localStorageLayer)) {
      // Remove id to avoid explicit merge.
      delete localStorageLayer.id;

      // Apply properties to layer model.
      localStorageLayer.forEach((propertyName) => {
        if (localStorageLayer.property.hasOwnProperty.call(propertyName)) {
          let value = get(localStorageLayer, propertyName);
          value = typeof value === 'object' ? $.extend(true, this.get(propertyName), value) : value;

          this.set(propertyName, value);
        }
      });
    }
  },

  /**
    Flag: indicates whether layer can be identified.
    @property canBeIdentified
    @type Boolean
    @readOnly
  */
  canBeIdentified: computed('isDeleted', 'type', 'settingsAsObject.identifySettings.canBeIdentified', function () {
    if (this.get('isDeleted')) {
      return false;
    }

    const layerClassFactory = getOwner(this).knownForType('layer', this.get('type'));
    const identifyOperationIsAvailableForLayerClass = A(get(layerClassFactory, 'operations') || []).includes('identify');
    const identifyOperationIsAvailableForLayerInstance = this.get('settingsAsObject.identifySettings.canBeIdentified') !== false;

    return identifyOperationIsAvailableForLayerClass && identifyOperationIsAvailableForLayerInstance;
  }),

  /**
    Flag: indicates whether 'search' operation is available for this layer.
    @property canBeSearched
    @type Boolean
    @readOnly
  */
  canBeSearched: computed('isDeleted', 'type', 'settingsAsObject.searchSettings.canBeSearched', function () {
    if (this.get('isDeleted')) {
      return false;
    }

    const layerClassFactory = getOwner(this).knownForType('layer', this.get('type'));
    const searchOperationIsAvailableForLayerClass = A(get(layerClassFactory, 'operations') || []).includes('search');
    const searchOperationIsAvailableForLayerInstance = this.get('settingsAsObject.searchSettings.canBeSearched') !== false;

    return searchOperationIsAvailableForLayerClass && searchOperationIsAvailableForLayerInstance;
  }),

  /**
    Flag: indicates whether 'context search' operation is available for this layer.
    @property canBeContextSearched
    @type Boolean
    @readOnly
  */
  canBeContextSearched: computed('isDeleted', 'type', 'settingsAsObject.searchSettings.canBeContextSearched', function () {
    if (this.get('isDeleted')) {
      return false;
    }

    const layerClassFactory = getOwner(this).knownForType('layer', this.get('type'));
    const searchOperationIsAvailableForLayerClass = A(get(layerClassFactory, 'operations') || []).includes('search');
    const searchOperationIsAvailableForLayerInstance = this.get('settingsAsObject.searchSettings.canBeContextSearched') !== false;

    return searchOperationIsAvailableForLayerClass && searchOperationIsAvailableForLayerInstance;
  }),

  /**
   Checks whether layer should be shown on minimap.
    @property showOnMinimap
    @type {Boolean} Flag: indicates whether layer should be shown on minimap.
    @readOnly
  */
  showOnMinimap: computed('settingsAsObject.showOnMinimap', function () {
    return this.get('settingsAsObject.showOnMinimap');
  }),

  /**
    Flag: layer's whether layer's legend can be displayed.
    @property hasLegend
    @type Boolean
    @readOnly
  */
  legendCanBeDisplayed: computed('isDeleted', 'type', 'settingsAsObject.legendSettings.legendCanBeDisplayed', function () {
    if (this.get('isDeleted')) {
      return false;
    }

    const layerClassFactory = getOwner(this).knownForType('layer', this.get('type'));
    const legendIsAvailableForLayerClass = A(get(layerClassFactory, 'operations') || []).includes('legend');
    const legendIsAvailableForLayerInstance = this.get('settingsAsObject.legendSettings.legendCanBeDisplayed') !== false;

    return legendIsAvailableForLayerClass && legendIsAvailableForLayerInstance;
  }),

  /**
    Collection of nested layers.
    @property layers
    @return {Array} collection of child layers
  */
  layers: computed('map', 'map.mapLayer', function () {
    try {
      const layers = this.get('map.mapLayer');
      if (layers) {
        const id = this.get('id');
        if (!isBlank(id)) {
          return layers.filterBy('parent.id', id);
        }
      }
    } catch (e) {
      Ember.Logger.error(`Computation of 'layers' property for '${this.get('name')}' layer has been failed: ${e}`);
    }

    return A();
  }),

  /**
    Layer's latLngBounds.
    @property bounds
    @readonly
    @return <a href="http://leafletjs.com/reference-1.1.0.html#latlngbounds">L.LatLngBounds</a> this layer's latLngBounds.
  */
  get bounds() {
  // bounds: computed(function () {
    const layers = this.get('layers').filterBy('visibility', true);
    const type = this.get('type');

    let layerBounds;

    if (type === 'group' && layers.length > 0) {
      const earthBounds = L.latLngBounds([
        [-90, -180],
        [90, 180]
      ]);

      layers.forEach((layer) => {
        if (!layerBounds && layerBounds.equals(earthBounds)) {
          const bounds = layer.get('bounds');
          layerBounds = layerBounds ? layerBounds.extend(bounds) : L.latLngBounds(bounds);
        }
      });
    } else {
      const boundingBox = this.get('boundingBox');
      const bounds = getBounds(boundingBox);
      layerBounds = L.latLngBounds([bounds.minLat, bounds.minLng], [bounds.maxLat, bounds.maxLng]);
    }

    return layerBounds;
  },
});
