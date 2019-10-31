/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/map-tools/draw';
import { translationMacro as t } from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-measure-map-tool').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-measure-map-tool').
  @property {String} flexberryClassNames.drawMarker Component's measure-coordinates mode's CSS-class name ('flexberry-measure-coordinates-map-tool').
  @property {String} flexberryClassNames.drawPolyline Component's measure-radius mode's CSS-class name ('flexberry-measure-radius-map-tool').
  @property {String} flexberryClassNames.drawCircle Component's measure-distance mode's CSS-class name ('flexberry-measure-distance-map-tool').
  @property {String} flexberryClassNames.drawRectangle Component's measure-area mode's CSS-class name ('flexberry-measure-area-map-tool').
  @readonly
  @static

  @for DrawMapToolComponent
*/
const flexberryClassNamesPrefix = 'flexberry-draw-map-tool';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix,
  drawMarker: 'flexberry-draw-marker-map-tool',
  drawPolyline: 'flexberry-draw-polyline-map-tool',
  drawCircle: 'flexberry-draw-circle-map-tool',
  drawRectangle: 'flexberry-draw-rectangle-map-tool',
  drawPolygon: 'flexberry-draw-polygon-map-tool'
};

/**
  Flexberry draw map-tool component.
  Component must be used in combination with {{#crossLink "FlexberryMaptoolbarComponent"}}flexberry-maptoolbar component{{/crossLink}}
  as a wrapper.

  Usage:
  templates/my-map-form.hbs
  ```handlebars
  {{#flexberry-maptoolbar}}
    {{map-tools/draw leafletMap=leafletMap}}
  {{/flexberry-maptoolbar}}
  ```

  @class DrawMapToolComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses <a href="https://github.com/ciena-blueplanet/ember-block-slots#usage">SlotsMixin</a>
*/
let DrawMapToolComponent = Ember.Component.extend({
  /**
    Properties which will be passed to the map-tool when it will be instantiated.

    @property _drawToolProperties
    @type Object
    @default null
  */
  _drawToolProperties: null,

  /**
    Reference to component's template.
  */
  layout,

  /**
    Reference to component's CSS-classes names.
    Must be also a component's instance property to be available from component's .hbs template.
  */
  flexberryClassNames,

  /**
    Overridden ['tagName'](http://emberjs.com/api/classes/Ember.Component.html#property_tagName)
    to disable a component's wrapping element.

    @property tagName
    @type String
    @default ''
  */
  tagName: '',

  /**
    Map tool's additional CSS-class.

    @property class
    @type String
    @default null
  */
  class: null,

  /**
    Map tool's caption.

    @property caption
    @type String
    @default t('components.map-tools.draw.caption')
  */
  caption: t('components.map-tools.draw.caption'),

  /**
    Map tool's tooltip text.
    Will be added as wrapper's element 'title' attribute.

    @property tooltip
    @default t('components.map-tools.draw.tooltip')
  */
  tooltip: t('components.map-tools.draw.tooltip'),

  /**
    Map tool's icon CSS-class names.

    @property iconClass
    @type String
    @default 'write icon'
  */
  iconClass: 'write icon',

  /**
    Map tool's 'draw-marker' mode's additional CSS-class.

    @property drawMarker
    @type String
    @default null
  */
  drawMarkerClass: null,

  /**
    Map tool's 'draw-marker' mode's caption.

    @property drawMarkerCaption
    @type String
    @default t('components.map-tools.draw.draw-marker.caption')
  */
  drawMarkerCaption: t('components.map-tools.draw.draw-marker.caption'),

  /**
    Map tool's 'draw-marker' mode's icon CSS-class names.

    @property drawMarkerIconClass
    @type String
    @default 'square outline icon'
  */
  drawMarkerIconClass: 'marker icon',

  /**
    Map tool's 'draw-polyline' mode's additional CSS-class.

    @property drawPolylineClass
    @type String
    @default null
  */
  drawPolylineClass: null,

  /**
    Map tool's 'draw-polyline' mode's caption.

    @property drawPolylineCaption
    @type String
    @default t('components.map-tools.draw.draw-polyline.caption')
  */
  drawPolylineCaption: t('components.map-tools.draw.draw-polyline.caption'),

  /**
    Map tool's 'draw-polyline' mode's icon CSS-class names.

    @property drawPolylineIconClass
    @type String
    @default 'empty star icon'
  */
  drawPolylineIconClass: 'empty star icon',

  /**
    Map tool's 'draw-circle' mode's additional CSS-class.

    @property drawCircleClass
    @type String
    @default null
  */
  drawCircleClass: null,

  /**
    Map tool's 'draw-circle' mode's caption.

    @property drawCircleCaption
    @type String
    @default t('components.map-tools.draw.draw-circle.caption')
  */
  drawCircleCaption: t('components.map-tools.draw.draw-circle.caption'),

  /**
    Map tool's 'draw-circle' mode's icon CSS-class names.

    @property drawCircleIconClass
    @type String
    @default 'circle icon'
  */
  drawCircleIconClass: 'circle icon',

  /**
    Map tool's 'draw-rectangle' mode's additional CSS-class.

    @property drawRectangleClass
    @type String
    @default null
  */
  drawRectangleClass: null,

  /**
    Map tool's 'draw-rectangle' mode's caption.

    @property drawRectangleCaption
    @type String
    @default t('components.map-tools.draw.draw-rectangle.caption')
  */
  drawRectangleCaption: t('components.map-tools.draw.draw-rectangle.caption'),

  /**
    Map tool's 'draw-rectangle' mode's icon CSS-class names.

    @property drawRectangleIconClass
    @type String
    @default 'square icon'
  */
  drawRectangleIconClass: 'square icon',

  /**
    Map tool's 'draw-polygon' mode's additional CSS-class.

    @property drawPolygonClass
    @type String
    @default null
  */
  drawPolygonClass: null,

  /**
    Map tool's 'draw-polygon' mode's caption.

    @property drawPolygonCaption
    @type String
    @default t('components.map-tools.draw.draw-polygon.caption')
  */
  drawPolygonCaption: t('components.map-tools.draw.draw-polygon.caption'),

  /**
    Map tool's 'draw-polygon' mode's icon CSS-class names.

    @property drawPolygonIconClass
    @type String
    @default 'star icon'
  */
  drawPolygonIconClass: 'star icon',

  /**
    Map tool's 'draw-clear' mode's additional CSS-class.

    @property drawClearClass
    @type String
    @default null
  */
  drawClearClass: null,

  /**
    Map tool's 'draw-clear' mode's caption.

    @property drawClearCaption
    @type String
    @default t('components.map-tools.draw.draw-clear.caption')
  */
  drawClearCaption: t('components.map-tools.draw.draw-clear.caption'),

  /**
    Map tool's 'draw-clear' mode's icon CSS-class names.

    @property drawClearIconClass
    @type String
    @default 'trash icon'
  */
  drawClearIconClass: 'trash icon',

  /**
    Flag: is map tool 'draw-marker' enable

    @property drawMarker
    @default true
    @type Boolean
  */
  drawMarker: true,

  /**
    Flag: is map tool 'draw-polyline' enable

    @property drawPolyline
    @default true
    @type Boolean
  */
  drawPolyline: true,

  /**
    Flag: is map tool 'draw-circle' enable

    @property drawCircle
    @default true
    @type Boolean
  */
  drawCircle: true,

  /**
    Flag: is map tool 'draw-rectangle' enable

    @property drawRectangle
    @default true
    @type Boolean
  */
  drawRectangle: true,

  /**
    Flag: is map tool 'draw-polygon' enable

    @property drawPolygon
    @default true
    @type Boolean
  */
  drawPolygon: true,

  /**
    Flag: is map tool 'draw-clear' enable

    @property drawClear
    @default true
    @type Boolean
  */
  drawClear: true,

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    this.set('_drawToolProperties', {
      editLayer: new L.LayerGroup(),
      featuresLayer: new L.LayerGroup()
    });
  },

  /**
    Destroys component.
  */
  willDestroy() {
    this._super(...arguments);

    this.set('_drawToolProperties', null);
  }
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
DrawMapToolComponent.reopenClass({
  flexberryClassNames
});

export default DrawMapToolComponent;
