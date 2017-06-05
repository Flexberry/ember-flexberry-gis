/**
  @module ember-flexberry-gis
 */

import BaseControl from 'ember-flexberry-gis/components/base-control';

/**
  Switch scale component for leaflet map
  @class SwitchScaleControlComponent
  @extends BaseControlComponent
*/
export default BaseControl.extend({

  leafletOptions: ['position', 'dropdownDirection', 'className', 'ratio', 'updateWhenIdle', 'ratioPrefix', 'ratioCustomItemText',
    'ratioMenu', 'pixelsInMeterWidth', 'getMapWidthForLanInMeters', 'customScaleTitle', 'recalcOnPositionChange',
    'recalcOnZoomChange', 'scales', 'roundScales', 'adjustScales'],

  createControl() {
    return new L.Control.SwitchScaleControl(this.get('options'));
  }
});
