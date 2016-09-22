/**
  @module ember-flexberry-gis
*/

import MeasureMaptool from './measure';

/**
  MeasureAreaMaptool map tool.

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
    this._measure.polygonBaseTool.popupText.move = i18n.t('components.flexberry-measuretool.polygon.move').toString();
    this._measure.polygonBaseTool.popupText.add = i18n.t('components.flexberry-measuretool.polygon.add').toString();
    this._measure.polygonBaseTool.popupText.commit = i18n.t('components.flexberry-measuretool.polygon.commit').toString();
    this._measure.polygonBaseTool.popupText.drag = i18n.t('components.flexberry-measuretool.polygon.move').toString();
    this._measure.polygonBaseTool.basePopupText.labelPrefix = i18n.t('components.flexberry-measuretool.polygon.labelPrefix').toString();
    this._measure.polygonBaseTool.basePopupText.labelPostfix = i18n.t('components.flexberry-measuretool.polygon.labelPostfix').toString();
    this._measure.polygonBaseTool.distanceMeasureUnit.kilometer = i18n.t('components.flexberry-measuretool.distanceMeasureUnit.kilometer').toString();
    this._measure.polygonBaseTool.distanceMeasureUnit.meter = i18n.t('components.flexberry-measuretool.distanceMeasureUnit.meter').toString();

    this._measure.polygonBaseTool.startMeasure();
  }
});
