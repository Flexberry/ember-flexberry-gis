/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
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
  wrapper: flexberryClassNamesPrefix
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
let FlexberryMapComponent = Ember.Component.extend(
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
    'center', 'zoom', 'minZoom', 'maxZoom', 'maxBounds', 'maxBoundsViscosity', 'crs', 'preferCanvas', 'editable', 'wheelPxPerZoomLevel',

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
  center: Ember.computed('lat', 'lng', function () {
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
    How many scroll pixels (as reported by L.DomEvent.getWheelDelta) mean a change of one full zoom level.
    Smaller values will make wheel-zooming faster (and vice versa).

    @property wheelPxPerZoomLevel
    @type Number
    @default 60
  */
  wheelPxPerZoomLevel: 60,

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
  mapApi: Ember.inject.service(),

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
    let originalFireDOMEvent = leafletMap._fireDOMEvent;
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
    let leafletMap = this.get('_leafletObject');

    // Show map loader.
    leafletMap.flexberryMap.loader.show({ content: this.get('i18n').t('map-tools.identify.loader-message') });

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
    return new Ember.RSVP.Promise((resolve) => {
      let serviceLayer = this.get('serviceLayer');
      let leafletMap = this.get('_leafletObject');

      let e = {
        results: Ember.A(),
        queryFilter: queryFilter,
        mapObjectSetting: mapObjectSetting,
        serviceLayer: serviceLayer
      };

      leafletMap.fire('flexberry-map:query', e);

      // Promises array could be totally changed in 'flexberry-map:query' event handlers, we should prevent possible errors.
      e.results = Ember.isArray(e.results) ? e.results : Ember.A();
      let promises = Ember.A();

      // Handle each result.
      // Detach promises from already received features.
      e.results.forEach((result) => {
        if (Ember.isNone(result)) {
          return;
        }

        let features = Ember.get(result, 'features');
        if (!(features instanceof Ember.RSVP.Promise)) {
          return;
        }

        promises.pushObject(features);
      });

      Ember.RSVP.allSettled(promises).then(() => {
        resolve(e);
      });
    });
  },

  _createObject(queryFilter, mapObjectSetting) {
    if (!Ember.isBlank(queryFilter) && !Ember.isBlank(mapObjectSetting)) {

      let e = {
        queryFilter: queryFilter,
        mapObjectSetting: mapObjectSetting,
        results: Ember.A()
      };

      let leafletMap = this.get('_leafletObject');

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
    let leafletMap = this.get('_leafletObject');

    e.results.forEach((queryResult) => {
      queryResult.features.then(
        (features) => {
          // Show new features.
          features.forEach((feature) => {
            let leafletLayer = Ember.get(feature, 'leafletLayer') || new L.GeoJSON([feature]);
            if (Ember.typeOf(leafletLayer.setStyle) === 'function') {
              leafletLayer.setStyle({
                color: 'salmon',
                weight: 2,
                fillOpacity: 0.3
              });
            }

            Ember.set(feature, 'leafletLayer', leafletLayer);
          });
        });
    });

    // Hide map loader.
    leafletMap.flexberryMap.loader.hide({ content: '' });

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
  _localeDidChange: Ember.observer('i18n.locale', function () {
    let i18n = this.get('i18n');
    let $leafletContainer = this.get('_$leafletContainer');

    if (this.get('zoomControl') && $leafletContainer) {
      let $zoomControl = $leafletContainer.find('.leaflet-control-container .leaflet-control-zoom');
      let $zoomInButton = $zoomControl.find('.leaflet-control-zoom-in');
      let $zoomOutButton = $zoomControl.find('.leaflet-control-zoom-out');

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
    let $leafletContainer = this.$();
    this.set('_$leafletContainer', $leafletContainer);

    let options = this.get('options');

    // Create leaflet map.
    let leafletMap = L.map($leafletContainer[0], options);
    if (this.get('mainMap')) {
      L.DomEvent.on(leafletMap, 'mousedown mouseup mousein mouseout', (e) => {
        if (e.originalEvent.button === 1) {
          if (e.type === 'mousedown') {
            e.originalEvent.preventDefault();
            let enabledTools = {
              name: leafletMap.flexberryMap.tools.getEnabled().name,
              mapToolProperties: leafletMap.flexberryMap.tools.getEnabled().mapToolProperties
            };
            this.set('prevEnabledTools', enabledTools);
            leafletMap.flexberryMap.tools.enable('drag');
          } else {
            leafletMap.flexberryMap.tools.enable(this.get('prevEnabledTools.name'), this.get('prevEnabledTools.mapToolProperties'));
            this.set('prevEnabledTools', null);
          }
        } else if (!Ember.isNone(this.get('prevEnabledTools'))) {
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

      // Run search query if 'queryFilter' is defined.
      let queryFilter = this.get('queryFilter');
      let mapObjectSetting = this.get('mapObjectSetting');
      if (!Ember.isBlank(queryFilter)) {
        Ember.run.scheduleOnce('afterRender', this, function () {
          this._runQuery(queryFilter, mapObjectSetting);
        });
      }

      const mapApi = this.get('mapApi');
      if (Ember.isNone(mapApi.getFromApi('runQuery'))) {
        mapApi.addToApi('runQuery', this._runQuery.bind(this));
        this.set('_hasQueryApi', true);
      }

      if (Ember.isNone(mapApi.getFromApi('queryToMap'))) {
        mapApi.addToApi('queryToMap', this._queryToMap.bind(this));
        this.set('_hasQueryToMap', true);
      }

      if (Ember.isNone(mapApi.getFromApi('createObject'))) {
        mapApi.addToApi('createObject', this._createObject.bind(this));
        this.set('_hasCreateObjectApi', true);
      }

      if (Ember.isNone(mapApi.getFromApi('leafletMap'))) {
        mapApi.addToApi('leafletMap', leafletMap);
        this.set('_hasLeafletMap', true);
      }

      if (Ember.isNone(mapApi.getFromApi('serviceLayer'))) {
        mapApi.addToApi('serviceLayer', this.get('serviceLayer'));
        this.set('_hasServiceLayer', true);
      }

      Ember.run.scheduleOnce('afterRender', this, function () {
        this.load(leafletMap, mapApi);
      });
    }
  },

  /**
    Run an array of prommis.

    @parm {Object} mapApi Object mapApi.
  */
  load(leafletMap, mapApi) {
    let e = {
      results: [],
      loadFunc: []
    };

    leafletMap.fire('flexberry-map:load', e);

    Ember.RSVP.allSettled(e.results).then(function (array) {
      leafletMap.fire('flexberry-map:allLayersLoaded');
      const readyMapLayers = mapApi.getFromApi('readyMapLayers');
      const errorMapLayers = mapApi.getFromApi('errorMapLayers');

      const rejected = array.filter((item) => { return item.state === 'rejected' || Ember.isNone(item.value);  }).length > 0;

      if (!Ember.isNone(readyMapLayers) && !rejected) {
        readyMapLayers();
      } else if (!Ember.isNone(errorMapLayers) && rejected) {
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

    let leafletMap = this.get('_leafletObject');
    if (!Ember.isNone(leafletMap)) {
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
    let onLeafletContainerResize = {
      onResizeStart: () => {
        leafletMap.fire('containerResizeStart');
      },
      onResize: () => {
        leafletMap.invalidateSize(false);
        leafletMap.fire('containerResize');
      },
      onResizeEnd: () => {
        leafletMap.fire('containerResizeEnd');
      }
    };
    this.set('_onLeafletContainerResize', onLeafletContainerResize);

    let $leafletContainer = this.get('_$leafletContainer');
    $leafletContainer.resize(onLeafletContainerResize);

    // Update text resources on the map and it's tools to math the current locale.
    Ember.run.scheduleOnce('afterRender', this, '_localeDidChange');

    this.sendAction('leafletInit', {
      map: leafletMap
    });
    if (this.get('mainMap')) {
      this.get('mapApi').addToApi('leafletMap', leafletMap);
    }
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
    let $leafletContainer = this.get('_$leafletContainer');
    let onLeafletContainerResize = this.get('_onLeafletContainerResize');
    if (!Ember.isNone($leafletContainer) && !Ember.isNone(onLeafletContainerResize)) {
      $leafletContainer.removeResize(onLeafletContainerResize);
      this.set('_onLeafletContainerResize', null);
    }

    Ember.run.scheduleOnce('afterRender', this, '_localeDidChange');
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
    let serviceLayer = L.featureGroup();
    this.set('serviceLayer', serviceLayer);

    leafletMap.addLayer(serviceLayer);
    this.sendAction('serviceLayerInit', serviceLayer);
  },

  /**
    Destroys map's service layer.

    @param {Object} leafletMap Leaflet map.
  */
  destroyServiceLayer(leafletMap) {
    let serviceLayer = this.get('serviceLayer');
    if (!Ember.isNone(serviceLayer) && leafletMap.hasLayer(serviceLayer)) {
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
  }
}
);

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryMapComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryMapComponent;
