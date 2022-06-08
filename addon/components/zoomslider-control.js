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

  leafletOptions: null,

  createControl() {
    return new L.Control.Zoomslider(this.get('options'));
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    this.leafletOptions = this.leafletOptions || ['position', 'stepHeight', 'knobHeight', 'styleNS'];
  },
});
