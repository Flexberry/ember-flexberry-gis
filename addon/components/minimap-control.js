/**
  @module ember-flexberry-gis
 */

import BaseControl from 'ember-flexberry-gis/components/base-control';
import layout from '../templates/components/minimap-control';

/**
  Mini-map component for leaflet map
  @class MiniMapComponent
  @extends BaseControlComponent
*/
export default BaseControl.extend({

  layerGroup: null,

  leafletOptions: ['toggleDisplay', 'collapsedWidth', 'collapsedHeight'],

  toggleDisplay: true,

  collapsedWidth: 18,

  collapsedHeight: 18,

  layout,

  init() {
    this._super(...arguments);
    this.set('layerGroup', L.layerGroup());
  },

  createControl() {
    return new L.Control.MiniMap(this.get('layerGroup'), this.get('options'));
  }
});
