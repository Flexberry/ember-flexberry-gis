/**
  @module ember-flexberry-gis
*/

import MeasureMapTool from './measure';

/**
  Measure coordinates map-tool.

  @class MeasureCoordinatesMapTool
  @extends MeasureMapTool
*/
export default MeasureMapTool.extend({
  /**
    Tool's coordinate reference system (CRS).

    @property crs
    @type <a href="http://leafletjs.com/reference-1.0.0.html#crs">L.CRS</a>
    @default null
  */
  crs: null,

  /**
    Coordinates tool's captions

    @property captions
    @type {Object}
    @default null
    @example ```javascript
    {
      northLatitude: ' с.ш. ',
      southLatitude: ' ю.ш. ',
      eastLongitude: ' в.д. ',
      westLongitude: ' з.д. ',
      x: 'X: ',
      y: 'Y: '
    }
    ```
  */
  captions: null,

  /**
    Coordinates tool's results precision

    @property precision
    @type Number
    @default null
  */
  precision: null,

  /**
    Flag: indicates whether to display coordinates instead of LatLng's

    @property displayCoordinates
    @default false
    @type Boolean
  */
  displayCoordinates: false,

  /**
    Enables tool.

    @method _enable
    @private
  */
  _enable() {
    this._super(...arguments);
    let crs = this.get('crs');
    let captions = this.get('captions');
    let precision = this.get('precision');
    let displayCoordinates = this.get('displayCoordinates');

    this.get('_measureTools').markerBaseTool.startMeasure({
      crs: crs,
      precision: precision,
      captions: captions,
      displayCoordinates: displayCoordinates
    });
  }
});
