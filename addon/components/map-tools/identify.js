/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/map-tools/identify';
import {
  translationMacro as t
} from 'ember-i18n';

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
  {{#flexberry-maptoolbar leafletMap=leafletMap as |maptoolbar|}}
    {{map-tools/identify activate=(action "onMapToolActivate" target=maptoolbar)}}
  {{/flexberry-maptoolbar}}
  ```

  @class IdentifyMapToolComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses <a href="https://github.com/ciena-blueplanet/ember-block-slots#usage">SlotsMixin</a>
*/
let IdentifyMapToolComponent = Ember.Component.extend({

  /**
    Flag indicates is buffer active

    @property bufferActive
    @type Boolean
    @default false
  */
  bufferActive: false,

  /**
    Buffer radius units

    @property bufferUnits
    @type String
    @default 'kilometers'
  */
  bufferUnits: 'kilometers',

  /**
    Buffer radius in selected units

    @property bufferRadius
    @type Number
    @default 0
  */
  bufferRadius: 0,

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
    Leaflet map.

    @property leafletMap
    @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
    @default null
  */
  leafletMap: null,

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
    @property layerMode
    @default ''
    @type {String}
  */
  layerMode: '',

  /**
    @property toolMode
    @default ''
    @type {String}
  */
  toolMode: '',

  /**
    Contains formatted tool name with layers options
    @property _toolName
    @type {String}
    @readonly
    @returns 'identify'+ '-' + layerMode + '-' + toolMode
  */
  _toolName: Ember.computed('layerMode', 'toolMode', function () {
    let layerMode = this.get('layerMode');
    let toolMode = this.get('toolMode');

    if (!(Ember.isBlank(layerMode) || Ember.isBlank(toolMode))) {
      return 'identify-' + layerMode + '-' + toolMode;
    } else {
      return 'identify';
    }
  }),

  actions: {
    /**
      Handles {{#crossLink "BaseMapToolComponent/sendingActions.activate:method"}}base map-tool's 'activate' action{{/crossLink}}.
      Invokes own {{#crossLink "IdentifyMapToolComponent/sendingActions.activate:method"}}'activate' action{{/crossLink}}.

      @method actions.onMapToolActivate
      @param {Object} e Base map-tool's 'activate' action event-object.
    */
    onMapToolActivate(...args) {
      this.sendAction('activate', ...args);
    }
  },

  /**
    Initializes DOM-related component's properties  & logic.
  */
  init() {
    this._super(...arguments);

    let layerMode = this.get('layerMode');
    let toolMode = this.get('toolMode');

    if (!layerMode) {
      this.set('layerMode', 'all');
    }

    if (!toolMode) {
      this.set('toolMode', 'rectangle');
    }
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
IdentifyMapToolComponent.reopenClass({
  flexberryClassNames
});

export default IdentifyMapToolComponent;
