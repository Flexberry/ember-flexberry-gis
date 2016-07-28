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
 */
export default Ember.Component.extend(
  LeafletOptionsMixin,
  LeafletPropertiesMixin,
  LeafletEventsMixin,
  {
    layout,

    /**
      Model with map properties and layers.
      @property model
      @type NewPlatformFlexberryGISMap
      @default null
     */
    model: null,

    /**
      DOM element containig leaflet map.
      @property mapElement
      @type Element
      @default null
     */
    mapElement: null,

    leafletEvents: ['moveend'],

    leafletOptions: ['zoomControl'],

    leafletProperties: ['zoom:setZoom', 'center:panTo:zoomPanOptions', 'maxBounds:setMaxBounds', 'bounds:fitBounds:fitBoundsOptions'],

    /**
      Center of current map.
      @property center
      @type L.LatLng
     */
    center: Ember.computed('model.lat', 'model.lng', function () {
      return L.latLng(this.get('model.lat') || 0, this.get('model.lng') || 0);
    }),

    /**
      Current map zoom.
      @property zoom
      @type Int
     */
    zoom: Ember.computed('model.zoom', function () {
      return this.get('model.zoom');
    }),

    /**
      Leaflet map object.
      @property _layer
      @type L.Map
      @default null
     */
    _layer: null,

    init() {
      this._super(...arguments);
      let mapElement = Ember.$("<div>")[0];
      this.set('mapElement', mapElement);
      let map = L.map(mapElement, this.get('options'));
      this.set('_layer', map);
      this._addObservers();
      this._addEventListeners();
    },

    didInsertElement() {
      this._super(...arguments);
      this.$().append(this.get('mapElement'));
      let map = this.get('_layer');
      map.setView(this.get('center'), this.get('zoom'));
    },

    willDestoryElement() {
      var leafletMap = this.get('_layer');
      if (leafletMap) {
        leafletMap.remove();
        this.set('_layer', null);
      }
    }
  });
