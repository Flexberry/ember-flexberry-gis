/**
  @module ember-flexberry-gis
*/

import MeasureMaptool from './measure';

/**
  MeasureDistanceMaptool map tool.

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
    this._measure.polylineBaseTool.popupText.move = i18n.t('components.flexberry-measuretool.polyline.move').toString();
    this._measure.polylineBaseTool.popupText.add = i18n.t('components.flexberry-measuretool.polyline.add').toString();
    this._measure.polylineBaseTool.popupText.commit = i18n.t('components.flexberry-measuretool.polyline.commit').toString();
    this._measure.polylineBaseTool.popupText.drag = i18n.t('components.flexberry-measuretool.polyline.move').toString();
    this._measure.polylineBaseTool.basePopupText.distanceLabelPrefix = i18n.t('components.flexberry-measuretool.polyline.distanceLabelPrefix').toString();
    this._measure.polylineBaseTool.basePopupText.distanceLabelPostfix = i18n.t('components.flexberry-measuretool.polyline.distanceLabelPostfix').toString();
    this._measure.polylineBaseTool.basePopupText.incLabelPrefix = i18n.t('components.flexberry-measuretool.polyline.incLabelPrefix').toString();
    this._measure.polylineBaseTool.basePopupText.incLabelPostfix = i18n.t('components.flexberry-measuretool.polyline.incLabelPostfix').toString();
    this._measure.polylineBaseTool.distanceMeasureUnit.kilometer =i18n.t('components.flexberry-measuretool.distanceMeasureUnit.kilometer').toString();
    this._measure.polylineBaseTool.distanceMeasureUnit.meter = i18n.t('components.flexberry-measuretool.distanceMeasureUnit.meter').toString();

    this._measure.polylineBaseTool.startMeasure();
  }

});
