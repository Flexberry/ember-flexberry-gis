/**
  @module ember-flexberry-gis
*/
import { once } from '@ember/runloop';

import { guidFor } from '@ember/object/internals';
import { getOwner } from '@ember/application';
import { isNone } from '@ember/utils';
import { A } from '@ember/array';
import { Promise, allSettled } from 'rsvp';
import { observer, set, get } from '@ember/object';
import BaseLayer from '../base-layer';

/**
  WithHistory layer component for leaflet map.

  @class WithHistoryLayerComponent
  @extends BaseLayerComponent
 */
export default BaseLayer.extend({
  /**
    History layer

    @property historyLayer
  */
  historyLayer: null,

  /**
    Main layer

    @property mainLayer
  */
  mainLayer: null,

  /**
    history mode enabled

    @property historyModeEnabled
  */
  historyModeEnabled: false,

  historyModeEnabledObserver: observer('layerModel.historyModeEnabled', function () {
    this.set('historyModeEnabled', this.get('layerModel.historyModeEnabled'));
    this._setLayerVisibility();
  }),

  /**
    Creates leaflet layer related to layer type.

    @method createVectorLayer
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createLayer() {
    return new Promise((resolve, reject) => {
      this.createAllLayer();
      const promises = A();
      promises.push(this.get('mainLayer._leafletLayerPromise'));
      promises.push(this.get('mainLayer.historyLayer').get('_leafletLayerPromise'));

      allSettled(promises).then((layers) => {
        const rejected = layers.filter((item) => item.state === 'rejected').length > 0;

        if (rejected) {
          reject(`Failed to create leaflet layer for '${this.get('layerModel.name')}`);
        }

        const layer = layers[0].value;
        set(this.get('layerModel'), '_attributesOptions', this._getAttributesOptions.bind(this));
        set(layer, 'mainLayer', this.get('mainLayer'));
        set(layer, 'baseShowAllLayerObjects', layer.showAllLayerObjects);
        layer.showAllLayerObjects = this.get('showAllLayerObjects').bind(this);
        set(layer, 'baseHideAllLayerObjects', layer.hideAllLayerObjects);
        layer.hideAllLayerObjects = this.get('hideAllLayerObjects').bind(this);
        resolve(layer);
      }).catch((e) => {
        reject(`Failed to create leaflet layer for '${this.get('layerModel.name')}': ${e}`);
      });
    });
  },

  /**
    Initializes component.
  */
  createAllLayer() {
    const settings = this.get('layerModel.settingsAsObject');
    const leafletMap = this.get('leafletMap');
    if (!isNone(settings) && !isNone(leafletMap)) {
      const mainType = get(settings, 'type');

      const layerProperties = {
        leafletMap,
        leafletContainer: this.get('leafletContainer'),
        layerModel: this.get('layerModel'),
        index: this.get('index'),
        visibility: false,
        dynamicProperties: settings,
      };

      // Set creating component's owner to avoid possible lookup exceptions.
      this.setOwner(layerProperties);

      const mainLayer = getOwner(this).factoryFor(`component:layers/${mainType}-layer`).create(layerProperties);
      if (!isNone(mainLayer)) {
        mainLayer.layerId = guidFor(mainLayer);
        this.set('mainLayer', mainLayer);

        const historyLayersSettings = get(settings, 'historyLayer');
        A(Object.keys(settings) || []).forEach((key) => {
          if (!historyLayersSettings.hasOwnProperty(key)) {
            set(historyLayersSettings, key, settings[key]);
          }
        });

        const historyLayerProperties = {
          leafletMap,
          leafletContainer: this.get('leafletContainer'),
          layerModel: this.get('layerModel'),
          index: this.get('index'),
          visibility: false,
          dynamicProperties: historyLayersSettings,
        };

        this.setOwner(historyLayerProperties);

        const { type, } = historyLayersSettings;
        const historyLayer = getOwner(this).factoryFor(`component:layers/${type}-layer`).create(historyLayerProperties);
        if (!isNone(historyLayer)) {
          historyLayer.layerId = guidFor(historyLayer);
        } else {
          throw (`Invalid layer type ${type} for layer ${this.get('layerModel.name')}`);
        }

        this.set('historyLayer', historyLayer);
        set(mainLayer, 'historyLayer', historyLayer);

        mainLayer.onLeafletMapEvent();
        historyLayer.onLeafletMapEvent();

        leafletMap.on('flexberry-map:create-feature:end', this.updateHistory, this);
        leafletMap.on('flexberry-map:edit-feature:end', this.updateHistory, this);
      } else {
        throw (`Invalid layer type ${mainType} for layer ${this.get('layerModel.name')}`);
      }
    }
  },

  updateHistory(e) {
    const id = get(e.layerModel, 'layerModel.id');
    if (this.get('layerModel.id') === id) {
      const historyLayer = this.get('historyLayer');
      if (!isNone(historyLayer)) {
        historyLayer.reload();
      }
    }
  },

  destroyLayer() {
    const mainLayer = this.get('mainLayer');
    if (!isNone(mainLayer)) {
      mainLayer.willDestroyElement();
    }

    const historyLayer = this.get('historyLayer');
    if (!isNone(historyLayer)) {
      historyLayer.willDestroyElement();
    }

    this.set('mainLayer', null);
    this.set('historyLayer', null);
  },

  /**
    Handles changes in settings.

    @method _searchPropertiesDidChange
    @private
  */
  _settingsDidChange: observer('layerModel.settingsAsObject', function () {
    once(this, '_resetLayer');
  }),

  /**
    Deinitializes DOM-related component's properties.
  */
  willDestroyElement() {
    this._destroyLayer();
    this._super(...arguments);
  },

  /**
    Sets leaflet layer's visibility.

    @method _setLayerVisibility
    @private
  */
  _setLayerVisibility() {
    if (this.get('visibility')) {
      const historyModeEnabled = this.get('historyModeEnabled');
      this.get('historyLayer').set('visibility', historyModeEnabled);
      this.get('mainLayer').set('visibility', !historyModeEnabled);
    } else {
      this.get('mainLayer').set('visibility', false);
      this.get('historyLayer').set('visibility', false);
    }
  },

  _setLayerOpacity() {
    const opacity = this.get('opacity');
    this.get('historyLayer').set('opacity', opacity);
    this.get('mainLayer').set('opacity', opacity);
  },

  /**
    Returns promise with the layer properties object.

    @method _getAttributesOptions
    @private
  */
  _getAttributesOptions() {
    return this.get('mainLayer')._getAttributesOptions();
  },

  /**
    Handles 'flexberry-map:identify' event of leaflet map.

    @method identify
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlngbounds">L.LatLngBounds</a>} options.boundingBox Bounds of identification area.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the bounding box.
    @param {Object[]} layers Objects describing those layers which must be identified.
    @param {Object[]} results Objects describing identification results.
    Every result-object has the following structure: { layer: ..., features: [...] },
    where 'layer' is metadata of layer related to identification result, features is array
    containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
    or a promise returning such array.
  */
  identify(e) {
    const historyModeEnabled = this.get('historyModeEnabled');
    const mainLayer = historyModeEnabled ? this.get('historyLayer') : this.get('mainLayer');
    if (!isNone(mainLayer)) {
      return mainLayer.identify.apply(mainLayer, arguments);
    }
  },

  /**
    Handles 'flexberry-map:search' event of leaflet map.

    @method search
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the search area.
    @param {Object[]} layer Object describing layer that must be searched.
    @param {Object} searchOptions Search options related to layer type.
    @param {Object} results Hash containing search results.
    @param {Object[]} results.features Array containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
    or a promise returning such array.
  */
  search(e) {
    const historyModeEnabled = this.get('historyModeEnabled');
    const mainLayer = historyModeEnabled ? this.get('historyLayer') : this.get('mainLayer');
    if (!isNone(mainLayer)) {
      return mainLayer.search.apply(mainLayer, arguments);
    }
  },

  /**
    Handles 'flexberry-map:query' event of leaflet map.

    @method _query
    @param {Object[]} layerLinks Array containing metadata for query
    @param {Object} e Event object.
    @param {Object} queryFilter Object with query filter paramteres
    @param {Object[]} results.features Array containing leaflet layers objects
    or a promise returning such array.
  */
  query(layerLinks, e) {
    const historyModeEnabled = this.get('historyModeEnabled');
    const mainLayer = historyModeEnabled ? this.get('historyLayer') : this.get('mainLayer');
    if (!isNone(mainLayer)) {
      return mainLayer.query.apply(mainLayer, arguments);
    }
  },

  /**
    Handles 'flexberry-map:getNearObject' event of leaflet map.

    @method getNearObject
    @param {Object} e Event object..
    @param {Object} featureLayer Leaflet layer object.
    @param {Number} featureId Leaflet layer object id.
    @param {Number} layerObjectId Leaflet layer id.
    @return {Ember.RSVP.Promise} Returns object with distance, layer model and nearest leaflet layer object.
  */
  getNearObject(e) {
    const historyModeEnabled = this.get('historyModeEnabled');
    const mainLayer = historyModeEnabled ? this.get('historyLayer') : this.get('mainLayer');
    if (!isNone(mainLayer)) {
      return mainLayer.getNearObject.apply(mainLayer, arguments);
    }
  },

  /**
    Show all layer objects.
    @method showAllLayerObjects
    @return {Promise}
  */
  showAllLayerObjects() {
    return new Promise((resolve, reject) => {
      const mainLayer = this.get('mainLayer');
      if (isNone(mainLayer) || isNone(mainLayer._leafletObject)) {
        return;
      }

      mainLayer._leafletObject.baseShowAllLayerObjects().then((result) => {
        resolve(result.value);
      }).catch(() => {
        reject(`Failed to showAllLayerObjects for '${this.get('layerModel.name')}`);
      });
    });
  },

  /**
    Hide all layer objects.
    @method hideAllLayerObjects
    @return nothing
  */
  hideAllLayerObjects() {
    const mainLayer = this.get('mainLayer');
    if (isNone(mainLayer) || isNone(mainLayer._leafletObject)) {
      return;
    }

    mainLayer._leafletObject.baseHideAllLayerObjects();
  },
});
