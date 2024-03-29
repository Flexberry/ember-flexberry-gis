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
  clearOnDisable: false,

  /**
   * We need to differentiate events from different instances, because we don't turn off event subscriptions
   *
  */
  suffix: '',

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

    if (!Ember.isNone(leafletMap)) {
      leafletMap.off(`flexberry-map-loadfile${this.get('suffix')}:render`, this._renderLayer, this);
      leafletMap.off(`flexberry-map-loadfile${this.get('suffix')}:clear`, this._clear, this);
      leafletMap.off(`flexberry-map-loadfile${this.get('suffix')}:identification`, this._identificationLayer, this);

      leafletMap.on(`flexberry-map-loadfile${this.get('suffix')}:render`, this._renderLayer, this);
      leafletMap.on(`flexberry-map-loadfile${this.get('suffix')}:clear`, this._clear, this);
      leafletMap.on(`flexberry-map-loadfile${this.get('suffix')}:identification`, this._identificationLayer, this);
    }
  },

  _enableDraw() { },

  _disable() {
    this._super(...arguments);

    // не будем выключать подписку на события при деактивации инструмента, т.к. форма при этом остается доступной

    if (this.get('clearOnDisable')) {
      this._clear();
    }
  },

  willDestroy() {
    // сначала вызовем отключение подписок, поскольку в базовом методе очищается leafletMap
    if (!Ember.isNone(this.leafletMap)) {
      this.leafletMap.off(`flexberry-map-loadfile${this.get('suffix')}:render`, this._renderLayer, this);
      this.leafletMap.off(`flexberry-map-loadfile${this.get('suffix')}:clear`, this._clear, this);
      this.leafletMap.off(`flexberry-map-loadfile${this.get('suffix')}:identification`, this._identificationLayer, this);
    }

    this._super(...arguments);
  },

  _disableDraw() { },

  _clear() {
    let container = this.get('_container');

    if (this.get('layer')) {
      container.removeLayer(this.get('layer'));
    }

    if (this.get('_bufferLayer')) {
      container.removeLayer(this.get('_bufferLayer'));
    }
  },

  _redrawLayer() {
    Ember.run.debounce(this, () => {
      let layer = this.get('layer');
      let container = this.get('_container');
      if (!Ember.isNone(layer) && container.hasLayer(layer)) {
        this._renderLayer({ layer }, false);
      }
    }, 500);
  },

  bufferObserver: Ember.observer('bufferActive', 'bufferRadius', 'bufferUnits', function () {
    Ember.run.once(this, '_redrawLayer');
  }),

  _renderLayer({ layer }, fit = true) {
    this._clear();

    let isBufferActive = this.get('bufferActive');
    let bufferRadius = this.get('bufferRadius');
    let bufferUnits = this.get('bufferUnits');

    let container = this.get('_container');

    let _bufferLayer;
    if (isBufferActive && bufferRadius > 0) {
      let buf = buffer.default(layer.toGeoJSON(), bufferRadius, { units: bufferUnits });
      _bufferLayer = L.geoJSON(buf);

      _bufferLayer.addTo(container);
    }

    layer.addTo(container);

    if (fit) {
      this.leafletMap.fitBounds(layer.getBounds());
    }

    this.set('layer', layer);
    this.set('_bufferLayer', _bufferLayer);
  },

  _getWorkingLayer({ layer, geometryType }) {
    let isBufferActive = this.get('bufferActive');
    let bufferRadius = this.get('bufferRadius');
    let workingLayer;

    if (isBufferActive && bufferRadius > 0) {
      let buf = buffer.default(layer.toGeoJSON(), bufferRadius, { units: this.get('bufferUnits') });
      workingLayer = L.geoJSON(buf).getLayers()[0];
    } else {
      // добавим небольшой буфер, чтобы нивелировать недостаток точности (например, поиск точек по точкам)
      if (geometryType === 'point') {
        let buf = buffer.default(layer.toGeoJSON(), 1, { units: 'meters' });
        workingLayer = L.geoJSON(buf).getLayers()[0];
      } else {
        workingLayer = layer;
      }
    }

    return workingLayer;
  },

  _identificationLayer({ layer, geometryType }) {
    let workingLayer = this._getWorkingLayer({ layer, geometryType });

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
