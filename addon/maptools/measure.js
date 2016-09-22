/**
  @module ember-flexberry-gis
*/

import BaseMaptool from './base';

/**
  Measure map tool.

  @class MeasureMaptool
  @extends BaseMaptool
*/
export default BaseMaptool.extend({
  /**
    Measure related layer.

    @property _layer
    @type <a href="http://leafletjs.com/reference-1.0.0.html#layer">L.Layer</a>
    @default null
    @private
  */
  _layer: null,

  /**
    Leaflet measure tool.

    @property _measure
    @type Object
    @default null
    @private
  */
  _measure: null,

  /**
    Flag: indicates whether tool is multitool.

    @property multitool
    @type Boolean
    @default true
  */
  multitool: true,

  /**
    Destroys performed measurements.

    @method _destroyMeasurements
    @private
  */
  _destroyMeasurements() {
    this._layer.disableEdit();
    this.get('map').off('measure:created', this._onMeasureCreated, this);
    this._layer.remove();
  },

  /**
    Handles map's 'measure:created' event.

    @method _onMeasureCreated
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#layer">L.Layer</a>} Created measure-related layer.
    @private
  */
  _onMeasureCreated(e) {
    this._layer = e.layer;

    let leafletMap = this.get('map');
    leafletMap.off('measure:created', this._onMeasureCreated, this);
  },

  /**
    Enables tool.

    @method enable
  */
  enable() {
    this._super(...arguments);

    let leafletMap = this.get('map');
    leafletMap.dragging.enable();

    this._measure = leafletMap.measureTools ? leafletMap.measureTools : L.measureBase(leafletMap);
    leafletMap.on('measure:created', this._onMeasureCreated, this);
  },

  /**
    Disables tool.

    @method disable
  */
  disable() {
    this._super(...arguments);

    let leafletMap = this.get('map');
    leafletMap.dragging.disable();

    leafletMap.editTools.stopDrawing();
    this._destroyMeasurements();
    this._layer = null;
    this._measure = null;
  }
});
