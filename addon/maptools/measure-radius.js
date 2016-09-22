/**
  @module ember-flexberry-gis
*/

import MeasureMaptool from './measure';

/**
  MeasureRadiusMaptool map tool.

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
    this._measure.circleBaseTool.popupText.move = i18n.t('components.flexberry-measuretool.circle.move').toString();
    this._measure.circleBaseTool.popupText.drag = i18n.t('components.flexberry-measuretool.circle.drag').toString();
    this._measure.circleBaseTool.basePopupText.labelPrefix = i18n.t('components.flexberry-measuretool.circle.labelPrefix').toString();
    this._measure.circleBaseTool.basePopupText.labelPostfix = i18n.t('components.flexberry-measuretool.circle.labelPostfix').toString();
    this._measure.circleBaseTool.distanceMeasureUnit.kilometer = i18n.t('components.flexberry-measuretool.distanceMeasureUnit.kilometer').toString();
    this._measure.circleBaseTool.distanceMeasureUnit.meter = i18n.t('components.flexberry-measuretool.distanceMeasureUnit.meter').toString();

    this._measure.circleBaseTool.startMeasure();
  }

});
