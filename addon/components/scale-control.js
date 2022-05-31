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
    Creates control instance, should be overridden in child classes.

    @method createControl
    @return {L.Control} Returns new created control
  */
  createControl() {
    return L.control.scale(this.get('options'));
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    this.leafletOptions = this.leafletOptions || ['position', 'maxWidth', 'metric', 'imperial', 'updateWhenIdle'];
  },
});
