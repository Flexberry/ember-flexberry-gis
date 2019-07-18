/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Mixin containing handlers for
  {{#crossLink "FlexberryIdentifyPanelComponent"}}flexberry-identify-panel component's{{/crossLink}} actions.

  @class FlexberryIdentifyPanelActionsHandlerMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({

  /**
    Parameter contains current map identification layer option (all, visible, top etc.).

    @property identifyLayersOption
    @type String
    @default ''
  */
  identifyLayersOption: 'visible',

  /**
    Parameter contains current map identification tool option (arrow, square, polygon etc.).

    @property identifyToolOption
    @type String
    @default 'marker'
  */
  identifyToolOption: 'marker',

  /**
    Leaflet layer group for temporal identification resulting layers.

    @property identifyServiceLayer
    @type <a href="http://leafletjs.com/reference-1.2.0.html#layergroup">L.LayerGroup</a>
    @default null
  */
  identifyServiceLayer: null,

  /**
    Leaflet layer group for temporal polygon layers.

    @property polygonLayer
    @type <a href="http://leafletjs.com/reference-1.2.0.html#layergroup">L.LayerGroup</a>
    @default null
  */
  polygonLayer: null,

  /**
    Main polygon around which the buffer is drawn

    @property bufferedMainPolygonLayer
    @type {<a href="http://leafletjs.com/reference.html#polygon">L.Polygon</a>}
    @default null
  */
  bufferedMainPolygonLayer: null,

  /**
    Flag indicates is buffer active

    @property bufferActive
    @type Boolean
    @default false
  */
  bufferActive: false,

  /**
    Buffer radius units

    @property bufferUnits
     @type String
    @default 'kilometers'
  */
  bufferUnits: 'kilometers',

  /**
    Buffer radius in selected units

     @property bufferRadius
     @type Number
    @default 0
  */
  bufferRadius: 0,

  actions: {

    /**
      Handles 'flexberry-identify-panel:onBufferSet' event of leaflet map.

      @method onBufferSet
      @param {Object} bufferParameters all bufffer parameters.
    */
    onBufferSet(bufferParameters) {
      this.set('bufferActive', bufferParameters.active);
      this.set('bufferUnits', bufferParameters.units);
      this.set('bufferRadius', bufferParameters.radius);
    },

    /**
      Handles 'flexberry-identify-panel:identificationFinished' event of leaflet map.

      @method identificationFinished
      @param {Object} e Event object.
      @param {Object} results Hash containing search results.
      @param {Object[]} results.features Array containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
      or a promise returning such array.
    */
    onIdentificationFinished(e) {
      let serviceLayer = this.get('serviceLayer');
      if (!serviceLayer) {
        let leafletMap = this.get('leafletMap');
        this.set('serviceLayer', L.featureGroup().addTo(leafletMap));
      } else {
        serviceLayer.clearLayers();
      }

      this.set('polygonLayer', e.polygonLayer);
      this.set('bufferedMainPolygonLayer', e.bufferedMainPolygonLayer);
      this.set('identifyResults', e.results);

      // Below is kind of madness, but if you want sidebar to move on identification finish - do that.
      if (this.get('sidebar.2.active') !== true) {
        this.set('sidebar.2.active', true);
      }

      if (!this.get('sidebarOpened')) {
        this.send('toggleSidebar', {
          changed: false,
          tabName: 'identify'
        });
      }
    },

    /**
      Clears identification results.

      @method actions.clearSearch
    */
    clearIdentification() {
      this.set('identifyResults', null);

      let serviceLayer = this.get('serviceLayer');
      if (serviceLayer) {
        serviceLayer.clearLayers();
      }

      let polygonLayer = this.get('polygonLayer');
      if (polygonLayer) {
        polygonLayer.disableEdit();
        polygonLayer.remove();
      }

      let bufferedMainPolygon = this.get('bufferedMainPolygonLayer');
      if (bufferedMainPolygon) {
        bufferedMainPolygon.remove();
      }

    }
  }
});
