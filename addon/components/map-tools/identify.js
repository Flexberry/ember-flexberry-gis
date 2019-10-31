/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/map-tools/identify';
import { translationMacro as t } from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-identify-map-tool').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-identify-map-tool').
  @readonly
  @static

  @for IdentifyMapToolComponent
*/
const flexberryClassNamesPrefix = 'flexberry-identify-map-tool';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix
};

/**
  Flexberry identify map-tool component.
  Component must be used in combination with {{#crossLink "FlexberryMaptoolbarComponent"}}flexberry-maptoolbar component{{/crossLink}}
  as a wrapper.

  Usage:
  templates/my-map-form.hbs
  ```handlebars
  {{#flexberry-maptoolbar}}
    {{map-tools/identify layers=model.hierarchy leafletMap=leafletMap}}
  {{/flexberry-maptoolbar}}
  ```

  @class IdentifyMapToolComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses <a href="https://github.com/ciena-blueplanet/ember-block-slots#usage">SlotsMixin</a>
*/
let IdentifyMapToolComponent = Ember.Component.extend({
  /**
    Identify tool name computed by the specified tool settings.

    @property _identifyToolName
    @type String
    @readOnly
  */
  _identifyToolName: Ember.computed('layerMode', 'toolMode', function() {
    let identifyToolName = 'identify';
    let layerMode = this.get('layerMode');
    let toolMode = this.get('toolMode');

    if (!(Ember.isBlank(layerMode) || Ember.isBlank(toolMode))) {
      identifyToolName = `identify-${layerMode}-${toolMode}`;
    }

    return identifyToolName;
  }),

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
    @default null
  */
  caption: null,

  /**
    Map tool's tooltip text.
    Will be added as wrapper's element 'title' attribute.

    @property tooltip
    @default t('components.map-tools.identify.tooltip')
  */
  tooltip: t('components.map-tools.identify.tooltip'),

  /**
    Map tool's icon CSS-class names.

    @property iconClass
    @type String
    @default 'hand paper icon'
  */
  iconClass: 'info circle icon',

  /**
    Idenify tool layers mode (which layers to identify).

    @property layerMode
    @default 'visible'
    @type String
  */
  layerMode: 'visible',

  /**
    Identify tool mode (in which type of area to identify).

    @property toolMode
    @default 'marker'
    @type String
  */
  toolMode: 'marker',

  /**
    Flag: indicates whether idenify tool's buffer if active or not.

    @property bufferActive
    @type Boolean
    @default false
  */
  bufferActive: false,

  /**
    Idenify tool buffer raduus units.

    @property bufferUnits
    @type String
    @default 'kilometers'
  */
  bufferUnits: 'kilometers',

  /**
    Idenify tool buffer radius in selected units.

    @property bufferRadius
    @type Number
    @default 0
  */
  bufferRadius: 0,

  /**
    Map layers hierarchy.

    @property layers
    @type Object[]
    @default null
  */
  layers: null,

  /**
    Leaflet map.

    @property leafletMap
    @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
    @default null
  */
  leafletMap: null
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
IdentifyMapToolComponent.reopenClass({
  flexberryClassNames
});

export default IdentifyMapToolComponent;
