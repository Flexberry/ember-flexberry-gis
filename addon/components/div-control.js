/**
  @module ember-flexberry-gis
 */

import BaseControl from './base-control';
import layout from '../templates/components/div-control';

/**
  Container contol component for leaflet map, render yield block in `position` anchor of map
  @class DivControlComponent
  @extends BaseControlComponent
*/
export default BaseControl.extend({
  layout,

  tagName: 'div',

  classNames: ['ui'],

  leafletOptions: ['position', 'disableClickPropagation', 'disableScrollPropagation'],

  /**
    The position of the control (one of the map corners). Possible values are 'topleft', 'topright', 'bottomleft' or 'bottomright'
    @property position
    @type 'topleft'|'topright'|'bottomleft'|'bottomright'
    @default 'topright'
   */
  position: 'topright',

  /**
    Don't propagate click events to map object when user clicked to component element
    @property disableClickPropagation
    @type Boolean
    @default true
   */
  disableClickPropagation: true,

  /**
    Don't propagate scroll events to map object when user scroll on component element
    @property disableScrollPropagation
    @type Boolean
    @default true
   */
  disableScrollPropagation: true,

  createControl() {
    return new L.Control.Div(this.element, this.get('options'));
  }
});
