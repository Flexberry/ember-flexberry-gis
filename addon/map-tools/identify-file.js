/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import IdentifyMapTool from './identify';
import * as buffer from 'npm:@turf/buffer';
/**
  File identify map-tool.

  @class FileIdentifyMapTool
  @extends IdentifyMapTool
*/
export default IdentifyMapTool.extend({
  /**
    Enables tool.

    @method _enable
    @private
  */

  layer: null,
  _bufferLayer: null,
  cursor: 'default',

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

    leafletMap.on('flexberry-map-loadfile:render', this._renderLayer, this);
    leafletMap.on('flexberry-map-loadfile:clear', this._clear, this);
    leafletMap.on('flexberry-map-loadfile:identification', this._identificationLayer, this);
  },

  _enableDraw() {},

  _disable() {
    this._super(...arguments);

    let editTools = this.get('_editTools');
    if (!Ember.isNone(editTools)) {
      this.leafletMap.off('flexberry-map-loadfile:render', this._renderLayer, this);
      this.leafletMap.off('flexberry-map-loadfile:clear', this._clear, this);
      this.leafletMap.off('flexberry-map-loadfile:identification', this._identificationLayer, this);
    }

    if (this.get('clearOnDisable')) {
      this._clear();
    }
  },

  _disableDraw() {},

  _clear() {
    if (this.get('layer')) {
      this.leafletMap.removeLayer(this.get('layer'));
    }

    if (this.get('_bufferLayer')) {
      this.leafletMap.removeLayer(this.get('_bufferLayer'));
    }
  },

  bufferObserver: Ember.observer('bufferActive', 'bufferRadius', 'bufferUnits', function () {
    Ember.run.debounce(this, () => {
      let layer = this.get('layer');
      if (!Ember.isNone(layer) && this.leafletMap.hasLayer(layer)) {
        this._renderLayer({ layer }, false);
      }
    }, 500);
  }),

  _renderLayer({ layer }, fit = true) {
    this._clear();

    let isBufferActive = this.get('bufferActive');
    let bufferRadius = this.get('bufferRadius');
    let bufferUnits = this.get('bufferUnits');

    let drawLayer = this.get('drawLayer');

    let _bufferLayer;
    if (isBufferActive && bufferRadius > 0) {
      let buf = buffer.default(layer.toGeoJSON(), bufferRadius, { units: bufferUnits });
      _bufferLayer = L.geoJSON(buf);

      _bufferLayer.addTo(drawLayer ? drawLayer : this.leafletMap);
    }

    layer.addTo(drawLayer ? drawLayer : this.leafletMap);

    if (fit) {
      this.leafletMap.fitBounds(layer.getBounds());
    }

    this.set('layer', layer);
    this.set('_bufferLayer', _bufferLayer);
  },

  _identificationLayer({ layer }) {
    let workingLayer;
    let isBufferActive = this.get('bufferActive');
    let bufferRadius = this.get('bufferRadius');

    if (isBufferActive && bufferRadius > 0) {
      let buf = buffer.default(layer.toGeoJSON(), bufferRadius, { units: this.get('bufferUnits') });
      workingLayer = L.geoJSON(buf).getLayers()[0];
    } else {
      workingLayer = layer;
    }

    let e = {
      polygonLayer: workingLayer,
      excludedLayers: Ember.A([]),
      layers: this._getLayersToIdentify({
        excludedLayers: []
      }),
      results: Ember.A()
    };

    this.leafletMap.fire('flexberry-map:identify', e);

    e.results = Ember.isArray(e.results) ? e.results : Ember.A();
    let promises = Ember.A();
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

    this.leafletMap.flexberryMap.loader.show({ content: this.get('i18n').t('map-tools.identify.loader-message') });
    Ember.RSVP.allSettled(promises).then(() => {
      this._finishIdentification(e);
    });
  }
});
