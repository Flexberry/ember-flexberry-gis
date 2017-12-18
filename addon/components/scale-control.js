/**
  @module ember-flexberry-gis
 */

import BaseControl from 'ember-flexberry-gis/components/base-control';

/**
  Simple scale component for leaflet map.

  @class ScaleControlComponent
  @extends BaseControlComponent
*/
export default BaseControl.extend({
  /**
    Array containing component's properties which are also leaflet layer options.

    @property leafletOptions
    @type Stirng[]
  */
  leafletOptions: ['position', 'maxWidth', 'metric', 'imperial', 'updateWhenIdle'],

  /**
    Creates control instance, should be overridden in child classes.

    @method createControl
    @return {L.Control} Returns new created control
  */
  createControl() {
    return L.control.scale(this.get('options'));
  }
});
