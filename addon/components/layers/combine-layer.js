/**
  @module ember-flexberry-gis
*/
import Ember from 'ember';
import BaseLayer from '../base-layer';
import { checkMapZoom } from '../../utils/check-zoom';

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

    @method createLayer
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createLayer() {
    let settings = this.get('layerModel.settingsAsObject');
    if (!Ember.isNone(settings)) {
      let mainType = Ember.get(settings, 'type');

      let layerProperties = {
        leafletMap: this.get('leafletMap'),
        leafletContainer: this.get('leafletContainer'),
        layerModel: this.get('layerModel'),
        index: this.get('index'),
        visibility: false,
        dynamicProperties: settings
      };

      // Set creating component's owner to avoid possible lookup exceptions.
      let owner = Ember.getOwner(this);
      let ownerKey = null;
      Ember.A(Object.keys(this) || []).forEach((key) => {
        if (this[key] === owner) {
          ownerKey = key;
          return false;
        }
      });
      if (!Ember.isBlank(ownerKey)) {
        layerProperties[ownerKey] = owner;
      }

      //let layerComponent = Ember.getOwner(this).factoryFor(`component:layers/${mainType}-layer`);
      //layerComponent.setProperties(layerProperties);
      //let mainLayer = Ember.getOwner(this).fa(`component:layers/${mainType}-layer`).createLayer.apply(this, arguments);
      let mainLayer = Ember.getOwner(this).factoryFor(`component:layers/${mainType}-layer`).create(layerProperties);
      mainLayer.layerId = Ember.guidFor(mainLayer);
      this.set('mainLayer', mainLayer);


      /*this.getLeafletObject().then(() => {
        this.get('_leafletLayerPromise').then((leafletLayer) => {
          if (!Ember.isNone(leafletLayer)) {
            this._visibilityOfLayerByZoom();
          }
        });
      });*/

      return mainLayer;
    }

    return null;
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    let settings = this.get('layerModel.settingsAsObject');
    if (!Ember.isNone(settings)) {
      let innerLayers = Ember.A();
      let innerLayersSettings = Ember.get(settings, 'innerLayers');
      for (let type in innerLayersSettings) {
        let innerLayerProperties = {
          leafletMap: this.get('leafletMap'),
          leafletContainer: this.get('leafletContainer'),
          layerModel: this.get('layerModel'),
          index: this.get('index'),
          visibility: false,
          dynamicProperties: innerLayersSettings[type]
        };

        // Set creating component's owner to avoid possible lookup exceptions.
        let owner = Ember.getOwner(this);
        let ownerKey = null;
        Ember.A(Object.keys(this) || []).forEach((key) => {
          if (this[key] === owner) {
            ownerKey = key;
            return false;
          }
        });
        if (!Ember.isBlank(ownerKey)) {
          innerLayerProperties[ownerKey] = owner;
        }

        let layer = Ember.getOwner(this).factoryFor(`component:layers/${type}-layer`).create(innerLayerProperties);
        layer.layerId = Ember.guidFor(layer);
        innerLayers.addObject(layer);
      }

      this.set('innerLayers', innerLayers);
      let mainLayer = this.get('mainLayer');
      Ember.set(mainLayer, 'innerLayers', innerLayers);
      /*this.get('_leafletLayerPromise').then(() => {
        if (!Ember.isNone(this.get('layerModel._leafletObject'))) {
          this._visibilityOfLayerByZoom();
        }
      });*/
    }
  },

  /**
    Initializes DOM-related component's properties.
  */
  didInsertElement() {
    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletMap)) {
      leafletMap.on('zoomend', this._visibilityOfLayerByZoom, this);
    }

    this.get('_leafletLayerPromise').then((leafletLayer) => {
      this._visibilityOfLayerByZoom();
    });

    this._super(...arguments);
  },

  /**
    Deinitializes DOM-related component's properties.
  */
  willDestroyElement() {
    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletMap)) {
      leafletMap.off('zoomend', this._visibilityOfLayerByZoom, this);
    }

    this._super(...arguments);
  },

  /**
    Check zoom and set layerVisibility.

    @method _checkAndSetVisibility
    @param {Object} layer
    @returns {Boolean}
    @private
  */
  _checkAndSetVisibility(layer) {
    let layerVisibility = this.get('layerVisibility');
    if (checkMapZoom(layer)) {
      if (Ember.isNone(layerVisibility) || layerVisibility._leaflet_id !== layer._leaflet_id) {
        this._removeLayerFromLeafletContainer();
        this.set('layerVisibility', layer);
        this._addLayerToLeafletContainer();
        this._setLayerZIndex(layer);
      }

      return true;
    }

    return false;
  },

  /**
    Sets leaflet layer's visibility.

    @method _visibilityOfLayerByZoom
    @private
  */
  _visibilityOfLayerByZoom() {
    let leafletObject = this.get('layerModel._leafletObject');
    if (Ember.isNone(leafletObject)) {
      return;
    }

    if (!this._checkAndSetVisibility(leafletObject)) {
      this.get('innerLayers').forEach((layer) => {
        if (this._checkAndSetVisibility(layer._leafletObject)) {
          return;
        }
      });
    }
  },

  /**
    Adds layer to it's leaflet container.

    @method _addLayerToLeafletContainer
    @private
  */
  _addLayerToLeafletContainer() {
    let leafletContainer = this.get('leafletContainer');
    let leafletLayer = this.get('layerModel._leafletObject');
    let layerVisibility = this.get('layerVisibility');
    if (Ember.isNone(leafletContainer) || Ember.isNone(leafletLayer) || Ember.isNone(layerVisibility) || leafletContainer.hasLayer(layerVisibility)) {
      return;
    }

    let thisPane = this.get('_pane');
    if (thisPane) {
      let leafletMap = this.get('leafletMap');
      if (thisPane && !Ember.isNone(leafletMap)) {
        let pane = leafletMap.getPane(thisPane);
        if (!pane || Ember.isNone(pane)) {
          this._createPane(thisPane);
          this._setLayerZIndex();
        }
      }
    }

    leafletContainer.addLayer(layerVisibility);
    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletMap) && layerVisibility.options.continueLoading) {
      let e = {
        layers: [this.get('layerModel')],
        results: Ember.A()
      };

      leafletMap.fire('flexberry-map:moveend', e);
    }
  },

  /**
    Removes layer from it's leaflet container.

    @method _removeLayerFromLeafletContainer
    @private
  */
  _removeLayerFromLeafletContainer() {
    let leafletContainer = this.get('leafletContainer');
    let leafletLayer = this.get('layerModel._leafletObject');
    let layerVisibility = this.get('layerVisibility');
    if (Ember.isNone(leafletContainer) || Ember.isNone(leafletLayer) || Ember.isNone(layerVisibility) || !leafletContainer.hasLayer(layerVisibility)) {
      return;
    }

    leafletContainer.removeLayer(layerVisibility);
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
    let mainLayer = this.get('mainLayer');
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
    let mainLayer = this.get('mainLayer');
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
    let mainLayer = this.get('mainLayer');
    if (!Ember.isNone(mainLayer)) {
      return mainLayer.query.apply(mainLayer, arguments);
    }
  }
});
