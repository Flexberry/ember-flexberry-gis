/**
  @module ember-flexberry-gis
*/

import { scheduleOnce } from '@ember/runloop';

import { isNone, isBlank, typeOf } from '@ember/utils';
import { A, isArray } from '@ember/array';
import { Promise, allSettled } from 'rsvp';
import { inject as service } from '@ember/service';
import {
  computed, get, set, observer
} from '@ember/object';
import Component from '@ember/component';
import LeafletOptionsMixin from '../mixins/leaflet-options';
import LeafletPropertiesMixin from '../mixins/leaflet-properties';
import LeafletMapInteractionMixin from '../mixins/leaflet-map/map-interaction';
import LeafletMapLoaderMixin from '../mixins/leaflet-map/map-loader';
import LeafletMapToolsMixin from '../mixins/leaflet-map/map-tools';
import LeafletMapCommandsMixin from '../mixins/leaflet-map/map-commands';
import LeafletMapSidebarMixin from '../mixins/leaflet-map/map-sidebar';

import layout from '../templates/components/flexberry-map';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-map').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-map').
  @readonly
  @static

  @for FlexberryMapComponent
*/
const flexberryClassNamesPrefix = 'flexberry-map';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix,
};

/**
  Flexberry map component.
  Wraps [leaflet map](http://leafletjs.com/reference-1.0.0.html#map) into ember component.

  @class FlexberryMapComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses LeafletOptionsMixin
  @uses LeafletPropertiesMixin
  @uses LeafletEventsMixin
 */
const FlexberryMapComponent = Component.extend(
  LeafletOptionsMixin,
  LeafletPropertiesMixin,

  // Mixins containing leaflet map extensions (order is important).
  LeafletMapInteractionMixin,
  LeafletMapLoaderMixin,
  LeafletMapToolsMixin,
  LeafletMapCommandsMixin,
  LeafletMapSidebarMixin, {
  /**
    Leaflet map.

    @property _leafletObject
    @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
    @default null
    @private
  */
    _leafletObject: null,

    /**
    Leaflet map container.

    @property _$leafletContainer
    @type <a href="http://learn.jquery.com/using-jquery-core/jquery-object/">jQuery.Object</a>
    @default null
    @private
  */
    _$leafletContainer: null,

    /**
    Reference to component's template.
  */
    layout,

    /**
    This is a object with name and properties prev enabled tools
  */
    prevEnabledTools: null,

    /**
    Reference to component's CSS-classes names.
    Must be also a component's instance property to be available from component's .hbs template.
  */
    flexberryClassNames,

    /**
    Component's wrapping <div> CSS-classes names.

    Any other CSS-class names can be added through component's 'class' property.
    ```handlebars
    {{#flexberry-map class="my-class"}}
      Map's content
    {{/flexberry-map}}
    ```

    @property classNames
    @type String[]
    @default ['flexberry-map']
  */
    classNames: [flexberryClassNames.wrapper],

    /**
    List of leaflet map options which will be passed into leaflet map.
  */
    leafletOptions: [

      // Map state options.
      'center', 'zoom', 'minZoom', 'maxZoom', 'maxBounds', 'maxBoundsViscosity', 'crs', 'preferCanvas', 'editable',

      // Interaction options.
      'dragging', 'touchZoom', 'scrollWheelZoom', 'doubleClickZoom', 'boxZoom',
      'zoomSnap', 'zoomDelta', 'tap', 'tapTolerance', 'trackResize', 'worldCopyJump',
      'closePopupOnClick', 'bounceAtZoomLimits',

      // Keyboard navigation options.
      'keyboard', 'keyboardPanOffset', 'keyboardZoomOffset',

      // Panning Inertia Options.
      'inertia', 'inertiaDeceleration', 'inertiaMaxSpeed', 'inertiaThreshold',

      // Control options.
      'zoomControl', 'attributionControl',

      // Animation options.
      'fadeAnimation', 'zoomAnimation', 'zoomAnimationThreshold', 'markerZoomAnimation'
    ],

    /**
    List of leaflet map properties bindings.
  */
    leafletProperties: ['zoom:setZoom', 'center:panTo:zoomPanOptions', 'maxBounds:setMaxBounds', 'bounds:fitBounds:fitBoundsOptions'],

    /**
    Map center latitude.

    @property lat
    @type Number
    @default null
  */
    lat: null,

    /**
    Map center longitude.

    @property lng
    @type Number
    @default null
  */
    lng: null,

    /**
    Map center.

    @property center
    @type <a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>
    @default [0, 0]
    @readOnly
  */
    center: computed('lat', 'lng', function () {
      return L.latLng(this.get('lat') || 0, this.get('lng') || 0);
    }),

    /**
    Map zoom.

    @property zoom
    @type Number
    @default null
  */
    zoom: null,

    /**
    Editable.

    @property editable
    @type Boolean
    @default true
  */
    editable: true,

    /**
    Forces the map's zoom level to always be a multiple of this.

    @property zoomSnap
    @type Number
    @default 0
  */
    zoomSnap: 0,

    /**
    Controls how much the map's zoom level will change after a zoomIn(), zoomOut(),
    pressing + or - on the keyboard, or using the zoom controls.

    @property zoomDelta
    @type Number
    @default 0.25
  */
    zoomDelta: 0.25,

    /**
    Flag: indicates whether all paths should be rendered on a 'Canvas' renderer instead of 'SVG'.

    @property preferCanvas
    @type Boolean
    @default true
  */
    preferCanvas: true,

    /**
    Array of map layers.

    @property layers
    @type NewPlatformFlexberryGISMapLayer[]
  */
    layers: null,

    /**
    JSON object with query parameters

    @property queryFilter
    @type object
    @default null
   */
    queryFilter: null,

    /**
    Service for managing map API.
    @property mapApi
    @type MapApiService
  */
    mapApi: service(),

    /**
    Flag: indicates this is main map.

    @property mainMap
    @type Boolean
    @default false
  */
    mainMap: false,

    /**
    Injects additional methods into initialized leaflet map.

    @method _injectMapLoaderMethods
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>} leafletMap initialized leaflet map.
    @private
  */
    _injectMapLoaderMethods(leafletMap) {
    // Sets map loader's content.
      leafletMap.setLoaderContent = (content) => {
        this.set('_loaderContent', content);
      };

      // Shows map loader.
      leafletMap.showLoader = () => {
      // Remember current handlers states & disable them,
      // to disable dragging, zoom, keyboard events handling, etc.
        leafletMap._handlers.forEach((handler) => {
          handler._beforeLoaderState = handler.enabled();

          if (handler._beforeLoaderState === true) {
            handler.disable();
          }
        });

        this.set('_isLoaderShown', true);
      };

      // Hides map loader.
      leafletMap.hideLoader = () => {
        this.set('_isLoaderShown', false);

        // Restore handlers states,
        // to restore dragging, zoom, keyboard events handling, etc.
        leafletMap._handlers.forEach((handler) => {
          if (handler._beforeLoaderState === true) {
            handler.enable();
          }
        });
      };

      // Prevents DOM events from being triggered while map loader is shown.
      // Call to L.DOMEvent.StopPropagation doesn't take an effect, so override map's '_fireDOMEvent' method.
      const originalFireDOMEvent = leafletMap._fireDOMEvent;
      leafletMap._fireDOMEvent = (...args) => {
        if (this.get('_isLoaderShown')) {
          return;
        }

        originalFireDOMEvent.apply(leafletMap, args);
      };
    },

    /**
    Removes injected additional methods from initialized leaflet map.
    Runs search query related to the specified URL params: 'queryFilter' and 'mapObjectSetting'.
    Shows map loader, triggeres leaflet map event 'flexberry-map:query', then starts query and waits for all query requests to be finished,
    and finally calls to '_finishQuery' hook.

    @method _runQuery
    @private
  */
    _runQuery(queryFilter, mapObjectSetting) {
      const leafletMap = this.get('_leafletObject');

      // Show map loader.
      leafletMap.flexberryMap.loader.show({ content: this.get('i18n').t('map-tools.identify.loader-message'), });

      this._queryToMap(queryFilter, mapObjectSetting).then((e) => {
        this._finishQuery(e);
      });
    },

    /**
    Runs search query related to the specified URL params: 'queryFilter' and 'mapObjectSetting'.

    @method _queryToMap
    @returns {Ember.RSVP.Promise}
    @private
  */
    _queryToMap(queryFilter, mapObjectSetting) {
      return new Promise((resolve) => {
        const serviceLayer = this.get('serviceLayer');
        const leafletMap = this.get('_leafletObject');

        const e = {
          results: A(),
          queryFilter,
          mapObjectSetting,
          serviceLayer,
        };

        leafletMap.fire('flexberry-map:query', e);

        // Promises array could be totally changed in 'flexberry-map:query' event handlers, we should prevent possible errors.
        e.results = isArray(e.results) ? e.results : A();
        const promises = A();

        // Handle each result.
        // Detach promises from already received features.
        e.results.forEach((result) => {
          if (isNone(result)) {
            return;
          }

          const features = get(result, 'features');
          if (!(features instanceof Promise)) {
            return;
          }

          promises.pushObject(features);
        });

        allSettled(promises).then(() => {
          resolve(e);
        });
      });
    },

    _createObject(queryFilter, mapObjectSetting) {
      if (!isBlank(queryFilter) && !isBlank(mapObjectSetting)) {
        const e = {
          queryFilter,
          mapObjectSetting,
          results: A(),
        };

        const leafletMap = this.get('_leafletObject');

        leafletMap.fire('flexberry-map:createObject', e);
        if (e.results.length) {
          this.sendAction('onCreateObject', e.results);
        }
      }
    },

    /**
    Handles search query finish.
    Shows query results on map, hides map loader, triggers 'queryFinished' action and related leaflet map event 'flexberry-map:queryFinished'.

    @method _finishQuery
    @param {Object} e Event object.
    @param {Object[]} results Objects describing query results.
    Every result-object has the following structure: { layer: ..., features: [...] },
    where 'layer' is metadata of a layer related to query result,
    and 'features' is an array containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects].
    @private
  */
    _finishQuery(e) {
      const leafletMap = this.get('_leafletObject');

      e.results.forEach((queryResult) => {
        queryResult.features.then(
          (features) => {
          // Show new features.
            features.forEach((feature) => {
              const leafletLayer = get(feature, 'leafletLayer') || new L.GeoJSON([feature]);
              if (typeOf(leafletLayer.setStyle) === 'function') {
                leafletLayer.setStyle({
                  color: 'salmon',
                  weight: 2,
                  fillOpacity: 0.3,
                });
              }

              set(feature, 'leafletLayer', leafletLayer);
            });
          }
        );
      });

      // Hide map loader.
      leafletMap.flexberryMap.loader.hide({ content: '', });

      // Fire custom event on leaflet map.
      leafletMap.fire('flexberry-map:queryFinished', e);
      this.sendAction('queryFinished', e);
    },

    /**
    Handles leaflet map's moveend event.

    @method _moveend
    @param {Object} e Event object.
    @private
  */
    _moveend(e) {
      this.sendAction('moveend', e);
    },

    /**
    Handles leaflet map's zoomend event.

    @method _zoomend
    @param {Object} e Event object.
    @private
  */
    _zoomend(e) {
      this.sendAction('zoomend', e);
    },

    /**
    Observes changhes in application's current locale, and refreshes some GUI related to it.

    @method localeDidChange
    @private
  */
    _localeDidChange: observer('i18n.locale', function () {
      const i18n = this.get('i18n');
      const $leafletContainer = this.get('_$leafletContainer');

      if (this.get('zoomControl') && $leafletContainer) {
        const $zoomControl = $leafletContainer.find('.leaflet-control-container .leaflet-control-zoom');
        const $zoomInButton = $zoomControl.find('.leaflet-control-zoom-in');
        const $zoomOutButton = $zoomControl.find('.leaflet-control-zoom-out');

        $zoomInButton.attr('title', i18n.t('components.flexberry-map.zoom-control.zoom-in-button.title'));
        $zoomOutButton.attr('title', i18n.t('components.flexberry-map.zoom-control.zoom-out-button.title'));
      }
    }),

    /**
    Handles leaflet map container's resize.
    Initializes in 'initLeafletMap' hook.

    @property _onLeafletContainerResize
    @type function
    @default null
    @private
  */
    _onLeafletContainerResize: null,

    /**
    Initializes DOM-related component's properties.
  */
    didInsertElement() {
      this._super(...arguments);

      // Store map's container as jQuery object.
      const $leafletContainer = this.$();
      this.set('_$leafletContainer', $leafletContainer);

      const options = this.get('options');

      // Create leaflet map.
      const leafletMap = L.map($leafletContainer[0], options);
      if (this.get('mainMap')) {
        L.DomEvent.on(leafletMap, 'mousedown mouseup mousein mouseout', (e) => {
          if (e.originalEvent.button === 1) {
            if (e.type === 'mousedown') {
              e.originalEvent.preventDefault();
              const enabledTools = {
                name: leafletMap.flexberryMap.tools.getEnabled().name,
                mapToolProperties: leafletMap.flexberryMap.tools.getEnabled().mapToolProperties,
              };
              this.set('prevEnabledTools', enabledTools);
              leafletMap.flexberryMap.tools.enable('drag');
            } else {
              leafletMap.flexberryMap.tools.enable(this.get('prevEnabledTools.name'), this.get('prevEnabledTools.mapToolProperties'));
              this.set('prevEnabledTools', null);
            }
          } else if (!isNone(this.get('prevEnabledTools'))) {
            leafletMap.flexberryMap.tools.enable(this.get('prevEnabledTools.name'), this.get('prevEnabledTools.mapToolProperties'));
            this.set('prevEnabledTools', null);
          }
        });
      }

      this.set('_leafletObject', leafletMap);

      // Perform initializations.
      if (this.get('mainMap')) {
        this.willInitLeafletMap(leafletMap);
      }

      this.initLeafletMap(leafletMap);

      if (this.get('mainMap')) {
        this.initServiceLayer(leafletMap);
        this.initClickOnPanes(leafletMap);

        // Run search query if 'queryFilter' is defined.
        const queryFilter = this.get('queryFilter');
        const mapObjectSetting = this.get('mapObjectSetting');
        if (!isBlank(queryFilter)) {
          scheduleOnce('afterRender', this, function () {
            this._runQuery(queryFilter, mapObjectSetting);
          });
        }

        const mapApi = this.get('mapApi');
        if (isNone(mapApi.getFromApi('runQuery'))) {
          mapApi.addToApi('runQuery', this._runQuery.bind(this));
          this.set('_hasQueryApi', true);
        }

        if (isNone(mapApi.getFromApi('queryToMap'))) {
          mapApi.addToApi('queryToMap', this._queryToMap.bind(this));
          this.set('_hasQueryToMap', true);
        }

        if (isNone(mapApi.getFromApi('createObject'))) {
          mapApi.addToApi('createObject', this._createObject.bind(this));
          this.set('_hasCreateObjectApi', true);
        }

        if (isNone(mapApi.getFromApi('leafletMap'))) {
          mapApi.addToApi('leafletMap', leafletMap);
          this.set('_hasLeafletMap', true);
        }

        if (isNone(mapApi.getFromApi('serviceLayer'))) {
          mapApi.addToApi('serviceLayer', this.get('serviceLayer'));
          this.set('_hasServiceLayer', true);
        }

        scheduleOnce('afterRender', this, function () {
          this.load(leafletMap, mapApi);
        });
      }
    },

    /**
    Run an array of prommis.

    @parm {Object} mapApi Object mapApi.
  */
    load(leafletMap, mapApi) {
      const e = {
        results: [],
        loadFunc: [],
      };

      leafletMap.fire('flexberry-map:load', e);

      allSettled(e.results).then(function (array) {
        leafletMap.fire('flexberry-map:allLayersLoaded');
        const readyMapLayers = mapApi.getFromApi('readyMapLayers');
        const errorMapLayers = mapApi.getFromApi('errorMapLayers');

        const rejected = array.filter((item) => item.state === 'rejected').length > 0;

        if (!isNone(readyMapLayers) && !rejected) {
          readyMapLayers();
        } else if (!isNone(errorMapLayers) && rejected) {
          errorMapLayers();
        }

        if (e.loadFunc.length > 0) {
          const func = e.loadFunc.pop();
          func();
        }
      });
    },

    /**
    Destroys DOM-related component's properties.
  */
    willDestroyElement() {
      this._super(...arguments);

      const leafletMap = this.get('_leafletObject');
      if (!isNone(leafletMap)) {
        if (this.get('mainMap')) {
          this.destroyServiceLayer(leafletMap);
          this.willDestroyLeafletMap(leafletMap);
        }

        this.destroyLeafletMap(leafletMap);
      }
    },

    /**
    Performs some initialization before leaflet map will be initialized.

    @param {Object} leafletMap Leaflet map.
  */
    willInitLeafletMap(leafletMap) {
    // Add 'flexberryMap' namespace to leafletMap.
      leafletMap.flexberryMap = {};

      // See 'willInitLeafletMap' implementations in mixins which are mixed to 'leaflet-map'.
      this._super(...arguments);
    },

    /**
    Performs some clean up before leaflet map will be destroyed.

    @param {Object} leafletMap Leaflet map.
  */
    willDestroyLeafletMap(leafletMap) {
    // See 'willDestroyLeafletMap' implementations in mixins which are mixed to 'leaflet-map'.
      this._super(...arguments);

      // Remove 'flexberryMap' namespace forom leafletMap.
      delete leafletMap.flexberryMap;
    },

    /**
    Initializes leaflet map related properties.

    @param {Object} leafletMap Leaflet map.
  */
    initLeafletMap(leafletMap) {
    // See 'initLeafletMap' implementations in mixins which are mixed to 'leaflet-map'.
      this._super(...arguments);

      leafletMap.on('moveend', this._moveend, this);
      leafletMap.on('zoomend', this._zoomend, this);

      // Bind map container's resize event handler.
      const onLeafletContainerResize = {
        onResizeStart: () => {
          leafletMap.fire('containerResizeStart');
        },
        onResize: () => {
          leafletMap.invalidateSize(false);
          leafletMap.fire('containerResize');
        },
        onResizeEnd: () => {
          leafletMap.fire('containerResizeEnd');
        },
      };
      this.set('_onLeafletContainerResize', onLeafletContainerResize);

      const $leafletContainer = this.get('_$leafletContainer');
      $leafletContainer.resize(onLeafletContainerResize);

      // Update text resources on the map and it's tools to math the current locale.
      scheduleOnce('afterRender', this, '_localeDidChange');

      this.sendAction('leafletInit', {
        map: leafletMap,
      });
      if (this.get('mainMap')) {
        this.get('mapApi').addToApi('leafletMap', leafletMap);
      }
    },

    initClickOnPanes(leafletMap) {
      const pane = leafletMap.getPane('overlayPane');
      L.DomEvent.on(pane, 'click', function (e) {
        if (e._stopped) { return; }

        let { target, } = e;

        // Проблема с пробрасыванием кликов была только из-за введения разных canvas. Если клик попал на другой элемент, то работает стандартная логика
        if (target.tagName.toLowerCase() !== 'canvas') {
          return;
        }

        // в стандартные pane теперь попадают только всякие сервисные вещи, поэтому zoom проверять не будем
        const point = leafletMap.mouseEventToLayerPoint(e);
        let intersect = false;

        const checkIntersect = (layer) => {
          let innerLayerIntersect = false;
          if (typeof (layer.eachLayer) === 'function') {
            layer.eachLayer(function (l) {
              innerLayerIntersect = innerLayerIntersect || checkIntersect(l);
              if (innerLayerIntersect) {
                return innerLayerIntersect;
              }
            });
          } else if (typeof (layer._containsPoint) === 'function') {
            innerLayerIntersect = innerLayerIntersect || layer._containsPoint(point);
          }

          return innerLayerIntersect;
        };

        leafletMap.eachLayer((l) => {
          if (l.getPane() === pane) {
            intersect = intersect || checkIntersect(l);
          }
        });

        if (intersect) {
          return;
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
    Destroys leaflet map.

    @param {Object} leafletMap Leaflet map.
  */
    destroyLeafletMap(leafletMap) {
    // See 'destroyLeafletMap' implementations in mixins which are mixed to 'leaflet-map'.
      this._super(...arguments);

      leafletMap.off('moveend', this._moveend, this);
      leafletMap.off('zoomend', this._zoomend, this);

      // Unbind map container's resize event handler.
      const $leafletContainer = this.get('_$leafletContainer');
      const onLeafletContainerResize = this.get('_onLeafletContainerResize');
      if (!isNone($leafletContainer) && !isNone(onLeafletContainerResize)) {
        $leafletContainer.removeResize(onLeafletContainerResize);
        this.set('_onLeafletContainerResize', null);
      }

      scheduleOnce('afterRender', this, '_localeDidChange');
      leafletMap.remove();
      this.set('_leafletObject', null);
      this.set('_$leafletContainer', null);

      if (this.get('mainMap')) {
        if (this.get('_hasQueryApi')) {
          this.get('mapApi').addToApi('runQuery', undefined);
        }

        if (this.get('_hasQueryToMap')) {
          this.get('mapApi').addToApi('queryToMap', undefined);
        }

        if (this.get('_hasCreateObjectApi')) {
          this.get('mapApi').addToApi('createObject', undefined);
        }

        if (this.get('_hasLeafletMap')) {
          this.get('mapApi').addToApi('leafletMap', undefined);
        }

        if (this.get('_hasServiceLayer')) {
          this.get('mapApi').addToApi('serviceLayer', undefined);
        }
      }

      this.sendAction('leafletDestroy');
    },

    /**
    Initializes map's service layer.

    @param {Object} leafletMap Leaflet map.
  */
    initServiceLayer(leafletMap) {
      const serviceLayer = L.featureGroup();
      this.set('serviceLayer', serviceLayer);

      leafletMap.addLayer(serviceLayer);
      this.sendAction('serviceLayerInit', serviceLayer);
    },

    /**
    Destroys map's service layer.

    @param {Object} leafletMap Leaflet map.
  */
    destroyServiceLayer(leafletMap) {
      const serviceLayer = this.get('serviceLayer');
      if (!isNone(serviceLayer) && leafletMap.hasLayer(serviceLayer)) {
        leafletMap.removeLayer(serviceLayer);
      }

      this.set('serviceLayer', null);
      this.sendAction('serviceLayerDestroy');
    },

    /**
    Component's action invoking when [leaflet map](http://leafletjs.com/reference-1.0.0.html#map) initialized.

    @method sendingActions.leafletInit
    @param {Object} e Action's event object.
    @param {Boolean} e.map Initialized leaflet map.
  */

    /**
    Component's action invoking when [leaflet map](http://leafletjs.com/reference-1.0.0.html#map) destroyed.

    @method sendingActions.leafletDestroy
  */

    /**
    Component's action invoking when map's service layer initialized.

    @method sendingActions.serviceLayerInit
    @param {Object} serviceLayer Service layer.
  */

    /**
    Component's action invoking when maps's service layer destroyed.

    @method sendingActions.serviceLayerDestroy
  */

    /**
    Component's action invoking when query on map load finished.

    @method sendingActions.queryFinished
    @param {Object} e Query result object.
  */

    actions: {
    /**
      Handles edit dialog's 'approve' action.
      Invokes component's {{#crossLink "FlexberryMaplayerComponent/sendingActions.edit:method"}}'edit'{{/crossLink}} action.

      @method actions.onEditDialogApprove
      @param {Object} e Action's event object.
      @param {Object} e.layerProperties Object containing edited layer properties, which must be merged to layer on action.
    */
      onEditDialogApprove(...args) {
      // Send outer 'edit' action.
        this.sendAction('edit', ...args);
      },
    },
  }
);

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryMapComponent.reopenClass({
  flexberryClassNames,
});

export default FlexberryMapComponent;
