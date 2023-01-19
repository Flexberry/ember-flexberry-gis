/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseNonclickableMapTool from './base-nonclickable';
import * as buffer from 'npm:@turf/buffer';

/**
  Identify map-tool.

  @class IdentifyMapTool
  @extends BaseNonclickableMapTool
*/
export default BaseNonclickableMapTool.extend({
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

  /**
    Map layers hierarchy.

    @property layers
    @type Object[]
    @default null
  */
  layers: null,

  /**
    Tool's polygon area layer.

    @property polygonLayer
    @type {<a href="http://leafletjs.com/reference.html#polygon">L.Polygon</a>}
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
    Flag: indicates whether to hide figure on drawing end or not.

    @property hideOnDrawingEnd
    @type Boolean
    @default false
  */
  hideOnDrawingEnd: true,

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
  _getLayersToIdentify({ excludedLayers }) {
    Ember.assert('Method \'_getLayersToIdentify\' must be overridden in some extended identify map-tool.', false);
  },

  /**
    Starts identification by array of satisfying layers inside given polygon area.

    @method _startIdentification
    @param {Object} options Method options.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the polygon layer.
    @param {<a href="http://leafletjs.com/reference.html#polygon">L.Polygon</a>} options.polygonLayer Polygon layer related to given area.
    @param {Object[]} options.excludedLayers Layers excluded from identification.
    @private
  */
  _startIdentification({
    polygonLayer,
    bufferedMainPolygonLayer,
    latlng,
    excludedLayers
  }) {
    let leafletMap = this.get('leafletMap');

    let e = {
      latlng: latlng,
      polygonLayer: polygonLayer,
      bufferedMainPolygonLayer: bufferedMainPolygonLayer,
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
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the polygon layer.
    @param {<a href="http://leafletjs.com/reference.html#polygon">L.Polygon</a>} options.polygonLayer Polygon layer related to given vertices.
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
    let leafletMap = this.get('leafletMap');
    leafletMap.flexberryMap.loader.hide({ content: '' });

    // Assign current tool's boundingBoxLayer
    let polygonLayer = Ember.get(e, 'polygonLayer');
    this.set('polygonLayer', polygonLayer);

    // Assign current tool's boundingBoxLayer
    let bufferedLayer = Ember.get(e, 'bufferedMainPolygonLayer');
    this.set('bufferedMainPolygonLayer', bufferedLayer);

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
  _drawingDidEnd({ layer }) {
    let workingPolygon;
    let bufferedMainPolygon;
    let isBufferActive = this.get('bufferActive');
    let bufferRadius = this.get('bufferRadius');

    if (isBufferActive && bufferRadius > 0) {
      let buffer = this._drawBuffer(layer.toGeoJSON());
      workingPolygon = buffer.getLayers()[0];
      bufferedMainPolygon = layer;
    } else {
      workingPolygon = layer;
    }

    let latlng;
    let boundingBox;
    let workingPolygonType = workingPolygon.toGeoJSON().geometry.type;

    if (workingPolygonType !== 'Point') {
      latlng = workingPolygon.getCenter();
      boundingBox = workingPolygon.getBounds();
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
        workingPolygon.setLatLngs([boundingBox.getNorthWest(), boundingBox.getNorthEast(), boundingBox.getSouthEast(), boundingBox.getSouthWest()]);
      }
    } else {
      latlng = workingPolygon._latLngs;
    }

    // Remove previously drawn rectangle
    if (this.get('hidePreviousOnDrawingEnd')) {
      this._clearPolygonLayer();
    }

    this._baseDrawingDidEnd(workingPolygon, bufferedMainPolygon, latlng);
    this._additionalDrawingDidEnd(layer);
  },

  _baseDrawingDidEnd(workingPolygon, bufferedMainPolygon, latlng) {
    // Show map loader.
    let leafletMap = this.get('leafletMap');
    leafletMap.flexberryMap.loader.show({ content: this.get('i18n').t('map-tools.identify.loader-message') });

    // Start identification.
    this._startIdentification({
      polygonLayer: workingPolygon,
      bufferedMainPolygonLayer: bufferedMainPolygon,
      latlng: latlng
    });
  },

  _additionalDrawingDidEnd() {},

  /**
    Draw buffer around selected area

    @method _drawBuffer
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#polygon">L.Polygon</a>} layer Leaflet polygon layer
    @private
  */
  _drawBuffer(layer) {
    let radius = this.get('bufferRadius');
    let units = this.get('bufferUnits');

    let buf = buffer.default(layer, radius, { units: units });
    let leafletMap = this.get('leafletMap');
    let _bufferLayer = L.geoJSON(buf).addTo(leafletMap);
    return _bufferLayer;
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
    this._clearPolygonLayer();
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

    @method _clearPolygonLayer
    @private
  */
  _clearPolygonLayer() {
    // Remove already drawn figure.
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
});
