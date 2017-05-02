/**
  @module ember-flexberry-gis
 */

import BaseControl from 'ember-flexberry-gis/components/base-control';

/**
  Zoomslider component for leaflet map
  @class ZoomsliderControlComponent
  @extends BaseControlComponent
*/
export default BaseControl.extend({

  leafletOptions: ['position', 'stepHeight', 'knobHeight', 'styleNS'],

  createControl() {
    return new L.Control.Zoomslider(this.get('options'));
  }
});
