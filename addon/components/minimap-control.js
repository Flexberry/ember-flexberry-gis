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

  /**
    Leaflet layerGroup for this control
    @property layerGroup
    @type L.LayerGroup
    @default null
   */
  layerGroup: null,

  leafletOptions: ['toggleDisplay', 'collapsedWidth', 'collapsedHeight'],

  /**
    Sets whether the minimap should have a button to minimise it.
    @property toggleDisplay
    @type boolean
    @default true
   */
  toggleDisplay: true,

  /**
    The width of the toggle marker and the minimap when collapsed, in pixels
    @property collapsedWidth
    @type number
    @default 26
   */
  collapsedWidth: 26,

  /**
    The height of the toggle marker and the minimap when collapsed, in pixels.
    @property collapsedHeight
    @type number
    @default 26
   */
  collapsedHeight: 26,

  /**
    Reference to component's template.
   */
  layout,

  init() {
    this._super(...arguments);
    this.set('layerGroup', L.layerGroup());
  },

  createControl() {
    return new L.Control.MiniMap(this.get('layerGroup'), this.get('options'));
  }
});
