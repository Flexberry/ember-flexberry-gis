/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import RectangleMapTool from './rectangle';

/**
  Identify map-tool.

  @class IdentifyMapTool
  @extends RectangleMapTool
*/
export default RectangleMapTool.extend({
  /**
    Tool's cursor CSS-class.

    @property cursor
    @type String
    @default 'help'
  */
  cursor: 'help',

  /**
    Flag: indicates whether to hide rectangle on drawing end or not.

    @property hideRectangleOnDrawingEnd
    @type Boolean
    @default false
  */
  hideRectangleOnDrawingEnd: false,

  /**
    Flag: indicates whether to hide previously drawn rectangle on drawing end or not.

    @property hidePreviousRectangleOnDrawingEnd
    @type Boolean
    @default true
  */
  hidePreviousRectangleOnDrawingEnd: true,

  /**
    Method to prepare identify result if need

    @method prepareIdentifyResult
    @default null
  */
  prepareIdentifyResult: null,

  /**
    Returns flat array of layers satisfying to current identification mode.

    @method _getLayersToIdentify
    @param {Object} options Method options.
    @param {Object[]} options.excludedLayers Layers that must be excluded from identification.
    @returns {Object[]} Flat array of layers satisfying to current identification mode.
    @private
  */
  _getLayersToIdentify({
    excludedLayers
  }) {
    Ember.assert('Method \'_getLayersToIdentify\' must be overridden in some extended identify map-tool.', false);
  },

  /**
    Starts identification by array of satisfying layers inside given bounding box.

    @method _startIdentification
    @param {Object} options Method options.
    @param {<a href="http://leafletjs.com/reference.html#latlngbounds">L.LatLngBounds</a>} options.boundingBox Bounds of identification area.
    @param {<a href="http://leafletjs.com/reference.html#latlng">L.LatLng</a>} options.latlng Center of the bounding box.
    @param {<a href="http://leafletjs.com/reference.html#rectangle">L.Rectangle</a>} options.boundingBoxLayer Rectangle layer related to bounding box.
    @param {Object[]} options.excludedLayers Layers excluded from identification.
    @private
  */
  _startIdentification({
    boundingBox,
    latlng,
    boundingBoxLayer,
    excludedLayers
  }) {
    let leafletMap = this.get('leafletMap');

    let e = {
      boundingBox: boundingBox,
      latlng: latlng,
      boundingBoxLayer: boundingBoxLayer,
      excludedLayers: Ember.A(excludedLayers || []),
      layers: this._getLayersToIdentify({
        excludedLayers
      }),
      results: Ember.A()
    };

    // Fire custom event on leaflet map (if there is layers to identify).
    if (e.layers.length > 0) {
      leafletMap.fire('flexberry-map:identify', e);
    }

    // Promises array could be totally changed in 'flexberry-map:identify' event handlers, we should prevent possible errors.
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
      this._finishIdentification(e);
    });
  },

  /**
    Finishes identification.

    @method _finishIdentification
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlngbounds">L.LatLngBounds</a>} e.boundingBox Bounds of identification area.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the bounding box.
    @param {<a href="http://leafletjs.com/reference.html#rectangle">L.Rectangle</a>} options.boundingBoxLayer Rectangle layer related to bounding box.
    @param {Object[]} excludedLayers Objects describing those layers which were excluded from identification.
    @param {Object[]} layers Objects describing those layers which are identified.
    @param {Object[]} results Objects describing identification results.
    Every result-object has the following structure: { layer: ..., features: [...] },
    where 'layer' is metadata of layer related to identification result, features is array
    containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects].
    @return {<a href="http://leafletjs.com/reference.html#popup">L.Popup</a>} Popup containing identification results.
    @private
  */
  _finishIdentification(e) {
    e.results.forEach((identificationResult) => {
      identificationResult.features.then(
        (features) => {
          // Clear previous features & add new.
          // Leaflet clear's layers with some delay, add if we add again some cleared layer (immediately after clear),
          // it will be removed after delay (by layer's id),
          // so we will use timeout until better solution will be found.
          Ember.run(() => {
            setTimeout(() => {
              // Show new features.
              features.forEach((feature) => {
                let leafletLayer = Ember.get(feature, 'leafletLayer') || new L.GeoJSON([feature]);
                if (Ember.typeOf(leafletLayer.setStyle) === 'function') {
                  leafletLayer.setStyle({
                    color: 'salmon'
                  });
                }
                Ember.set(feature, 'leafletLayer', leafletLayer);
              });
            }, 10);
          });
        });
    });

    // Hide map loader.
    let leafletMap = this.get('leafletMap');
    leafletMap.setLoaderContent('');
    leafletMap.hideLoader();


    // Assign current tool's boundingBoxLayer
    let boundingBoxLayer = Ember.get(e, 'boundingBoxLayer');
    this.set('boundingBoxLayer', boundingBoxLayer);

    // Fire custom event on leaflet map.
    leafletMap.fire('flexberry-map:identificationFinished', e);
  },

  /**
    Handles map's 'editable:drawing:end' event.

    @method _rectangleDrawingDidEnd
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#rectangle">L.Rectangle</a>} e.layer Drawn rectangle layer.
    @private
  */
  _rectangleDrawingDidEnd({
    layer
  }) {
    // Get center & bbox before layer will be removed from map in super-method.
    let latlng = layer.getCenter();
    let boundingBox = layer.getBounds();
    if (boundingBox.getSouthWest().equals(boundingBox.getNorthEast())) {
      // Bounding box is point.
      // Identification can be incorrect or even failed in such situation,
      // so extend bounding box a little (around specified point).
      let leafletMap = this.get('leafletMap');
      let y = leafletMap.getSize().y / 2;
      let a = leafletMap.containerPointToLatLng([0, y]);
      let b = leafletMap.containerPointToLatLng([100, y]);

      // Current scale (related to current zoom level).
      let maxMeters = leafletMap.distance(a, b);

      // Bounding box around south west point with radius of current scale * 0.05.
      boundingBox = boundingBox.getSouthWest().toBounds(maxMeters * 0.05);
    }

    // Remove previously drawn rectangle
    if (this.get('hidePreviousRectangleOnDrawingEnd')) {
      this._clearBoundingBox();
    }

    // Call super method to remove drawn rectangle & start a new one.
    this._super(...arguments);

    // Show map loader.
    let i18n = this.get('i18n');
    let leafletMap = this.get('leafletMap');
    leafletMap.setLoaderContent(i18n.t('map-tools.identify.loader-message'));
    leafletMap.showLoader();

    // Start identification.
    this._startIdentification({
      boundingBoxLayer: layer,
      boundingBox: boundingBox,
      latlng: latlng
    });
  },

  /**
    Enables tool.

    @method _enable
    @private
  */
  _enable() {
    this._super(...arguments);
  },

  /**
    Disables tool.

    @method _disable
    @private
  */
  _disable() {
    this._clearBoundingBox();
    this._super(...arguments);
  },

  /**
    Remove already drawn rectangle

    @method _clearBoundingBox
    @private
  */
  _clearBoundingBox() {
    // Remove already drawn rectangle
    let boundingBoxLayer = this.get('boundingBoxLayer');
    if (boundingBoxLayer) {
      boundingBoxLayer.disableEdit();
      boundingBoxLayer.remove();
    }
  }
});
