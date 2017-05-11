/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseMapTool from './base';

/**
  Identify map-tool.

  @class IdentifyMapTool
  @extends BaseMapTool
*/
export default BaseMapTool.extend({
  /**
    Leaflet.Editable drawing tools instance.

    @property _editTools
    @type <a href="http://leaflet.github.io/Leaflet.Editable/doc/api.html">L.Ediatble</a>
    @default null
    @private
  */
  _editTools: null,

  /**
    Tool's cursor CSS-class.

    @property cursor
    @type String
    @default 'help'
  */
  cursor: 'help',

  /**
    Flag: indicates whether to hide figure on drawing end or not.

    @property hideOnDrawingEnd
    @type Boolean
    @default false
  */
  hideOnDrawingEnd: false,

  /**
    Flag: indicates whether to hide previously drawn figure on drawing end or not.

    @property hidePreviousOnDrawingEnd
    @type Boolean
    @default true
  */
  hidePreviousOnDrawingEnd: true,

  /**
    Method to prepare identify result if need.

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
    Starts identification by array of satisfying layers inside given polygon area.

    @method _startIdentification
    @param {Object} options Method options.
    @param {Array} options.polygonVertices Polygon vertices of type <a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the polygon layer.
    @param {<a href="http://leafletjs.com/reference.html#polygon">L.Polygon</a>} options.relatedLayer Polygon layer related to given vertices.
    @param {Object[]} options.excludedLayers Layers excluded from identification.
    @private
  */
  _startIdentification({
    polygonVertices,
    latlng,
    relatedLayer,
    excludedLayers
  }) {
    let leafletMap = this.get('leafletMap');

    let e = {
      polygonVertices: polygonVertices,
      latlng: latlng,
      relatedLayer: relatedLayer,
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
    @param {Array} options.polygonVertices Polygon vertices of type <a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the polygon layer.
    @param {<a href="http://leafletjs.com/reference.html#polygon">L.Polygon</a>} options.relatedLayer Polygon layer related to given vertices.
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
    let boundingBoxLayer = Ember.get(e, 'relatedLayer');
    this.set('boundingBoxLayer', boundingBoxLayer);

    // Fire custom event on leaflet map.
    leafletMap.fire('flexberry-map:identificationFinished', e);
  },

  /**
    Handles map's 'editable:drawing:end' event.

    @method _drawingDidEnd
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#polygon">L.Polygon</a>} e.layer Drawn polygon layer.
    @private
  */
  _drawingDidEnd({
    layer
  }) {
    let latlng = layer.getCenter();
    let polygonVertices = layer._latlngs[0];
    let boundingBox = layer.getBounds();
    if (boundingBox.getSouthWest().equals(boundingBox.getNorthEast())) {
      // Identification area is point.
      // Identification can be incorrect or even failed in such situation,
      // so extend identification area a little (around specified point).
      let leafletMap = this.get('leafletMap');
      let y = leafletMap.getSize().y / 2;
      let a = leafletMap.containerPointToLatLng([0, y]);
      let b = leafletMap.containerPointToLatLng([100, y]);

      // Current scale (related to current zoom level).
      let maxMeters = leafletMap.distance(a, b);

      // Bounding box around specified point with radius of current scale * 0.05.
      boundingBox = boundingBox.getSouthWest().toBounds(maxMeters * 0.05);
      polygonVertices = [boundingBox.getNorthWest(), boundingBox.getNorthEast(), boundingBox.getSouthEast(), boundingBox.getSouthWest()];
    }

    // Remove previously drawn rectangle
    if (this.get('hidePreviousOnDrawingEnd')) {
      this._clearBoundingBox();
    }

    // Show map loader.
    let i18n = this.get('i18n');
    let leafletMap = this.get('leafletMap');
    leafletMap.setLoaderContent(i18n.t('map-tools.identify.loader-message'));
    leafletMap.showLoader();

    // Start identification.
    this._startIdentification({
      relatedLayer: layer,
      polygonVertices: polygonVertices,
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
    let leafletMap = this.get('leafletMap');
    let editTools = this.get('_editTools');
    if (Ember.isNone(editTools)) {
      editTools = new L.Editable(leafletMap, {
        drawingCursor: this.get('cursor')
      });
      this.set('_editTools', editTools);
    }

    editTools.on('editable:drawing:end', this._drawingDidEnd, this);
  },

  /**
    Disables tool.

    @method _disable
    @private
  */
  _disable() {
    this._clearBoundingBox();
    this._super(...arguments);

    let editTools = this.get('_editTools');
    if (!Ember.isNone(editTools)) {
      editTools.off('editable:drawing:end', this._drawingDidEnd, this);
      editTools.stopDrawing();
    }
  },

  /**
    Destroys map-tool.
  */
  willDestroy() {
    this._super(...arguments);

    let editLayer = this.get('_editTools.editLayer');
    if (!Ember.isNone(editLayer)) {
      editLayer.clearLayers();
      editLayer.remove();
    }

    let featuresLayer = this.get('_editTools.featuresLayer');
    if (!Ember.isNone(featuresLayer)) {
      featuresLayer.clearLayers();
      featuresLayer.remove();
    }

    this.set('_editTools', null);
  },

  /**
    Remove already drawn figure

    @method _clearBoundingBox
    @private
  */
  _clearBoundingBox() {
    // Remove already drawn figure
    let boundingBoxLayer = this.get('boundingBoxLayer');
    if (boundingBoxLayer) {
      boundingBoxLayer.disableEdit();
      boundingBoxLayer.remove();
    }
  }
});
