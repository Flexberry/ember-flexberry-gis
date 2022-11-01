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
    leafletMap.on('flexberry-map-loadfile:identification', this._identificationLayer, this);
  },

  _disable() {
    this._super(...arguments);

    let editTools = this.get('_editTools');
    if (!Ember.isNone(editTools)) {
      this.leafletMap.off('flexberry-map-loadfile:render', this._renderLayer, this);
      this.leafletMap.off('flexberry-map-loadfile:identification', this._identificationLayer, this);
    }

    this._clear();
  },

  _clear() {
    if (this.get('layer')) {
      this.leafletMap.removeLayer(this.get('layer'));
    }

    if (this.get('_bufferLayer')) {
      this.leafletMap.removeLayer(this.get('_bufferLayer'));
    }
  },

  _renderLayer({ layer }) {
    this._clear();

    let buf = buffer.default(layer.toGeoJSON(), this.get('bufferRadius') || 0, { units: this.get('bufferUnits') });
    let _bufferLayer = L.geoJSON(buf).addTo(this.leafletMap);
    _bufferLayer.addLayer(layer);
    this.set('layer', layer);
    this.set('_bufferLayer', _bufferLayer);

  },

  _identificationLayer({ layer }) {
    let buf = buffer.default(layer.toGeoJSON(), this.get('bufferRadius') || 0, { units: this.get('bufferUnits') });
    let _bufferLayer = L.geoJSON(buf);

    let e = {
      latlng: layer._bounds._northEast,
      polygonLayer: layer,
      bufferedMainPolygonLayer: _bufferLayer,
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
    Ember.RSVP.allSettled(promises).then(() => {
      this._finishIdentification(e);
    });
  }
});
