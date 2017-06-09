/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/map-tools/measure';
import {
  translationMacro as t
} from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-measure-map-tool').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-measure-map-tool').
  @property {String} flexberryClassNames.measureCoordinates Component's measure-coordinates mode's CSS-class name ('flexberry-measure-coordinates-map-tool').
  @property {String} flexberryClassNames.measureRadius Component's measure-radius mode's CSS-class name ('flexberry-measure-radius-map-tool').
  @property {String} flexberryClassNames.measureDistance Component's measure-distance mode's CSS-class name ('flexberry-measure-distance-map-tool').
  @property {String} flexberryClassNames.measureArea Component's measure-area mode's CSS-class name ('flexberry-measure-area-map-tool').
  @readonly
  @static

  @for MeasureMapToolComponent
*/
const flexberryClassNamesPrefix = 'flexberry-measure-map-tool';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix,
  measureCoordinates: 'flexberry-measure-coordinates-map-tool',
  measureRadius: 'flexberry-measure-radius-map-tool',
  measureDistance: 'flexberry-measure-distance-map-tool',
  measureArea: 'flexberry-measure-area-map-tool'
};

/**
  Flexberry measure map-tool component.
  Component must be used in combination with {{#crossLink "FlexberryMaptoolbarComponent"}}flexberry-maptoolbar component{{/crossLink}}
  as a wrapper.

  Usage:
  templates/my-map-form.hbs
  ```handlebars
  {{#flexberry-maptoolbar leafletMap=leafletMap as |maptoolbar|}}
    {{map-tools/measure activate=(action "onMapToolActivate" target=maptoolbar)}}
  {{/flexberry-maptoolbar}}
  ```

  @class MeasureMapToolComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses <a href="https://github.com/ciena-blueplanet/ember-block-slots#usage">SlotsMixin</a>
*/
let MeasureMapToolComponent = Ember.Component.extend({
  /**
    Properties which will be passed to the map-tool when it will be instantiated.

    @property _measureToolProperties
    @type Object
    @default null
  */
  _measureToolProperties: null,

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
    @default t('components.map-tools.measure.caption')
  */
  caption: t('components.map-tools.measure.caption'),

  /**
    Map tool's tooltip text.
    Will be added as wrapper's element 'title' attribute.

    @property tooltip
    @default t('components.map-tools.measure.tooltip')
  */
  tooltip: t('components.map-tools.measure.tooltip'),

  /**
    Map tool's icon CSS-class names.

    @property iconClass
    @type String
    @default 'wizard icon'
  */
  iconClass: 'wizard icon',

  /**
    Map tool's 'measure-coordinates' mode's additional CSS-class.

    @property measureCoordinates
    @type String
    @default null
  */
  measureCoordinatesClass: null,

  /**
    Map tool's 'measure-coordinates' mode's caption.

    @property measureCoordinatesCaption
    @type String
    @default t('components.map-tools.measure.measure-coordinates.caption')
  */
  measureCoordinatesCaption: t('components.map-tools.measure.measure-coordinates.caption'),

  /**
    Map tool's 'measure-coordinates' mode's icon CSS-class names.

    @property measureCoordinatesIconClass
    @type String
    @default 'square outline icon'
  */
  measureCoordinatesIconClass: 'marker icon',

  /**
    Map tool's 'measure-radius' mode's additional CSS-class.

    @property measureRadiusClass
    @type String
    @default null
  */
  measureRadiusClass: null,

  /**
    Map tool's 'measure-radius' mode's caption.

    @property measureRadiusCaption
    @type String
    @default t('components.map-tools.measure.measure-radius.caption')
  */
  measureRadiusCaption: t('components.map-tools.measure.measure-radius.caption'),

  /**
    Map tool's 'measure-radius' mode's icon CSS-class names.

    @property measureRadiusIconClass
    @type String
    @default 'square outline icon'
  */
  measureRadiusIconClass: 'circle icon',

  /**
    Map tool's 'measure-distance' mode's additional CSS-class.

    @property measureDistanceClass
    @type String
    @default null
  */
  measureDistanceClass: null,

  /**
    Map tool's 'measure-distance' mode's caption.

    @property measureDistanceCaption
    @type String
    @default t('components.map-tools.measure.measure-distance.caption')
  */
  measureDistanceCaption: t('components.map-tools.measure.measure-distance.caption'),

  /**
    Map tool's 'measure-distance' mode's icon CSS-class names.

    @property measureDistanceIconClass
    @type String
    @default 'square outline icon'
  */
  measureDistanceIconClass: 'empty star icon',

  /**
    Map tool's 'measure-area' mode's additional CSS-class.

    @property measureAreaClass
    @type String
    @default null
  */
  measureAreaClass: null,

  /**
    Map tool's 'measure-area' mode's caption.

    @property measureAreaCaption
    @type String
    @default t('components.map-tools.measure.measure-area.caption')
  */
  measureAreaCaption: t('components.map-tools.measure.measure-area.caption'),

  /**
    Map tool's 'measure-area' mode's icon CSS-class names.

    @property measureAreaIconClass
    @type String
    @default 'square outline icon'
  */
  measureAreaIconClass: 'square icon',

  /**
    Map tool's 'measure-clear' mode's additional CSS-class.

    @property measureClearClass
    @type String
    @default null
  */
  measureClearClass: null,

  /**
    Map tool's 'measure-clear' mode's caption.

    @property measureClearCaption
    @type String
    @default t('components.map-tools.measure.measure-clear.caption')
  */
  measureClearCaption: t('components.map-tools.measure.measure-clear.caption'),

  /**
    Map tool's 'measure-clear' mode's icon CSS-class names.

    @property measureClearIconClass
    @type String
    @default 'trash icon'
  */
  measureClearIconClass: 'trash icon',

  /**
    Flag: is map tool 'measure-coordinates' enable

    @property measureCoordinates
    @default true
    @type Boolean
  */
  measureCoordinates: true,

  /**
    Flag: is map tool 'measure-radius' enable

    @property measureRadius
    @default true
    @type Boolean
  */
  measureRadius: true,

  /**
    Flag: is map tool 'measure-distance' enable

    @property measureDistance
    @default true
    @type Boolean
  */
  measureDistance: true,

  /**
    Flag: is map tool 'measure-area' enable

    @property measureArea
    @default true
    @type Boolean
  */
  measureArea: true,

  /**
    Flag: is map tool 'measure-clear' enable

    @property measureClear
    @default true
    @type Boolean
  */
  measureClear: true,

  /**
    Tool's coordinate reference system (CRS).

    @property crs
    @type <a href="http://leafletjs.com/reference-1.0.0.html#crs">L.CRS</a>
    @default null
  */
  crs: null,

  /**
    Coordinates tool's captions

    @property coordinatesCaptions
    @default null
    @example ```javascript
    {
        northLatitude: ' с.ш. ',
        southLatitude: ' ю.ш. ',
        eastLongitude: ' в.д. ',
        westLongitude: ' з.д. ',
        x: 'X: ',
        y: 'Y: '
    }
    ```
  */
  coordinatesCaptions: null,

  /**
    Coordinates tool's precision

    @property precision
    @type Number
    @default null
  */
  precision: null,

  /**
    Flag: indicates whether to display coordinates instead of LatLng's

    @property displayCoordinates
    @default false
    @type Boolean
  */
  displayCoordinates: false,

  actions: {
    /**
      Handles {{#crossLink "BaseMapToolComponent/sendingActions.activate:method"}}base map-tool's 'activate' action{{/crossLink}}.
      Invokes own {{#crossLink "MeasureMapToolComponent/sendingActions.activate:method"}}'activate' action{{/crossLink}}.

      @method actions.onMapToolActivate
      @param {Object} e Base map-tool's 'activate' action event-object.
    */
    onMapToolActivate(...args) {
      this.sendAction('activate', ...args);
    }
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    this.set('_measureToolProperties', {
      editLayer: new L.LayerGroup(),
      featuresLayer: new L.LayerGroup(),
      crs: this.get('crs'),
      precision: this.get('precision'),
      captions: this.get('coordinatesCaptions'),
      displayCoordinates: this.get('displayCoordinates')
    });
  }

  /**
    Component's action invoking when map-tool must be activated.

    @method sendingActions.activate
    @param {Object} e Action's event object from
    {{#crossLink "BaseMapToolComponent/sendingActions.activate:method"}}base map-tool's 'activate' action{{/crossLink}}.
  */
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
MeasureMapToolComponent.reopenClass({
  flexberryClassNames
});

export default MeasureMapToolComponent;
