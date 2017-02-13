/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import LeafletOptionsMixin from '../mixins/leaflet-options';
import LeafletPropertiesMixin from '../mixins/leaflet-properties';
import LeafletEventsMixin from '../mixins/leaflet-events';

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
  LeafletPropertiesMixin,
  LeafletEventsMixin, {
    /**
      Leaflet map.

      @property _leafletObject
      @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
      @default null
      @private
    */
    _leafletObject: null,

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
      List of leaflet map events which will be sended outside as component's actions.
    */
    leafletEvents: [
      'click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout',
      'mousemove', 'contextmenu', 'focus', 'blur', 'preclick', 'load',
      'unload', 'viewreset', 'movestart', 'move', 'moveend', 'dragstart',
      'drag', 'dragend', 'zoomstart', 'zoomend', 'zoomlevelschange',
      'resize', 'autopanstart', 'layeradd', 'layerremove',
      'baselayerchange', 'overlayadd', 'overlayremove', 'locationfound',
      'locationerror', 'popupopen', 'popupclose'
    ],

    /**
      List of leaflet map options which will be passed into leaflet map.
    */
    leafletOptions: [

      // Map state options.
      'center', 'zoom', 'minZoom', 'maxZoom', 'maxBounds', 'crs',

      // Interaction options.
      'dragging', 'touchZoom', 'scrollWheelZoom', 'doubleClickZoom', 'boxZoom',
      'tap', 'tapTolerance', 'trackResize', 'worldCopyJump', 'closePopupOnClick',
      'bounceAtZoomLimits',

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
      Array of map layers.

      @property layers
      @type Array of NewPlatformFlexberryGISMapLayer
    */
    layers: null,

    /**
      Layer links object thats use for query data on map load

      @property layerLinks
      @type Ember.Array
      @default null
    */
    layerLinks: null,

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
      let $mapLoader = this.$(`.${flexberryClassNames.loader}`);

      // Sets map loader's content.
      leafletMap.setLoaderContent = (content) => {
        $mapLoader.text(content);
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

    /**
      Initializes DOM-related component's properties.
    */
    didInsertElement() {
      this._super(...arguments);

      // Initialize leaflet map.
      let leafletMap = L.map(this.$()[0], this.get('options'));
      this._injectMapLoaderMethods(leafletMap);

      this.set('_leafletObject', leafletMap);

      this._addObservers();
      this._addEventListeners();

      this.sendAction('leafletInit', {
        map: leafletMap
      });

      let serviceLayer = L.featureGroup();
      leafletMap.addLayer(serviceLayer);
      this.set('serviceLayer', serviceLayer);

      let layerLinks = this.get('layerLinks');
      let queryFilter = this.get('queryFilter');

      if (!Ember.isNone(layerLinks) && !Ember.isNone(queryFilter)) {
        Ember.run.scheduleOnce('afterRender', this, function () {
          let e = {
            layerLinks,
            queryFilter,
            results: Ember.A()
          };

          // Show map loader
          leafletMap.setLoaderContent(this.get('i18n').t('components.flexberry-map.queryText'));
          leafletMap.showLoader();

          leafletMap.fire('flexberry-map:query', e);

          Ember.RSVP.all(e.results).then(results => {
            results.forEach(result => {
              serviceLayer.addLayer(result);
            });

            let queryBounds = serviceLayer.getBounds();
            if (queryBounds.isValid()) {
              leafletMap.fitBounds(queryBounds);
            } else {

              // Should alert user about not found objects
              Ember.Logger.warn('Object not found for query', layerLinks, queryFilter);
            }

            // Hide map loader.
            leafletMap.setLoaderContent('');
            leafletMap.hideLoader();
          });
        });
      }
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
        leafletMap.remove();
        this.set('_leafletObject', null);

        this.sendAction('leafletDestroy');
      }
    }

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
  }
);

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryMapComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryMapComponent;
