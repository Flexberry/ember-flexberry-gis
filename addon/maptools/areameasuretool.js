import MeasureTool from 'ember-flexberry-gis/maptools/measuretool';

export default MeasureTool.extend({

  enable() {
    this._super(...arguments);
    this._measure.polygonBaseTool.startMeasure();
  }

});
