/**
  @module ember-flexberry-gis
 */

import BaseControl from 'ember-flexberry-gis/components/base-control';

/**
  Simple scale component for leaflet map
  @class ScaleControlComponent
  @extends BaseControlComponent
*/
export default BaseControl.extend({

  leafletOptions: ['position', 'maxWidth', 'metric', 'imperial', 'updateWhenIdle'],

  createControl() {
    return L.control.scale(this.get('options'));
  }
});
