/**
  @module ember-flexberry-gis
*/
import { once } from '@ember/runloop';

import { guidFor } from '@ember/object/internals';
import { getOwner } from '@ember/application';
import { isNone } from '@ember/utils';
import { set, get, observer } from '@ember/object';
import { A } from '@ember/array';
import { Promise, allSettled } from 'rsvp';
import { checkMapZoom } from '../../utils/check-zoom';
import BaseLayer from '../base-layer';

/**
  Combine layer component for leaflet map.

  @class CombineLayerComponent
  @extends BaseLayerComponent
 */
export default BaseLayer.extend({
  /**
    Inner layers.

    @property innerLayers
  */
  innerLayers: null,

  /**
    Main layer.

    @property mainLayer
  */
  mainLayer: null,

  /**
    Дayer whose visibility is enabled.

    @property layerVisibility
  */
  layerVisibility: null,

  /**
    Creates leaflet layer related to layer type.

    @method createVectorLayer
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|
      <a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createLayer() {
    return new Promise((resolve, reject) => {
      this.createAllLayer();
      const promises = A();
      promises.push(this.get('mainLayer._leafletLayerPromise'));
      this.get('mainLayer.innerLayers').forEach((layer) => {
        promises.push(layer.get('_leafletLayerPromise'));
      });

      allSettled(promises).then((layers) => {
        const rejected = layers.filter((item) => item.state === 'rejected').length > 0;

        if (rejected) {
          reject(new Error(`Failed to create leaflet layer for '${this.get('layerModel.name')}`));
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
        reject(new Error(`Failed to create leaflet layer for '${this.get('layerModel.name')}': ${e}`));
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

        const innerLayers = A();
        const innerLayersSettings = get(settings, 'innerLayers');
        innerLayersSettings.forEach((innerSettings) => {
          const innerLayerProperties = {
            leafletMap,
            leafletContainer: this.get('leafletContainer'),
            layerModel: this.get('layerModel'),
            index: this.get('index'),
            visibility: false,
            dynamicProperties: innerSettings,
          };

          // Set creating component's owner to avoid possible lookup exceptions.
          this.setOwner(innerLayerProperties);

          const { type, } = innerSettings;
          const layer = getOwner(this).factoryFor(`component:layers/${type}-layer`).create(innerLayerProperties);
          if (!isNone(layer)) {
            layer.layerId = guidFor(layer);
            innerLayers.addObject(layer);
          } else {
            throw new Error(`Invalid layer type ${type} for layer ${this.get('layerModel.name')}`);
          }
        });

        this.set('innerLayers', innerLayers);
        set(mainLayer, 'innerLayers', innerLayers);
        leafletMap.on('zoomend', this._visibilityOfLayerByZoom, this);
        mainLayer.onLeafletMapEvent();
        mainLayer.get('innerLayers').forEach((layer) => {
          layer.onLeafletMapEvent();
        });
      } else {
        throw new Error(`Invalid layer type ${mainType} for layer ${this.get('layerModel.name')}`);
      }
    }
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
    Destroys leaflet layer related to layer type.

    @method _destroyLayer
    @private
  */
  destroyLayer() {
    const leafletMap = this.get('leafletMap');
    if (!isNone(leafletMap)) {
      leafletMap.off('zoomend', this._visibilityOfLayerByZoom, this);
    }

    const mainLayer = this.get('mainLayer');
    if (!isNone(mainLayer)) {
      mainLayer.willDestroyElement();
      mainLayer.get('innerLayers').forEach((layer) => {
        layer.willDestroyElement();
      });
    }

    this.set('mainLayer', null);
    this.set('layerVisibility', null);
  },

  /**
    Deinitializes DOM-related component's properties.
  */
  willDestroyElement() {
    this._destroyLayer();
    this._super(...arguments);
  },

  /**
    Checks zoom and sets layer visibility.

    @method _checkAndSetVisibility
    @param {Object} layer
    @returns {Boolean}
    @private
  */
  _checkAndSetVisibility(layer) {
    const layerVisibility = this.get('layerVisibility');
    const visibility = this.get('visibility');
    if (visibility && checkMapZoom(layer._leafletObject)) {
      if (isNone(layerVisibility) || layerVisibility.layerId !== layer.layerId) {
        if (!isNone(layerVisibility)) {
          layerVisibility.set('visibility', false);
        }

        this.set('layerVisibility', layer);
        layer.set('visibility', true);
        this._setLayerZIndex(layer._leafletObject);
      }

      return true;
    }

    return false;
  },

  /**
    Sets leaflet layer's visibility.

    @method _setLayerVisibility
    @private
  */
  _setLayerVisibility() {
    const layerVisibility = this.get('layerVisibility');
    if (this.get('visibility')) {
      this._visibilityOfLayerByZoom();
    } else if (!isNone(layerVisibility)) {
      layerVisibility.set('visibility', false);
      this.set('layerVisibility', null);
    }
  },

  /**
    Sets leaflet layer's visibility.

    @method _visibilityOfLayerByZoom
    @private
  */
  _visibilityOfLayerByZoom() {
    const mainLayer = this.get('mainLayer');
    if (isNone(mainLayer) || isNone(mainLayer._leafletObject)) {
      return;
    }

    if (!this._checkAndSetVisibility(mainLayer)) {
      mainLayer.get('innerLayers').forEach((layer) => {
        if (this._checkAndSetVisibility(layer)) {
          // do something
        }
      });
    }
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
  identify() {
    const mainLayer = this.get('mainLayer');
    if (!isNone(mainLayer)) {
      return mainLayer.identify(...arguments);
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
  search() {
    const mainLayer = this.get('mainLayer');
    if (!isNone(mainLayer)) {
      return mainLayer.search(...arguments);
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
  query() {
    const mainLayer = this.get('mainLayer');
    if (!isNone(mainLayer)) {
      return mainLayer.query(...arguments);
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
  getNearObject() {
    const mainLayer = this.get('mainLayer');
    if (!isNone(mainLayer)) {
      return mainLayer.getNearObject(...arguments);
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

      const promises = A();
      promises.push(mainLayer._leafletObject.baseShowAllLayerObjects());
      mainLayer.get('innerLayers').forEach((layer) => {
        promises.push(layer._leafletObject.showAllLayerObjects());
      });

      allSettled(promises).then((result) => {
        const rejected = result.filter((item) => item.state === 'rejected').length > 0;

        if (rejected) {
          reject(new Error(`Failed to showAllLayerObjects for '${this.get('layerModel.name')}`));
        }

        resolve(result[0].value);
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
    mainLayer.get('innerLayers').forEach((layer) => {
      layer._leafletObject.hideAllLayerObjects();
    });
  },
});
