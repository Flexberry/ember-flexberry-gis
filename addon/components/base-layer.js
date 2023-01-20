/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import DynamicPropertiesMixin from 'ember-flexberry-gis/mixins/dynamic-properties';
import DynamicActionsMixin from 'ember-flexberry/mixins/dynamic-actions';
import LeafletOptionsMixin from 'ember-flexberry-gis/mixins/leaflet-options';
import { checkMapZoomLayer } from '../utils/check-zoom';

const {
  assert
} = Ember;

/**
  BaseLayer component for other flexberry-gis layers.

  @class BaseLayerComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses DynamicPropertiesMixin
  @uses LeafletOptionsMixin
 */
export default Ember.Component.extend(
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
    _layersStylesRenderer: Ember.inject.service('layers-styles-renderer'),

    /**
      Service for managing map API.

      @property mapApi
      @type MapApiService
    */
    mapApi: Ember.inject.service(),

    /**
      Overload wrapper tag name for disabling wrapper.
    */
    tagName: '',

    archTime: null,
    hasTime: null,

    timeObserverDelay: 1500,

    timeObserver: Ember.observer('layerModel.archTime', function () {
      // Из комбинированого исторического слоя это изменение пробросится и для основного тоже. Проконтролируем
      if (this.get('hasTime') && this.reload && typeof (this.reload) === 'function') {
        Ember.run.debounce(this, this.reload, this.get('timeObserverDelay'));
      }
    }),

    customFilter: Ember.computed('layerModel.archTime', function () {
      if (this.get('hasTime')) {
        let time = this.get('layerModel.archTime');
        let formattedTime;
        if (Ember.isBlank(time) || time === 'present' || Ember.isNone(time)) {
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
      let layerFilter = this.get('filter');
      let resultFilter = Ember.A();
      if (!Ember.isNone(layerFilter) && layerFilter !== '') {
        resultFilter.pushObject(layerFilter);
      }

      if (!Ember.isNone(filter) && filter !== '') {
        resultFilter.pushObject(filter);
      }

      if (!Ember.isNone(customFilter) && customFilter !== '') {
        resultFilter.pushObject(customFilter);
      }

      if (resultFilter.length === 0) {
        return null;
      } else if (resultFilter.length === 1) {
        return resultFilter[0];
      } else {
        return new L.Filter.And(...resultFilter);
      }
    },

    setOwner(properties) {
      let owner = Ember.getOwner(this);
      let ownerKey = null;
      Ember.A(Object.keys(this) || []).forEach((key) => {
        if (this[key] === owner) {
          ownerKey = key;
          return false;
        }
      });

      if (!Ember.isBlank(ownerKey)) {
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
      coordsToLatLng: function (coords) {
        let crs = this.get('crs');
        let point = new L.Point(coords[0], coords[1]);
        let latlng = crs.projection.unproject(point);
        if (!Ember.isNone(coords[2])) {
          latlng.alt = coords[2];
        }

        return latlng;
      }
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
    crs: Ember.computed('layerModel.crs', 'leafletMap.options.crs', function () {
      let crs = this.get('layerModel.crs');
      if (Ember.isNone(crs)) {
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
      let leafletMap = this.get('leafletMap');
      let pane = leafletMap.createPane(name);
      let layer = this;

      L.DomEvent.on(pane, 'click', function (e) {
        if (e._stopped) { return; }

        var target = e.target;

        // Проблема с пробрасыванием кликов была только из-за введения разных canvas. Если клик попал на другой элемент, то работает стандартная логика
        if (target.tagName.toLowerCase() !== 'canvas') {
          return;
        }

        let l = layer;
        if (l.leafletMap.hasLayer(l._leafletObject) && checkMapZoomLayer(l)) {
          var point = l.leafletMap.mouseEventToLayerPoint(e);

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

        var ev = new MouseEvent(e.type, e);
        let removed = { node: target, pointerEvents: target.style.pointerEvents };
        target.style.pointerEvents = 'none';
        target = document.elementFromPoint(e.clientX, e.clientY);

        if (target && target !== pane && target.parentElement && target.parentElement.classList.value.indexOf('leaflet-vectorLayer') !== -1) {
          let stopped = !target.dispatchEvent(ev);
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
      this.set('_leafletLayerPromise', Ember.RSVP.hash({
        leafletLayer: this.createLayer()
      }).then(({
        leafletLayer
      }) => {
        Ember.set(leafletLayer, 'leafletMap', this.get('leafletMap'));
        this.set('_leafletObject', leafletLayer);

        if (Ember.isPresent(this.get('layerModel'))) {
          if (!Ember.isNone(this.get('layerModel._leafletObject'))) {
            Ember.set(this.get('layerModel'), '_leafletObjectFirst', this.get('layerModel._leafletObject'));
          }

          Ember.set(this.get('layerModel'), '_leafletObject', leafletLayer);

          if (Ember.isNone(this.get('layerModel.leafletObjectGetter'))) {
            Ember.set(this.get('layerModel'), 'leafletObjectGetter', this.getLeafletObject.bind(this));
          }

          // Save the reference to the instance method for getting attributes options.
          if (Ember.isNone(this.get('layerModel._attributesOptions'))) {
            Ember.set(this.get('layerModel'), '_attributesOptions', this._getAttributesOptions.bind(this));
          }
        }

        this.sendAction('layerInit', { leafletObject: leafletLayer, layerModel: this.get('layerModel') });

        const layerInitCallback = this.get('mapApi').getFromApi('layerInitCallback');
        if (typeof layerInitCallback === 'function') {
          layerInitCallback(this);
        }

        return leafletLayer;
      }).catch((errorMessage) => {
        Ember.Logger.error(`Failed to create leaflet layer for '${this.get('layerModel.name')}': ${errorMessage}`);
      }));
    },

    _setFilter: Ember.observer('layerModel.filter', function () {

      let filter = this.get('layerModel.filter');
      if (typeof filter === 'string') {
        try {
          let layerLinks = this.get('layerModel.layerLink');
          let layerModel = this.get('layerModel');

          // this.get('type') to get type for layers in combine-layer
          let type = !Ember.isNone(this.get('type')) ? this.get('type') : layerModel.get('type');
          filter = Ember.getOwner(this).lookup(`layer:${type}`).parseFilter(filter, (this.get('geometryField') || 'geometry'), null, layerLinks);
        }
        catch (ex) {
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
      this.sendAction('layerDestroy', { leafletObject: this.get('_leafletObject'), layerModel: this.get('layerModel') });

      // Execute specific destroy logic related to layer's type.
      this.destroyLayer();

      // Now execute base destroy logic.
      this._removeLayerFromLeafletContainer();

      if (this.get('labelSettings.signMapObjects') && !Ember.isNone(this.get('additionalZoomLabel'))) {
        this.set('additionalZoomLabel', null);
      }

      if (this.get('labelSettings.signMapObjects') && !Ember.isNone(this.get('_labelsLayer'))) {
        this.set('_labelsLayer', null);
      }

      this.set('_leafletObject', null);
      this.set('_leafletLayerPromise', null);
      if (Ember.isPresent(this.get('layerModel'))) {
        Ember.set(this.get('layerModel'), '_leafletObject', null);
        Ember.set(this.get('layerModel'), '_attributesOptions', null);
      }
    },

    /**
      Returns promise with the layer properties object.

      @method _getAttributesOptions
      @private
    */
    _getAttributesOptions(source) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        resolve({
          object: this.get('_leafletObject'),
          settings: {
            readonly: true,
            localizedProperties: JSON.parse(JSON.stringify(this.get('displaySettings.featuresPropertiesSettings.localizedProperties'))),
            excludedProperties: JSON.parse(JSON.stringify(this.get('displaySettings.featuresPropertiesSettings.excludedProperties'))),
          }
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

      if (Ember.isNone(leafletLayer)) {
        return;
      }

      const setZIndexFunc = Ember.get(leafletLayer, 'setZIndex');
      if (Ember.typeOf(setZIndexFunc) !== 'function') {
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
      let leafletLayer = this.get('_leafletObject');
      if (Ember.isNone(leafletLayer) || Ember.typeOf(leafletLayer.setOpacity) !== 'function') {
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
      let leafletLayer = this.get('_leafletObject');

      if (Ember.isNone(leafletLayer)) {
        return;
      }

      let styleSettings = this.get('styleSettings');
      if (Ember.isNone(styleSettings)) {
        return;
      }

      let layersStylesRenderer = this.get('_layersStylesRenderer');
      layersStylesRenderer.renderOnLeafletLayer({ leafletLayer, styleSettings });
    },

    /**
      Adds layer to it's leaflet container.

      @method _addLayerToLeafletContainer
      @private
    */
    _addLayerToLeafletContainer() {
      let leafletContainer = this.get('leafletContainer');
      let leafletLayer = this.get('_leafletObject');

      if (Ember.isNone(leafletContainer) || Ember.isNone(leafletLayer) || leafletContainer.hasLayer(leafletLayer)) {
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

      leafletContainer.addLayer(leafletLayer);
      let leafletMap = this.get('leafletMap');
      if (!Ember.isNone(leafletMap) && leafletLayer.options.continueLoading) {
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
      let leafletLayer = this.get('_leafletObject');

      if (Ember.isNone(leafletContainer) || Ember.isNone(leafletLayer) || !leafletContainer.hasLayer(leafletLayer)) {
        return;
      }

      leafletContainer.removeLayer(leafletLayer);

      if (this.get('labelSettings.signMapObjects') && !Ember.isNone(this.get('additionalZoomLabel'))) {
        this.get('additionalZoomLabel').forEach(zoomLabels => {
          if (leafletContainer.hasLayer(zoomLabels)) {
            leafletContainer.removeLayer(zoomLabels);
          }
        });
      }

      if (this.get('labelSettings.signMapObjects') && !Ember.isNone(this.get('_labelsLayer')) &&
        leafletContainer.hasLayer(this.get('_labelsLayer'))) {
        leafletContainer.removeLayer(this.get('_labelsLayer'));
      }
    },

    /**
      Observes and handles changes in JSON-string with layer settings.
      Performs layer's recreation with new settings.

      @method visibilityDidChange
      @private
    */
    _indexDidChange: Ember.observer('index', function () {
      this._setLayerZIndex();
    }),

    /**
      Observes and handles changes in {{#crossLink "BaseLayerComponent/visibility:property"}}'visibility' property{{/crossLink}}.
      Switches layer's visibility.

      @method visibilityDidChange
      @private
    */
    _visibilityDidChange: Ember.observer('visibility', function () {
      this._setLayerVisibility();
    }),

    /**
      Observes and handles changes in {{#crossLink "BaseLayerComponent/opacity:property"}}'opacity' property{{/crossLink}}.
      Changes layer's opacity.

      @method _opacityDidChange
      @private
    */
    _opacityDidChange: Ember.observer('opacity', function () {
      this._setLayerOpacity();
    }),

    /**
      Observes and handles changes in {{#crossLink "BaseLayerComponent/styleSettings:property"}}'styleSettings' property{{/crossLink}}.
      Changes layer's style settings.

      @method _styleSettingsDidChange
      @private
    */
    _styleSettingsDidChange: Ember.observer('styleSettings', function () {
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
      let shouldIdentify = Ember.A(e.layers || []).contains(this.get('layerModel'));
      if (!shouldIdentify) {
        return;
      }

      // Call public identify method, if layer should be identified.
      e.results.push({
        layerModel: this.get('layerModel'),
        features: this.identify(e)
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
      let layerModel = this.get('layerModel');
      let isVectorLayer = Ember.getOwner(this).lookup('layer:' + layerModel.get('type')).isVectorType(layerModel);
      let shouldGetNearObject = Ember.A(e.layers || []).contains(layerModel) && isVectorLayer;
      if (!shouldGetNearObject) {
        return;
      }

      // Call public getNearObject method, if layer should be getNearObject.
      e.results.push({
        layerModel: layerModel,
        features: this.getNearObject(e)
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
      let shouldSearch = typeof (e.filter) === 'function' && e.filter(this.get('layerModel'));
      if (!shouldSearch) {
        return;
      }

      // Call public search method, if layer should be searched.
      e.results.push({
        layerModel: this.get('layerModel'),
        features: this.search(e)
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
      let layerLinks =
        this.get('layerModel.layerLink')
          .filter(link => link.get('mapObjectSetting.id') === e.mapObjectSetting);

      if (!Ember.isArray(layerLinks) || layerLinks.length === 0) {
        return;
      }

      // Call public query method, if layer has links.
      e.results.push({
        layerModel: this.get('layerModel'),
        features: this.query(layerLinks, e)
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
      let layerLinks =
        this.get('layerModel.layerLink')
          .filter(link => link.get('mapObjectSetting.id').toLowerCase() === e.mapObjectSetting.toLowerCase());

      if (!Ember.isArray(layerLinks) || layerLinks.length === 0) {
        return;
      }

      layerLinks.forEach((link) => {
        e.results.push({
          layerModel: this.get('layerModel'),
          linkParameters: link.get('parameters'),
          queryFilter: e.queryFilter
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
      return new Ember.RSVP.resolve();
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

      let leafletMap = this.get('leafletMap');
      if (!Ember.isNone(leafletMap)) {

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

      let leafletMap = this.get('leafletMap');
      if (!Ember.isNone(leafletMap)) {
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
      return new Ember.RSVP.Promise((resolve, reject) => {
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
      let layer = this.get('_leafletObject');

      if (Ember.isNone(layer)) {
        return new Ember.RSVP.Promise((resolve, reject) => {
          reject(`Leaflet layer for '${this.get('layerModel.name')}' isn't created yet`);
        });
      }

      let bounds = this._getBoundingBox(layer);

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
      changedOptions
    }) {
      let optionsDidntChange = changedOptions.length === 0;
      if (optionsDidntChange) {
        // Prevent unnecessary leaflet layer's recreation.
        return;
      }

      let onlyOpacityDidChange = changedOptions.length === 1 && changedOptions.contains('opacity');
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
        features: []
      };

      if (Ember.isArray(geojson)) {
        Ember.set(featureCollection, 'features', geojson);
      } else if (Ember.get(geojson, 'type') === 'Feature') {
        Ember.set(featureCollection, 'features', [geojson]);
      } else if (Ember.get(geojson, 'type') === 'FeatureCollection') {
        featureCollection = geojson;
      }

      let features = Ember.A(Ember.get(featureCollection, 'features') || []);
      if (Ember.get(features, 'length') === 0) {
        return null;
      }

      let crs = this.get('crs');
      Ember.set(options, 'coordsToLatLng', function (coords) {
        let point = new L.Point(coords[0], coords[1]);
        let latlng = crs.projection.unproject(point);
        if (!Ember.isNone(coords[2])) {
          latlng.alt = coords[2];
        }

        return latlng;
      });

      // Define callback method on each feature.
      let originalOnEachFeature = Ember.get(options, 'onEachFeature');
      Ember.set(options, 'onEachFeature', function (feature, leafletLayer) {
        // Remember layer inside feature object.
        Ember.set(feature, 'leafletLayer', leafletLayer);

        // Call user-defined 'onEachFeature' callback.
        if (Ember.typeOf(originalOnEachFeature) === 'function') {
          originalOnEachFeature(feature, leafletLayer);
        }
      });

      // Perform conversion & injection.
      return new L.GeoJSON(featureCollection, options);
    }
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
