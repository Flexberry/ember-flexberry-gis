import { translationMacro as t } from 'ember-i18n';
import MeasureTool from 'ember-flexberry-gis/maptools/measuretool';

export default MeasureTool.extend({
  popupTextMove: t('components.flexberry-measuretool.circle.move'),
  popupTextDrag: t('components.flexberry-measuretool.circle.move'),

  enable() {
    this._super(...arguments);
    this._measure.circleBaseTool.popupText.move = this.popupTextMove;
    this._measure.circleBaseTool.popupText.drag = this.popupTextDrag;
    this._measure.circleBaseTool.basePopupText.labelPrefix = t('components.flexberry-measuretool.circle.labelPrefix');
    this._measure.circleBaseTool.basePopupText.labelPostfix = t('components.flexberry-measuretool.circle.labelPostfix');
    this._measure.circleBaseTool.distanceMeasureUnit.kilometer =t('components.flexberry-measuretool.distanceMeasureUnit.kilometer');
    this._measure.circleBaseTool.distanceMeasureUnit.meter = t('components.flexberry-measuretool.distanceMeasureUnit.meter');
    this._measure.circleBaseTool.startMeasure();
  }

});
