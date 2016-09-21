/**
  @module ember-flexberry-gis
*/

import MeasureMaptool from './measure';

/**
  MeasureCoordinatesMaptool map tool.

  @class MeasureMaptool
  @extends BaseMaptool
*/
export default MeasureMaptool.extend({
  /**
    Enables tool.

    @method enable
  */
  enable() {
    this._super(...arguments);

    let i18n = this.get('i18n');
    this._measure.markerBaseTool.popupText.move = i18n.t('components.flexberry-measuretool.marker.move').toString();
    this._measure.markerBaseTool.popupText.drag = i18n.t('components.flexberry-measuretool.marker.drag').toString();
    this._measure.markerBaseTool.basePopupText.labelPrefix = i18n.t('components.flexberry-measuretool.marker.labelPrefix').toString();
    this._measure.markerBaseTool.basePopupText.labelPostfix = i18n.t('components.flexberry-measuretool.marker.labelPostfix').toString();
    this._measure.markerBaseTool.basePopupText.northLatitude = i18n.t('components.flexberry-measuretool.marker.northLatitude').toString();
    this._measure.markerBaseTool.basePopupText.southLatitude = i18n.t('components.flexberry-measuretool.marker.southLatitude').toString();
    this._measure.markerBaseTool.basePopupText.eastLongitude = i18n.t('components.flexberry-measuretool.marker.eastLongitude').toString();
    this._measure.markerBaseTool.basePopupText.westLongitude = i18n.t('components.flexberry-measuretool.marker.westLongitude').toString();

    this._measure.markerBaseTool.startMeasure();
  }
});
