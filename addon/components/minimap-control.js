/**
  @module ember-flexberry-gis
 */

import Ember from 'ember';
import BaseControl from 'ember-flexberry-gis/components/base-control';
import layout from '../templates/components/minimap-control';

/**
  Mini-map component for leaflet map
  @class MiniMapComponent
  @extends BaseControlComponent
*/
export default BaseControl.extend({
  /**
    Reference to component's template.
  */
  layout,

  miniMap: null,

  /**
    Leaflet layerGroup for this control
    @property layerGroup
    @type L.LayerGroup
    @default null
  */
  layerGroup: null,

  leafletOptions: [
    'position',
    'width',
    'height',
    'collapsedWidth',
    'collapsedHeight',
    'zoomLevelOffset',
    'zoomLevelFixed',
    'centerFixed',
    'zoomAnimation',
    'toggleDisplay',
    'autoToggleDisplay',
    'minimized',
    'strings'
  ],

  /**
    The standard Leaflet.Control position parameter, used like all the other controls.
    @property position
    @type String
    @default 'bottomright'
  */
  position: 'bottomright',

  /**
    The width of the minimap in pixels.
    @property width
    @type number
    @default 150
  */
  width: 150,

  /**
    The height of the minimap in pixels.
    @property height
    @type number
    @default 150
  */
  height: 150,

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
    The offset applied to the zoom in the minimap compared to the zoom of the main map. Can be positive or negative.
    @property zoomLevelOffset
    @type number
    @default -5
  */
  zoomLevelOffset: -5,

  /**
    Overrides the offset to apply a fixed zoom level to the minimap regardless of the main map zoom.
    Set it to any valid zoom level, if unset zoomLevelOffset is used instead.
    @property zoomLevelFixed
    @type number
    @default null
  */
  zoomLevelFixed: null,

  /**
    Applies a fixed position to the minimap regardless of the main map's view / position.
    Prevents panning the minimap, but does allow zooming (both in the minimap and the main map).
    If the minimap is zoomed, it will always zoom around the centerFixed point. You can pass in a LatLng-equivalent object.
    @property centerFixed
    @type {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>}
    @default false
  */
  centerFixed: false,

  /**
    Sets whether the minimap should have an animated zoom.
    Will cause it to lag a bit after the movement of the main map.
    @property zoomAnimation
    @type boolean
    @default false
  */
  zoomAnimation: false,

  /**
    Sets whether the minimap should have a button to minimise it.
    @property toggleDisplay
    @type boolean
    @default false
   */
  toggleDisplay: false,

  /**
    Sets whether the minimap should hide automatically if the parent map bounds does not fit within the minimap bounds.
    Especially useful when 'zoomLevelFixed' is set.
    @property autoToggleDisplay
    @type boolean
    @default false
  */
  autoToggleDisplay: false,

  /**
    Sets whether the minimap should start in a minimized position.
    @property minimized
    @type boolean
    @default false
  */
  minimized: false,

  /**
  Panel position. Top

  @property panelTop
  @default null
  @type String
*/
  panelTop: null,

  /**
    Panel position. Bottom

    @property panelBottom
    @default 4px
    @type String
  */
  panelBottom: '4px',

  /**
    Panel position. Left

    @property panelLeft
    @default null
    @type String
  */
  panelLeft: null,

  /**
    Panel position. Right

    @property panelRight
    @default 65px
    @type String
  */
  panelRight: '65px',

  /**
    Panel visibility

    @property showPanel
    @default false
    @type Boolean
  */
  showPanel: false,

  /**
    Overrides the default strings allowing for translation.
    See {<a href="https://github.com/Norkart/Leaflet-MiniMap#available-strings">for available strings</a>}
    @property strings
    @type Object
    @default {hideText:'', showText:''}
  */
  strings: {
    hideText: '',
    showText: ''
  },

  init() {
    this._super(...arguments);
    this.set('layerGroup', L.layerGroup());
  },

  createControl() {
    return new L.Control.MiniMap(this.get('layerGroup'), this.get('options'));
  },

  afterCreateControl() {
    Ember.$(this.get('control')._container).appendTo('.minimap-drag-panel');
    this.set('miniMap', this.get('control')._miniMap);

    this.get('control')._restore();
  },

  actions: {
    open() {
      this.set('showPanel', true);
    },

    close() {
      this.set('showPanel', false);
    }
  }
});
