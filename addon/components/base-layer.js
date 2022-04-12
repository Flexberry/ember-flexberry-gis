/**
  @module ember-flexberry-gis
*/

import { debounce } from '@ember/runloop';

import { A, isArray } from '@ember/array';

import { getOwner } from '@ember/application';
import { hash, Promise, resolve } from 'rsvp';
import {
  computed, set, observer, get
} from '@ember/object';
import { isNone, isPresent, typeOf, isBlank } from '@ember/utils';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { assert } from '@ember/debug';

import Ember from 'ember';
import DynamicPropertiesMixin from 'ember-flexberry-gis/mixins/dynamic-properties';
import DynamicActionsMixin from 'ember-flexberry/mixins/dynamic-actions';
import LeafletOptionsMixin from 'ember-flexberry-gis/mixins/leaflet-options';
import { checkMapZoomLayer } from '../utils/check-zoom';

/**
  BaseLayer component for other flexberry-gis layers.

  @class BaseLayerComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses DynamicPropertiesMixin
  @uses LeafletOptionsMixin
 */
export default Component.extend(
  DynamicPropertiesMixin,
  DynamicActionsMixin,
  LeafletOptionsMixin, {
    /**
      Leaflet layer object init by settings from model.

      @property _leafletObject
      @type <a href="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>
      @default null
      @private
    */
    _leafletObject: null,

    /**
      Promise returning Leaflet layer.

      @property leafletLayerPromise
      @type <a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
      @default null
      @private
    */
    _leafletLayerPromise: null,

    /**
      Reference to 'layers-styles-renderer' servie.

      @property _layersStylesRenderer
      @type LayersStylesRendererService
      @private
    */
    _layersStylesRenderer: service('layers-styles-renderer'),

    /**
      Service for managing map API.

      @property mapApi
      @type MapApiService
    */
    mapApi: service(),

    /**
      Overload wrapper tag name for disabling wrapper.
    */
    tagName: '',

    archTime: null,
    hasTime: null,

    timeObserverDelay: 1500,

    timeObserver: observer('layerModel.archTime', function () {
      // Из комбинированого исторического слоя это изменение пробросится и для основного тоже. Проконтролируем
      if (this.get('hasTime') && this.reload && typeof (this.reload) === 'function') {
        debounce(this, this.reload, this.get('timeObserverDelay'));
      }
    }),

    customFilter: computed('layerModel.archTime', function () {
      if (this.get('hasTime')) {
        let time = this.get('layerModel.archTime');
        let formattedTime;
        if (isBlank(time) || time === 'present' || isNone(time)) {
          formattedTime = moment().toISOString();
        } else {
          formattedTime = moment(time).toISOString();
        }

        return new L.Filter.And(
          new L.Filter.LEQ('archivestart', formattedTime),
          new L.Filter.GEQ('archiveend', formattedTime));
      }
    }),

    addCustomFilter(filter) {
      let customFilter = this.get('customFilter');

      if (!isNone(customFilter) && !isNone(filter)) {
        return new L.Filter.And(filter, customFilter);
      }

      return customFilter || filter;
    },

    setOwner(properties) {
      let owner = getOwner(this);
      let ownerKey = null;
      A(Object.keys(this) || []).forEach((key) => {
        if (this[key] === owner) {
          ownerKey = key;
          return false;
        }
      });

      if (!isBlank(ownerKey)) {
        properties[ownerKey] = owner;
      }
    },

    /**
      Array containing component's properties which are also leaflet layer options (see leaflet-options mixin).

      @property leafletOptions
      @type String[]
    */
    leafletOptions: null,

    /**
      Array containing component's properties which are also leaflet layer options callbacks (see leaflet-options mixin).

      @property leafletOptionsCallbacks
      @type Stirng[]
    */
    leafletOptionsCallbacks: null,

    /**
      Hash containing default implementations for leaflet layer options callbacks (see leaflet-options mixin).

      @property defaultLeafletOptionsCallbacks
      @type Object
    */
    defaultLeafletOptionsCallbacks: {
      coordsToLatLng(coords) {
        const crs = this.get('crs');
        const point = new L.Point(coords[0], coords[1]);
        const latlng = crs.projection.unproject(point);
        if (!isNone(coords[2])) {
          latlng.alt = coords[2];
        }

        return latlng;
      },
    },

    /**
      Leaflet map.

      @property leafletMap
      @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
      @default null
    */
    leafletMap: null,

    /**
      Leaflet container for layers.

      @property leafletContainer
      @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>|<a href="http://leafletjs.com/reference-1.0.0.html#layergroup">L.LayerGroup</a>
      @default null
    */
    leafletContainer: null,

    /**
      Layer metadata.

      @property layerModel
      @type Object
      @default null
    */
    layerModel: null,

    /**
      This layer index, used for layer ordering in Map.

      @property index
      @type Number
      @default null
    */
    index: null,

    /**
      Flag, indicates visible or not current layer on map.

      @property visibility
      @type Boolean
      @default null
    */
    visibility: null,

    /**
      This layer opacity.

      @property opacity
      @type Number
      @default null
    */
    opacity: null,

    /**
      Hash containing layer's style settings.

      @property styleSettings
      @type Object
      @default null
    */
    styleSettings: null,

    /**
      Layer's coordinate reference system (CRS).

      @property crs
      @type <a href="http://leafletjs.com/reference-1.0.0.html#crs">L.CRS</a>
      @readOnly
    */
    crs: computed('layerModel.crs', 'leafletMap.options.crs', function () {
      let crs = this.get('layerModel.crs');
      if (isNone(crs)) {
        crs = this.get('leafletMap.options.crs');
      }

      return crs;
    }),

    /**
      @property _pane
      @type String
      @readOnly
    */
    _pane: null,

    /**
      This layer bounding box.

      @property bounds
      @type <a href="http://leafletjs.com/reference-1.1.0.html#latlngbounds">L.LatLngBounds</a>
      @readonly
    */
    bounds: null,

    /**
      Promise storage property.

      @property promiseLoad
      @type Object promise
    */
    promiseLoad: null,

    /**
      Creates map pane
      @method _createPane
      @private
    */
    _createPane(name) {
      const leafletMap = this.get('leafletMap');
      const pane = leafletMap.createPane(name);
      const layer = this;

      L.DomEvent.on(pane, 'click', function (e) {
        if (e._stopped) { return; }

        let { target, } = e;

        // Проблема с пробрасыванием кликов была только из-за введения разных canvas. Если клик попал на другой элемент, то работает стандартная логика
        if (target.tagName.toLowerCase() !== 'canvas') {
          return;
        }

        const l = layer;
        if (l.leafletMap.hasLayer(l._leafletObject) && checkMapZoomLayer(l)) {
          const point = l.leafletMap.mouseEventToLayerPoint(e);

          let intersect = false;
          if (l._leafletObject && typeof (l._leafletObject.eachLayer) === 'function') {
            l._leafletObject.eachLayer(function (layer) {
              if (typeof (layer._containsPoint) === 'function') {
                intersect = intersect || layer._containsPoint(point);
              }
            });
          }

          if (intersect) { return; }
        }

        const ev = new MouseEvent(e.type, e);
        const removed = { node: target, pointerEvents: target.style.pointerEvents, };
        target.style.pointerEvents = 'none';
        target = document.elementFromPoint(e.clientX, e.clientY);

        if (target && target !== pane && target.parentElement && target.parentElement.classList.value.indexOf('leaflet-vectorLayer') !== -1) {
          const stopped = !target.dispatchEvent(ev);
          if (stopped || ev._stopped) {
            L.DomEvent.stop(e);
          }
        }

        removed.node.style.pointerEvents = removed.pointerEvents;
      });
    },

    /**
      Set features callback

      @method _setFeaturesProcessCallback
      @private
    */
    _setFeaturesProcessCallback() {
    },

    /**
      Creates leaflet layer related to layer type.

      @method _createLayer
      @private
    */
    _createLayer() {
      // Call to 'createLayer' could potentially return a promise,
      // wraping this call into Ember.RSVP.hash helps us to handle straight/promise results universally.
      this.set('_leafletLayerPromise', hash({
        leafletLayer: this.createLayer(),
      }).then(({
        leafletLayer,
      }) => {
        set(leafletLayer, 'leafletMap', this.get('leafletMap'));
        this.set('_leafletObject', leafletLayer);

        if (isPresent(this.get('layerModel'))) {
          set(this.get('layerModel'), '_leafletObject', leafletLayer);

          if (isNone(this.get('layerModel.leafletObjectGetter'))) {
            set(this.get('layerModel'), 'leafletObjectGetter', this.getLeafletObject.bind(this));
          }

          // Save the reference to the instance method for getting attributes options.
          if (isNone(this.get('layerModel._attributesOptions'))) {
            set(this.get('layerModel'), '_attributesOptions', this._getAttributesOptions.bind(this));
          }
        }

        this.sendDynamicAction('layerInit', { leafletObject: leafletLayer, layerModel: this.get('layerModel'), });

        const layerInitCallback = this.get('mapApi').getFromApi('layerInitCallback');
        if (typeof layerInitCallback === 'function') {
          layerInitCallback(this);
        }

        return leafletLayer;
      }).catch((errorMessage) => {
        Ember.Logger.error(`Failed to create leaflet layer for '${this.get('layerModel.name')}': ${errorMessage}`);
      }));
    },

    _setFilter: observer('layerModel.filter', function () {
      let filter = this.get('layerModel.filter');
      if (typeof filter === 'string') {
        try {
          const layerLinks = this.get('layerModel.layerLink');
          const layerModel = this.get('layerModel');

          // this.get('type') to get type for layers in combine-layer
          const type = !isNone(this.get('type')) ? this.get('type') : layerModel.get('type');
          filter = getOwner(this).lookup(`layer:${type}`).parseFilter(filter, (this.get('geometryField') || 'geometry'), null, layerLinks);
        } catch (ex) {
          console.error(ex);
          return;
        }
      }

      // Observer will work via mixin/leaflet-options. Option 'filter' need be in leafletOptions components/layers/..
      this.set('filter', filter);
    }),

    /**
      Destroys leaflet layer related to layer type.

      @method _destroyLayer
      @private
    */
    _destroyLayer() {
      this.sendAction('layerDestroy', { leafletObject: this.get('_leafletObject'), layerModel: this.get('layerModel'), });

      // Execute specific destroy logic related to layer's type.
      this.destroyLayer();

      // Now execute base destroy logic.
      this._removeLayerFromLeafletContainer();

      if (this.get('labelSettings.signMapObjects') && !Ember.isNone(this.get('_labelsLayer'))) {
        this.set('_labelsLayer', null);
      }

      this.set('_leafletObject', null);
      this.set('_leafletLayerPromise', null);
      if (isPresent(this.get('layerModel'))) {
        set(this.get('layerModel'), '_leafletObject', null);
        set(this.get('layerModel'), '_attributesOptions', null);
      }
    },

    /**
      Returns promise with the layer properties object.

      @method _getAttributesOptions
      @private
    */
    _getAttributesOptions() {
      return new Promise((resolve, reject) => {
        resolve({
          object: this.get('_leafletObject'),
          settings: {
            readonly: true,
            localizedProperties: this.get('displaySettings.featuresPropertiesSettings.localizedProperties'),
            excludedProperties: this.get('displaySettings.featuresPropertiesSettings.excludedProperties'),
          },
        });
      });
    },

    /**
      Resets leaflet layer related to layer type.

      @method _resetLayer
      @private
    */
    _resetLayer() {
      // Destroy previously created leaflet layer (created with old settings).
      this._destroyLayer();

      // Create new leaflet layer (with new settings).
      this._createLayer();

      // Wait for the layer creation to be finished and set it's state related to new settings.
      this.get('_leafletLayerPromise').then(() => {
        this._setLayerState();
        this._setLayerZIndex();
      });
    },

    /**
      Sets leaflet layer's state related to actual settings.

      @method _setLayerState
      @private
    */
    _setLayerState() {
      this._setLayerVisibility();
      this._setLayerStyle();
      this._setLayerOpacity();
      this._setLayerZIndex();
    },

    /**
      Sets leaflet layer's zindex.

      @method _setLayerZIndex
      @private
    */
    _setLayerZIndex(leafletLayer) {
      if (!leafletLayer) {
        leafletLayer = this.get('_leafletObject');
      }

      if (isNone(leafletLayer)) {
        return;
      }

      const setZIndexFunc = get(leafletLayer, 'setZIndex');
      if (typeOf(setZIndexFunc) !== 'function') {
        return;
      }

      const index = this.get('index');
      leafletLayer.setZIndex(index);
    },

    /**
      Sets leaflet layer's visibility.

      @method _setLayerVisibility
      @private
    */
    _setLayerVisibility() {
      if (this.get('visibility')) {
        this._addLayerToLeafletContainer();
      } else {
        this._removeLayerFromLeafletContainer();
      }
    },

    /**
      Sets leaflet layer's visibility.

      @method _setLayerOpacity
      @private
    */
    _setLayerOpacity() {
      const leafletLayer = this.get('_leafletObject');
      if (isNone(leafletLayer) || typeOf(leafletLayer.setOpacity) !== 'function') {
        return;
      }

      leafletLayer.setOpacity(this.get('opacity'));
    },

    /**
      Sets leaflet layer's style.

      @method _setLayerStyle
      @private
    */
    _setLayerStyle() {
      const leafletLayer = this.get('_leafletObject');

      if (isNone(leafletLayer)) {
        return;
      }

      const styleSettings = this.get('styleSettings');
      if (isNone(styleSettings)) {
        return;
      }

      const layersStylesRenderer = this.get('_layersStylesRenderer');
      layersStylesRenderer.renderOnLeafletLayer({ leafletLayer, styleSettings, });
    },

    /**
      Adds layer to it's leaflet container.

      @method _addLayerToLeafletContainer
      @private
    */
    _addLayerToLeafletContainer() {
      const leafletContainer = this.get('leafletContainer');
      const leafletLayer = this.get('_leafletObject');

      if (isNone(leafletContainer) || isNone(leafletLayer) || leafletContainer.hasLayer(leafletLayer)) {
        return;
      }

      const thisPane = this.get('_pane');
      if (thisPane) {
        const leafletMap = this.get('leafletMap');
        if (thisPane && !isNone(leafletMap)) {
          const pane = leafletMap.getPane(thisPane);
          if (!pane || isNone(pane)) {
            this._createPane(thisPane);
            this._setLayerZIndex();
          }
        }
      }

      leafletContainer.addLayer(leafletLayer);
      const leafletMap = this.get('leafletMap');
      if (!isNone(leafletMap) && leafletLayer.options.continueLoading) {
        const e = {
          layers: [this.get('layerModel')],
          results: A(),
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
      const leafletContainer = this.get('leafletContainer');
      const leafletLayer = this.get('_leafletObject');

      if (isNone(leafletContainer) || isNone(leafletLayer) || !leafletContainer.hasLayer(leafletLayer)) {
        return;
      }

      leafletContainer.removeLayer(leafletLayer);

      if (this.get('labelSettings.signMapObjects') && !Ember.isNone(this.get('_labelsLayer')) && leafletContainer.hasLayer(this.get('_labelsLayer'))) {
        leafletContainer.removeLayer(this.get('_labelsLayer'));
      }
    },

    /**
      Observes and handles changes in JSON-string with layer settings.
      Performs layer's recreation with new settings.

      @method visibilityDidChange
      @private
    */
    _indexDidChange: observer('index', function () {
      this._setLayerZIndex();
    }),

    /**
      Observes and handles changes in {{#crossLink "BaseLayerComponent/visibility:property"}}'visibility' property{{/crossLink}}.
      Switches layer's visibility.

      @method visibilityDidChange
      @private
    */
    _visibilityDidChange: observer('visibility', function () {
      this._setLayerVisibility();
    }),

    /**
      Observes and handles changes in {{#crossLink "BaseLayerComponent/opacity:property"}}'opacity' property{{/crossLink}}.
      Changes layer's opacity.

      @method _opacityDidChange
      @private
    */
    _opacityDidChange: observer('opacity', function () {
      this._setLayerOpacity();
    }),

    /**
      Observes and handles changes in {{#crossLink "BaseLayerComponent/styleSettings:property"}}'styleSettings' property{{/crossLink}}.
      Changes layer's style settings.

      @method _styleSettingsDidChange
      @private
    */
    _styleSettingsDidChange: observer('styleSettings', function () {
      this._setLayerStyle();

      // When we set new style it can change layer's opacity to style's default value,
      // so we must restore opacity to user defined value.
      this._setLayerOpacity();
    }),

    /**
      Handles 'flexberry-map:identify' event of leaflet map.

      @method _identify
      @param {Object} e Event object.
      @param {<a href="http://leafletjs.com/reference-1.0.0.html#rectangle">L.Rectangle</a>} e.boundingBox Leaflet layer
      representing bounding box within which layer's objects must be identified.
      @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the bounding box.
      @param {Object[]} layers Objects describing those layers which must be identified.
      @param {Object[]} results Objects describing identification results.
      Every result-object has the following structure: { layer: ..., features: [...] },
      where 'layer' is metadata of layer related to identification result, features is array
      containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
      or a promise returning such array.
      @private
    */
    _identify(e) {
      const shouldIdentify = A(e.layers || []).includes(this.get('layerModel'));
      if (!shouldIdentify) {
        return;
      }

      // Call public identify method, if layer should be identified.
      e.results.push({
        layerModel: this.get('layerModel'),
        features: this.identify(e),
      });
    },

    /**
      Handles 'flexberry-map:getNearObject' event of leaflet map.

      @method _getNearObject
      @param {Object} e Event object.
      @param {<a href="http://leafletjs.com/reference-1.0.0.html#rectangle">L.Rectangle</a>} e.boundingBox Leaflet layer
      representing bounding box within which layer's objects must be identified.
      @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the bounding box.
      @param {Object[]} layers Objects describing those layers which must be identified.
      @param {Object[]} results Objects describing identification results.
      Every result-object has the following structure: { layer: ..., features: [...] },
      where 'layer' is metadata of layer related to identification result, features is array
      containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
      or a promise returning such array.
      @private
    */
    _getNearObject(e) {
      const layerModel = this.get('layerModel');
      const isVectorLayer = getOwner(this).lookup(`layer:${layerModel.get('type')}`).isVectorType(layerModel);
      const shouldGetNearObject = A(e.layers || []).includes(layerModel) && isVectorLayer;
      if (!shouldGetNearObject) {
        return;
      }

      // Call public getNearObject method, if layer should be getNearObject.
      e.results.push({
        layerModel,
        features: this.getNearObject(e),
      });
    },

    /**
      Handles 'flexberry-map:search' event of leaflet map.

      @method search
      @param {Object} e Event object.
      @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the search area.
      @param {Object[]} layerModel Object describing layer that must be searched.
      @param {Object} searchOptions Search options related to layer type.
      @param {Object} results Hash containing search results.
      @param {Object[]} results.features Array containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
      or a promise returning such array.
    */
    _search(e) {
      const shouldSearch = typeof (e.filter) === 'function' && e.filter(this.get('layerModel'));
      if (!shouldSearch) {
        return;
      }

      // Call public search method, if layer should be searched.
      e.results.push({
        layerModel: this.get('layerModel'),
        features: this.search(e),
      });
    },

    /**
      Handles 'flexberry-map:query' event of leaflet map.

      @method query
      @param {Object} e Event object.
      @param {Object} queryFilter Object with query filter parameters
      @param {Object} mapObjectSetting Object describing current query setting
      @param {Object[]} results Objects describing query results.
      Every result-object has the following structure: { layer: ..., features: [...] },
      where 'layer' is metadata of layer related to query result, features is array
      containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
      or a promise returning such array.
    */
    _query(e) {
      // Filter current layer links by setting.
      const layerLinks = this.get('layerModel.layerLink')
        .filter((link) => link.get('mapObjectSetting.id') === e.mapObjectSetting);

      if (!isArray(layerLinks) || layerLinks.length === 0) {
        return;
      }

      // Call public query method, if layer has links.
      e.results.push({
        layerModel: this.get('layerModel'),
        features: this.query(layerLinks, e),
      });
    },

    /**
      Returns leaflet layer's bounding box.

      @method _getBoundingBox
      @private
      @return <a href="http://leafletjs.com/reference-1.1.0.html#latlngbounds">L.LatLngBounds</a>
    */
    _getBoundingBox() {
      assert('BaseLayer\'s \'_getBoundingBox\' should be overridden.');
    },

    /**
      Handles 'flexberry-map:createObject' event of leaflet map.

      @method createObject
      @param {Object} e Event object.
      @param {Object} queryFilter Object with query filter parameters
      @param {Object} mapObjectSetting Object describing current query setting
      @param {Object} results Hash containing createObject results.
    */
    _createObject(e) {
      const layerLinks = this.get('layerModel.layerLink')
        .filter((link) => link.get('mapObjectSetting.id').toLowerCase() === e.mapObjectSetting.toLowerCase());

      if (!isArray(layerLinks) || layerLinks.length === 0) {
        return;
      }

      layerLinks.forEach((link) => {
        e.results.push({
          layerModel: this.get('layerModel'),
          linkParameters: link.get('parameters'),
          queryFilter: e.queryFilter,
        });
      });
    },

    /**
      Handles 'flexberry-map:cancelEdit' event of leaflet map.

      @method _cancelEdit
      @param {Object} e Event object.
    */
    _cancelEdit(e) {
      if (e.layerIds.indexOf(this.get('layerModel.id')) !== -1) {
        e.results.pushObject(this.cancelEdit(e.ids));
      }
    },

    /**
      Handles 'flexberry-map:cancelEdit' event of leaflet map.

      @method cancelEdit
      @return {Ember.RSVP.Promise} Returns promise.
    */
    cancelEdit() {
      return new resolve();
    },

    /**
      Initializes component.
    */
    init() {
      this._super(...arguments);

      // Здесь можно задать layerModel.archTime. Но мы не будем, т.к. пустая дата - это то же самое, что текущая.
      // Если все таки захотят чтобы дата отображалась, то нужно будет делать сервис, который отдаст одинаковую текущую дату все слои

      // Create leaflet layer.
      this._createLayer();
    },

    /**
      Adds a listener function to leafletMap.

      @method onLeafletMapEvent
      @return nothing.
    */
    onLeafletMapEvent() {
    },

    /**
      Initializes DOM-related component's properties.
    */
    didInsertElement() {
      this._super(...arguments);

      // Wait for the layer creation to be finished and set it's state related to actual settings.
      this.get('_leafletLayerPromise').then((leafletLayer) => {
        this._setLayerState();
      });

      const leafletMap = this.get('leafletMap');
      if (!isNone(leafletMap)) {
        // Attach custom event-handler.
        leafletMap.on('flexberry-map:identify', this._identify, this);
        leafletMap.on('flexberry-map:search', this._search, this);
        leafletMap.on('flexberry-map:query', this._query, this);
        leafletMap.on('flexberry-map:createObject', this._createObject, this);
        leafletMap.on('flexberry-map:cancelEdit', this._cancelEdit, this);
        leafletMap.on('flexberry-map:getNearObject', this._getNearObject, this);

        leafletMap.on('flexberry-map:load', (e) => {
          e.results.push(this.get('_leafletLayerPromise'));
        }, this);
      }
    },

    /**
      Deinitializes DOM-related component's properties.
    */
    willDestroyElement() {
      this._super(...arguments);

      const leafletMap = this.get('leafletMap');
      if (!isNone(leafletMap)) {
        // Detach custom event-handler.
        leafletMap.off('flexberry-map:identify', this._identify, this);
        leafletMap.off('flexberry-map:search', this._search, this);
        leafletMap.off('flexberry-map:query', this._query, this);
        leafletMap.off('flexberry-map:createObject', this._createObject, this);
        leafletMap.off('flexberry-map:cancelEdit', this._cancelEdit, this);
        leafletMap.off('flexberry-map:getNearObject', this._getNearObject, this);
      }

      // Destroy leaflet layer.
      this._destroyLayer();
    },

    /**
      Returns leaflet layer.

      @method getLeafletObjectPromise
      @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
      Leaflet layer or promise returning such layer.
    */
    getLeafletObject() {
      return new Promise((resolve, reject) => {
        resolve(this.get('_leafletObject'));
      });
    },

    /**
      Returns leaflet layer.

      @method returnLeafletObject
      @returns leafletObject
    */
    returnLeafletObject() {
      return this.get('_leafletObject');
    },

    /**
      Creates leaflet layer related to layer type.

      @method createLayer
      @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
      Leaflet layer or promise returning such layer.
    */
    createLayer() {
      assert('BaseLayer\'s \'createLayer\' should be overridden.');
    },

    /**
      Destroys leaflet layer related to layer type.

      @method destroyLayer
    */
    destroyLayer() {
    },

    /**
      Identifies layer's objects inside specified bounding box.

      @method identify
      @param {Object} e Event object.
      @param {<a href="http://leafletjs.com/reference-1.0.0.html#rectangle">L.Rectangle</a>} e.boundingBox Leaflet layer
      representing bounding box within which layer's objects must be identified.
      @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the bounding box.
      @param {Object[]} layers Objects describing those layers which must be identified.
      @param {Object[]} results Objects describing identification results.
      Every result-object has the following structure: { layer: ..., features: [...] },
      where 'layer' is metadata of layer related to identification result, features is array
      containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
      or a promise returning such array.
    */
    identify(e) {
      assert('BaseLayer\'s \'identify\' method should be overridden.');
    },

    /**
      Get nearest object.

      @method getNearObject
      @param {Object} e Event object.
      Every result-object has the following structure: { layer: ..., features: [...] },
      where 'layer' is metadata of layer related to getNearObject result, features is array
      containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
      or a promise returning such array.
    */
    getNearObject(e) {
      // BaseLayer's 'getNearObject' method should be overridden.
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
      assert('BaseLayer\'s \'search\' method should be overridden.');
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
      assert('BaseLayer\'s \'query\' method should be overridden.');
    },

    /**
      Returns leaflet layer's bounding box.

      @method getBoundingBox
      @return <a href="http://leafletjs.com/reference-1.1.0.html#latlngbounds">L.LatLngBounds</a>
    */
    getBoundingBox() {
      const layer = this.get('_leafletObject');

      if (isNone(layer)) {
        return new Promise((resolve, reject) => {
          reject(`Leaflet layer for '${this.get('layerModel.name')}' isn't created yet`);
        });
      }

      const bounds = this._getBoundingBox(layer);

      return bounds;
    },

    /**
      Observes and handles changes in layer's properties marked as leaflet options.
      Performs layer's recreation with new options.
      Note: it is overridden method from 'leaflet-options' mixin.

      @method leafletOptionsDidChange
      @param {String[]} changedOptions Array containing names of all changed options.
    */
    leafletOptionsDidChange({
      changedOptions,
    }) {
      const optionsDidntChange = changedOptions.length === 0;
      if (optionsDidntChange) {
        // Prevent unnecessary leaflet layer's recreation.
        return;
      }

      const onlyOpacityDidChange = changedOptions.length === 1 && changedOptions.includes('opacity');
      if (onlyOpacityDidChange) {
        // Prevent unnecessary leaflet layer's recreation.
        return;
      }

      this._resetLayer();
    },

    /**
      Injects (leafelt GeoJSON layers)[http://leafletjs.com/reference-1.0.0.html#geojson] according to current CRS
      into specified (GeoJSON)[http://geojson.org/geojson-spec] feature, features, or featureCollection

      @method injectLeafletLayersIntoGeoJSON
      @param {Object} geojson (GeoJSON)[http://geojson.org/geojson-spec] feature, features, or featureCollection.
      @param {Object} [options] Options of (leafelt GeoJSON layer)[http://leafletjs.com/reference-1.0.0.html#geojson].
      @return (leafelt GeoJSON layer)[http://leafletjs.com/reference-1.0.0.html#geojson].
    */
    injectLeafletLayersIntoGeoJSON(geojson, options) {
      geojson = geojson || {};
      options = options || {};

      let featureCollection = {
        type: 'FeatureCollection',
        features: [],
      };

      if (isArray(geojson)) {
        set(featureCollection, 'features', geojson);
      } else if (get(geojson, 'type') === 'Feature') {
        set(featureCollection, 'features', [geojson]);
      } else if (get(geojson, 'type') === 'FeatureCollection') {
        featureCollection = geojson;
      }

      const features = A(get(featureCollection, 'features') || []);
      if (get(features, 'length') === 0) {
        return null;
      }

      const crs = this.get('crs');
      set(options, 'coordsToLatLng', function (coords) {
        const point = new L.Point(coords[0], coords[1]);
        const latlng = crs.projection.unproject(point);
        if (!isNone(coords[2])) {
          latlng.alt = coords[2];
        }

        return latlng;
      });

      // Define callback method on each feature.
      const originalOnEachFeature = get(options, 'onEachFeature');
      set(options, 'onEachFeature', function (feature, leafletLayer) {
        // Remember layer inside feature object.
        set(feature, 'leafletLayer', leafletLayer);

        // Call user-defined 'onEachFeature' callback.
        if (typeOf(originalOnEachFeature) === 'function') {
          originalOnEachFeature(feature, leafletLayer);
        }
      });

      // Perform conversion & injection.
      return new L.GeoJSON(featureCollection, options);
    },
  }

  /**
    Component's action invoking on layer creation.

    @method sendingActions.layerInit
    @param {Object} eventObject Action param
    @param {Object} eventObject.leafletObject Created (leaflet layer)[http://leafletjs.com/reference-1.2.0.html#layer]
    @param {NewPlatformFlexberryGISMapLayerModel} eventObject.layerModel Current layer model
  */

  /**
   Component's action invoking before the layer destroying.

  @method sendingActions.layerDestroy
  @param {Object} eventObject Action param
  @param {Object} eventObject.leafletObject Destroying (leaflet layer)[http://leafletjs.com/reference-1.2.0.html#layer]
  @param {NewPlatformFlexberryGISMapLayerModel} eventObject.layerModel Current layer model
  */
);
