/**
  @module ember-flexberry-gis
*/
import Ember from 'ember';
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

  historyModeEnabledObserver: Ember.observer('layerModel.historyModeEnabled', function () {
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
    return new Ember.RSVP.Promise((resolve, reject) => {
      this.createAllLayer();
      let promises = Ember.A();
      promises.push(this.get('mainLayer._leafletLayerPromise'));
      promises.push(this.get('mainLayer.historyLayer').get('_leafletLayerPromise'));

      Ember.RSVP.allSettled(promises).then((layers) => {
        const rejected = layers.filter((item) => { return item.state === 'rejected'; }).length > 0;

        if (rejected) {
          reject(`Failed to create leaflet layer for '${this.get('layerModel.name')}`);
        }

        let layer = layers[0].value;
        Ember.set(this.get('layerModel'), '_attributesOptions', this._getAttributesOptions.bind(this));
        Ember.set(layer, 'mainLayer', this.get('mainLayer'));
        Ember.set(layer, 'baseShowAllLayerObjects', layer.showAllLayerObjects);
        layer.showAllLayerObjects = this.get('showAllLayerObjects').bind(this);
        Ember.set(layer, 'baseHideAllLayerObjects', layer.hideAllLayerObjects);
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
    let settings = this.get('layerModel.settingsAsObject');
    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(settings) && !Ember.isNone(leafletMap)) {
      let mainType = Ember.get(settings, 'type');

      let layerProperties = {
        leafletMap: leafletMap,
        leafletContainer: this.get('leafletContainer'),
        layerModel: this.get('layerModel'),
        index: this.get('index'),
        visibility: false,
        dynamicProperties: settings
      };

      // Set creating component's owner to avoid possible lookup exceptions.
      this.setOwner(layerProperties);

      let mainLayer = Ember.getOwner(this).factoryFor(`component:layers/${mainType}-layer`).create(layerProperties);
      if (!Ember.isNone(mainLayer)) {
        mainLayer.layerId = Ember.guidFor(mainLayer);
        this.set('mainLayer', mainLayer);

        let historyLayersSettings = Ember.get(settings, 'historyLayer');
        Ember.A(Object.keys(settings) || []).forEach((key) => {
          if (!historyLayersSettings.hasOwnProperty(key)) {
            Ember.set(historyLayersSettings, key, settings[key]);
          }
        });

        let historyLayerProperties = {
          leafletMap: leafletMap,
          leafletContainer: this.get('leafletContainer'),
          layerModel: this.get('layerModel'),
          index: this.get('index'),
          visibility: false,
          dynamicProperties: historyLayersSettings
        };

        this.setOwner(historyLayerProperties);

        let type = historyLayersSettings.type;
        let historyLayer = Ember.getOwner(this).factoryFor(`component:layers/${type}-layer`).create(historyLayerProperties);
        if (!Ember.isNone(historyLayer)) {
          historyLayer.layerId = Ember.guidFor(historyLayer);
        } else {
          throw (`Invalid layer type ${type} for layer ${this.get('layerModel.name')}`);
        }

        this.set('historyLayer', historyLayer);
        Ember.set(mainLayer, 'historyLayer', historyLayer);

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
    if (!e) {
      return;
    }

    let id = Ember.get(e.layerModel, 'layerModel.id');
    if (this.get('layerModel.id') === id) {
      let historyLayer = this.get('historyLayer');
      if (!Ember.isNone(historyLayer)) {
        historyLayer.reload();
      }
    }
  },

  destroyLayer() {
    let mainLayer = this.get('mainLayer');
    if (!Ember.isNone(mainLayer)) {
      mainLayer.willDestroyElement();
    }

    let historyLayer = this.get('historyLayer');
    if (!Ember.isNone(historyLayer)) {
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
  _settingsDidChange: Ember.observer('layerModel.settingsAsObject', function () {
    Ember.run.once(this, '_resetLayer');
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
      let historyModeEnabled = this.get('historyModeEnabled');
      this.get('historyLayer').set('visibility', historyModeEnabled);
      this.get('mainLayer').set('visibility', !historyModeEnabled);
    } else {
      this.get('mainLayer').set('visibility', false);
      this.get('historyLayer').set('visibility', false);
    }
  },

  _setLayerOpacity() {
    let opacity = this.get('opacity');
    this.get('historyLayer').set('opacity', opacity);
    this.get('mainLayer').set('opacity', opacity);
  },

  /**
    Returns promise with the layer properties object.

    @method _getAttributesOptions
    @private
  */
  _getAttributesOptions(source) {
    return this.get('mainLayer')._getAttributesOptions(source);
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
    let historyModeEnabled = this.get('historyModeEnabled');
    let mainLayer = historyModeEnabled ? this.get('historyLayer') : this.get('mainLayer');
    if (!Ember.isNone(mainLayer)) {
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
    let historyModeEnabled = this.get('historyModeEnabled');
    let mainLayer = historyModeEnabled ? this.get('historyLayer') : this.get('mainLayer');
    if (!Ember.isNone(mainLayer)) {
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
    let historyModeEnabled = this.get('historyModeEnabled');
    let mainLayer = historyModeEnabled ? this.get('historyLayer') : this.get('mainLayer');
    if (!Ember.isNone(mainLayer)) {
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
    let historyModeEnabled = this.get('historyModeEnabled');
    let mainLayer = historyModeEnabled ? this.get('historyLayer') : this.get('mainLayer');
    if (!Ember.isNone(mainLayer)) {
      return mainLayer.getNearObject.apply(mainLayer, arguments);
    }
  },

  /**
    Show all layer objects.
    @method showAllLayerObjects
    @return {Promise}
  */
  showAllLayerObjects() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let mainLayer = this.get('mainLayer');
      if (Ember.isNone(mainLayer) || Ember.isNone(mainLayer._leafletObject)) {
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
    let mainLayer = this.get('mainLayer');
    if (Ember.isNone(mainLayer) || Ember.isNone(mainLayer._leafletObject)) {
      return;
    }

    mainLayer._leafletObject.baseHideAllLayerObjects();
  }
});
