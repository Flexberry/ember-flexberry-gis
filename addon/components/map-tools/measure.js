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
  @property {String} flexberryClassNames.prefix Component's CSS-class base prefix ('flexberry-map-tool').
  @property {String} flexberryClassNames.icon Component's icon CSS-class name ('flexberry-map-tool-icon').
  @property {String} flexberryClassNames.measure Component's CSS-class name ('flexberry-measure-map-tool').
  @property {String} flexberryClassNames.measureCoordinates Component's measure-coordinates mode's CSS-class name ('flexberry-measure-coordinates-map-tool').
  @property {String} flexberryClassNames.measureRadius Component's measure-radius mode's CSS-class name ('flexberry-measure-radius-map-tool').
  @property {String} flexberryClassNames.measureAreaDistance Component's measure-distance mode's CSS-class name ('flexberry-measure-distance-map-tool').
  @property {String} flexberryClassNames.measureClear Component's clear button CSS-class name ('flexberry-measure-area-map-tool').
  @property {String} flexberryClassNames.measureClose Component's close button CSS-class name ('flexberry-measure-area-map-tool').
  @readonly
  @static

  @for MeasureMapToolComponent
*/
const flexberryClassNamesPrefix = 'flexberry-map-tool';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  icon: flexberryClassNamesPrefix + '-icon',
  measure: 'flexberry-measure-map-tool',
  measureCoordinates: 'flexberry-measure-coordinates-map-tool',
  measureRadius: 'flexberry-measure-radius-map-tool',
  measureAreaDistance: 'flexberry-measure-distance-map-tool',
  measureShowHide: 'flexberry-measure-show-hide-map-tool',
  measureClear: 'flexberry-measure-clear-map-tool',
  measureClose: 'flexberry-measure-close-map-tool'
};

/**
  Flexberry measure map-tool component.
  Component must be used in combination with {{#crossLink "FlexberryMaptoolbarComponent"}}flexberry-maptoolbar component{{/crossLink}}
  as a wrapper.

  Usage:
  templates/my-map-form.hbs
  ```handlebars
  {{#flexberry-maptoolbar}}
    {{map-tools/measure leafletMap=leafletMap}}
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
    Map tool's title CSS-class names.

    @property titleClass
    @type String
    @default 'measure-map-tool-panel-title'
  */
  titleClass: 'measure-map-tool-panel-title',

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
    @default 'marker icon'
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
    @default 'circle icon'
  */
  measureRadiusIconClass: 'circle icon',

  /**
    Map tool's 'measure-distance' mode's additional CSS-class.

    @property measureAreaDistanceClass
    @type String
    @default null
  */
  measureAreaDistanceClass: null,

  /**
    Map tool's 'measure-distance' mode's caption.

    @property measureAreaDistanceCaption
    @type String
    @default t('components.map-tools.measure.measure-distance.caption')
  */
  measureAreaDistanceCaption: t('components.map-tools.measure.measure-area-distance.caption'),

  /**
    Map tool's 'measure-distance' mode's icon CSS-class names.

    @property measureAreaDistanceIconClass
    @type String
    @default 'star icon'
  */
  measureAreaDistanceIconClass: 'star icon',

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
    Map tool's Show additional CSS-class.

    @property measureShowClass
    @type String
    @default null
  */
  measureShowClass: null,

  /**
     Map tool's show caption.

    @property measureShowCaption
    @type String
    @default t('components.map-tools.measure.measure-show.caption')
  */
  measureShowCaption: t('components.map-tools.measure.measure-show.caption'),

  /**
     Map tool's Show icon CSS-class names.

    @property measureShowIconClass
    @type String
    @default 'unhide icon'
  */
  measureShowIconClass: 'unhide icon',

  /**
    Map tool's Hide additional CSS-class.

    @property measureHideClass
    @type String
    @default null
  */
  measureHideClass: null,

  /**
     Map tool's Hide caption.

    @property measureHideCaption
    @type String
    @default t('components.map-tools.measure.measure-hide.caption')
  */
  measureHideCaption: t('components.map-tools.measure.measure-hide.caption'),

  /**
     Map tool's Hide icon CSS-class names.

    @property measureClearIconClass
    @type String
    @default 'hide icon'
  */
  measureHideIconClass: 'hide icon',

  /**
    Button close additional CSS-class.

    @property measureCloseClass
    @type String
    @default null
  */
  measureCloseClass: null,

  /**
     Button close caption.

    @property measureCloseCaption
    @type String
    @default t('components.map-tools.measure.measure-close.caption')
  */
  measureCloseCaption: t('components.map-tools.measure.measure-close.caption'),

  /**
     Button close icon CSS-class names.

    @property measureCloseIconClass
    @type String
    @default 'close icon'
  */
  measureCloseIconClass: 'close icon',

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
  measureAreaDistance: true,

  /**
    Flag: is map tool 'measure-clear' enable

    @property measureClear
    @default true
    @type Boolean
  */
  measureClear: true,

  /**
    Flag: is map tool 'measure-clear' enable

    @property measureClear
    @default true
    @type Boolean
  */
  measureShowHide: true,

  /**
    Show or hide panel

    @property showPanel
    @type boolean
    @default false
  */
  showPanel: false,

  /**
    Show or hide panel

    @property showMeasure
    @type boolean
    @default false
  */
  showMeasure: false,

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

  /**
    Flag: indicates whether to display additional area in ha

    @property addHaArea
    @default false
    @type Boolean
  */
  addHaArea: false,

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
    Initializes component.
  */
  init() {
    this._super(...arguments);

    let editLayer = new L.LayerGroup();
    let featuresLayer = new L.LayerGroup();

    this.set('_measureToolProperties', {
      editLayer: editLayer,
      featuresLayer: featuresLayer,
      crs: this.get('crs'),
      precision: this.get('precision'),
      captions: this.get('coordinatesCaptions'),
      displayCoordinates: this.get('displayCoordinates')
    });
  },

  /**
    Adds created control to map if it's present or change.

    @method initControl
  */
  initControl: Ember.observer('leafletMap', function () {
    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletMap)) {
      let prop = this.get('_measureToolProperties');
      prop._measureTools = new L.MeasureBase(leafletMap, {
        editOptions: {
          editLayer: prop.editLayer,
          featuresLayer: prop.featuresLayer
        },

        addHaArea: this.get('addHaArea')
      });

      if (this.get('showMeasure')) {
        prop._measureTools.showMeasureResult();
      } else {
        prop._measureTools.hideMeasureResult();
      }

      this.set('_measureToolProperties', prop);
    }
  }),

  /**
    Destroys component.
  */
  willDestroy() {
    this._super(...arguments);

    this.set('_measureToolProperties', null);
  },

  actions: {
    closePanel() {
      let _measureTools = this.get('_measureToolProperties._measureTools');
      _measureTools.clearLayers();

      this.set('showPanel', false);
    },

    showPanel() {
      this.set('showPanel', true);
    },

    clear() {
      let _measureTools = this.get('_measureToolProperties._measureTools');
      _measureTools.clearLayers();
    },

    showHide() {
      let showMeasure = this.get('showMeasure');
      let _measureTools = this.get('_measureToolProperties._measureTools');
      if (showMeasure) {
        _measureTools.hideMeasureResult();
      } else {
        _measureTools.showMeasureResult();
      }

      this.set('showMeasure', !showMeasure);
    }
  }
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
MeasureMapToolComponent.reopenClass({
  flexberryClassNames
});

export default MeasureMapToolComponent;
