/**
  @module ember-flexberry-gis
 */

import BaseControl from 'ember-flexberry-gis/components/base-control';

/**
  Switch scale component for leaflet map.

  @class SwitchScaleControlComponent
  @extends BaseControlComponent
*/
export default BaseControl.extend({
  /**
    Array containing component's properties which are also leaflet layer options.

    @property leafletOptions
    @type Stirng[]
  */
  leafletOptions: [
    'position',
    'dropdownDirection',
    'className',
    'ratio',
    'updateWhenIdle',
    'ratioPrefix',
    'ratioCustomItemText',
    'ratioMenu',
    'pixelsInMeterWidth',
    'getMapWidthForLanInMeters',
    'customScaleTitle',
    'recalcOnPositionChange',
    'recalcOnZoomChange',
    'scales',
    'roundScales',
    'adjustScales'
  ],

  /**
    Creates control instance, should be overridden in child classes.

    @method createControl
    @return {L.Control} Returns new created control
  */
  createControl() {
    return new L.Control.SwitchScaleControl(this.get('options'));
  },
});
