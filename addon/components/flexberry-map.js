/**
  @module ember-flexberry-gis
 */

import Ember from 'ember';
import LeafletOptionsMixin from 'ember-flexberry-gis/mixins/leaflet-options';
import LeafletPropertiesMixin from 'ember-flexberry-gis/mixins/leaflet-properties';
import LeafletEventsMixin from 'ember-flexberry-gis/mixins/leaflet-events';

import layout from '../templates/components/flexberry-map';

/**
  FlexberryMap component for render leaflet map in ember applications.
  @class FlexberryMapComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses LeafletOptionsMixin
  @uses LeafletPropertiesMixin
  @uses LeafletEventsMixin
 */
export default Ember.Component.extend(
  LeafletOptionsMixin,
  LeafletPropertiesMixin,
  LeafletEventsMixin,
  {
    /**
      Leaflet map object.
      @property _layer
      @type L.Map
      @default null
      @private
     */
    _layer: null,

    layout,

    // Events this map can respond to.
    leafletEvents: [
      'click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout',
      'mousemove', 'contextmenu', 'focus', 'blur', 'preclick', 'load',
      'unload', 'viewreset', 'movestart', 'move', 'moveend', 'dragstart',
      'drag', 'dragend', 'zoomstart', 'zoomend', 'zoomlevelschange',
      'resize', 'autopanstart', 'layeradd', 'layerremove',
      'baselayerchange', 'overlayadd', 'overlayremove', 'locationfound',
      'locationerror', 'popupopen', 'popupclose'
    ],

    leafletOptions: [
      // Map state options
      'center', 'zoom', 'minZoom', 'maxZoom', 'maxBounds', 'crs',
      // Interaction options
      'dragging', 'touchZoom', 'scrollWheelZoom', 'doubleClickZoom', 'boxZoom',
      'tap', 'tapTolerance', 'trackResize', 'worldCopyJump', 'closePopupOnClick',
      'bounceAtZoomLimits',
      // Keyboard navigation options
      'keyboard', 'keyboardPanOffset', 'keyboardZoomOffset',
      // Panning Inertia Options
      'inertia', 'inertiaDeceleration', 'inertiaMaxSpeed', 'inertiaThreshold',
      // Control options
      'zoomControl', 'attributionControl',
      // Animation options
      'fadeAnimation', 'zoomAnimation', 'zoomAnimationThreshold', 'markerZoomAnimation'
    ],

    leafletProperties: ['zoom:setZoom', 'center:panTo:zoomPanOptions', 'maxBounds:setMaxBounds', 'bounds:fitBounds:fitBoundsOptions'],

    /**
      Latitude of map center
      @property lat
      @type numeric
      @default null
     */
    lat: null,

    /**
      Longitude of map center
      @property lng
      @type numeric
      @default null
     */
    lng: null,

    /**
      Center of current map.
      @property center
      @type L.LatLng
      @default [0, 0]
     */
    center: Ember.computed('lat', 'lng', function () {
      return L.latLng(this.get('lat') || 0, this.get('lng') || 0);
    }),

    /**
      Current map zoom.
      @property zoom
      @type Int
      @default null
     */
    zoom: null,

    /**
      Array of map layers
      @property layers
      @type Array of NewPlatformFlexberryGISMapLayer
     */
    layers: null,

    didInsertElement() {
      this._super(...arguments);

      let leafletMap = L.map(this.get('element'), this.get('options'));
      this.set('_layer', leafletMap);

      this._addObservers();
      this._addEventListeners();

      this.sendAction('leafletMapDidInit', leafletMap);
    },

    willDestoryElement() {
      let leafletMap = this.get('_layer');
      if (leafletMap) {
        leafletMap.remove();
        this.set('_layer', null);
      }
    }
  });
