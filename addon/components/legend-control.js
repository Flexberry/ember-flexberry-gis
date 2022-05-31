/**
  @module ember-flexberry-gis
 */

import BaseControl from 'ember-flexberry-gis/components/base-control';
import layout from '../templates/components/legend-control';

/**
  Legend-control component for leaflet map.

  @class LegendControlComponent
  @extends BaseControlComponent
*/
export default BaseControl.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    Component's wrapper tagName.

    @property tagName
    @type String
    @default 'div'
  */
  tagName: 'div',

  /**
    Component's wrapper tagName.

    @property tagName
    @type String
    @default 'div'
  */
  classNames: ['leaflet-legend-control'],

  /**
    Map layers hierarchy.

    @property layers
    @type Object[]
    @default null
  */
  layers: null,

  /**
    Creates control instance, should be overridden in child classes.

    @method createControl
    @return {L.Control} Returns new created control
  */
  createControl() {
    return new L.Control.Div(this.element, this.get('options'));
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    this.leafletOptions = this.leafletOptions || ['position', 'disableClickPropagation', 'disableScrollPropagation'];
  },
});
