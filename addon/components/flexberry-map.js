/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import LeafletOptionsMixin from '../mixins/leaflet-options';
import LeafletPropertiesMixin from '../mixins/leaflet-properties';

import layout from '../templates/components/flexberry-map';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-map').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-map').
  @property {String} flexberryClassNames.loader Component's loader CSS-class name ('flexberry-map-loader').
  @property {String} flexberryClassNames.loaderDimmer Component's loader's dimmer CSS-class name ('flexberry-map-loader-dimmer').
  @readonly
  @static

  @for FlexberryMapComponent
*/
const flexberryClassNamesPrefix = 'flexberry-map';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix,
  loader: flexberryClassNamesPrefix + '-loader',
  loaderDimmer: flexberryClassNamesPrefix + '-loader-dimmer'
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
  LeafletPropertiesMixin, {
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
      Flag: indicates whether map loader is shown or not.
      Use leaflet map's 'showLoader', 'hideLoader' methods to set this property value.

      @property _isLoaderShown
      @type Boolean
      @default false
      @private
    */
    _isLoaderShown: false,

    /**
      Map loader's content.
      Use leaflet map's 'setLoaderContent' to set this property value.

      @property _loaderContent
      @type String
      @default ''
      @private
    */
    _loaderContent: '',

    /**
      Reference to component's template.
    */
    layout,

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
    classNames: ['flexberry-map'],

    /**
      List of leaflet map options which will be passed into leaflet map.
    */
    leafletOptions: [

      // Map state options.
      'center', 'zoom', 'minZoom', 'maxZoom', 'maxBounds', 'maxBoundsViscosity', 'crs', 'preferCanvas',

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
      @type Array of NewPlatformFlexberryGISMapLayer
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

      @method _removeMapLoaderMethods
      @param {<a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>} leafletMap initialized leaflet map.
      @private
    */
    _removeMapLoaderMethods(leafletMap) {
      delete leafletMap.setLoaderContent;
      delete leafletMap.showLoader;
      delete leafletMap.hideLoader;
      delete leafletMap._fireDOMEvent;
    },

    _runQuery(queryFilter, mapObjectSetting) {
      let serviceLayer = this.get('serviceLayer');
      let leafletMap = this.get('_leafletObject');

      let e = {
        queryFilter: queryFilter,
        mapObjectSetting: mapObjectSetting,
        results: Ember.A(),
        serviceLayer: serviceLayer
      };

      // Show map loader
      leafletMap.setLoaderContent(this.get('i18n').t('components.flexberry-map.queryText'));
      leafletMap.showLoader();

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

      // Wait for all promises to be settled & call '_finishIdentification' hook.
      Ember.RSVP.allSettled(promises).then(() => {
        this._finishQuery(e);
      });
    },

    /**
      Finishes query.

      @method _finishQuery
      @param {Object} e Event object.
      @param {Object[]} results Objects describing query results.
      Every result-object has the following structure: { layer: ..., features: [...] },
      where 'layer' is metadata of layer related to query result, features is array
      containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects].
      @return {<a href="http://leafletjs.com/reference.html#popup">L.Popup</a>} Popup containing identification results.
      @private
    */
    _finishQuery(e) {
      let leafletMap = this.get('_leafletObject');

      e.results.forEach((identificationResult) => {
        identificationResult.features.then(
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
      leafletMap.setLoaderContent('');
      leafletMap.hideLoader();

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
    _localeDidChange: Ember.observer('i18n.locale', function() {
      let i18n = this.get('i18n');

      if (this.get('zoomControl')) {
        let $leafletContainer = this.get('_$leafletContainer');
        let $zoomControl = $leafletContainer.find('.leaflet-control-container .leaflet-control-zoom');
        let $zoomInButton = $zoomControl.find('.leaflet-control-zoom-in');
        let $zoomOutButton = $zoomControl.find('.leaflet-control-zoom-out');

        $zoomInButton.attr('title', i18n.t('components.flexberry-map.zoom-control.zoom-in-button.title'));
        $zoomOutButton.attr('title', i18n.t('components.flexberry-map.zoom-control.zoom-out-button.title'));
      }
    }),

    /**
      Handles leaflet map container's resize.

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

      let $leafletContainer = this.$();
      this.set('_$leafletContainer', $leafletContainer);

      // Initialize leaflet map.
      let leafletMap = L.map($leafletContainer[0], this.get('options'));
      this.set('_leafletObject', leafletMap);

      this._injectMapLoaderMethods(leafletMap);
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
      $leafletContainer.resize(onLeafletContainerResize);

      this.sendAction('leafletInit', {
        map: leafletMap
      });

      let serviceLayer = L.featureGroup();
      leafletMap.addLayer(serviceLayer);
      this.set('serviceLayer', serviceLayer);
      this.sendAction('serviceLayerInit', serviceLayer);

      let queryFilter = this.get('queryFilter');
      let mapObjectSetting = this.get('mapObjectSetting');

      if (!Ember.isBlank(queryFilter)) {
        Ember.run.scheduleOnce('afterRender', this, function () {
          this._runQuery(queryFilter, mapObjectSetting);
        });
      }

      Ember.run.scheduleOnce('afterRender', this, '_localeDidChange');
    },

    /**
      Destroys DOM-related component's properties.
    */
    willDestroyElement() {
      this._super(...arguments);

      let leafletMap = this.get('_leafletObject');
      if (!Ember.isNone(leafletMap)) {
        // Destroy leaflet map.
        this._removeMapLoaderMethods(leafletMap);
        leafletMap.off('moveend', this._moveend, this);
        leafletMap.off('zoomend', this._zoomend, this);

        // Unbind map container's resize event handler.
        let $leafletContainer = this.get('_$leafletContainer');
        let onLeafletContainerResize = this.get('_onLeafletContainerResize');
        if (!Ember.isNone($leafletContainer) && !Ember.isNone(onLeafletContainerResize)) {
          $leafletContainer.removeResize(onLeafletContainerResize);
          this.set('_onLeafletContainerResize', null);
        }

        leafletMap.remove();
        this.set('_leafletObject', null);
        this.set('_$leafletContainer', null);

        this.sendAction('leafletDestroy');
      }
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
      Component's action invoking when query on map load finished.

      @method sendingActions.queryFinished
      @param {Object} e Query result object.
    */

    actions: {
      /**
        Handles edit dialog's 'approve' action.
        Invokes component's {{#crossLink "FlexberryMaplayerComponent/sendingActions.add:method"}}'edit'{{/crossLink}} action.

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
