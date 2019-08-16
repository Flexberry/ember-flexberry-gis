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
  {{#flexberry-maptoolbar}}
    {{map-tools/identify leafletMap=leafletMap layers=model.hierarchy}}
  {{/flexberry-maptoolbar}}
  ```

  @class IdentifyMapToolComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses <a href="https://github.com/ciena-blueplanet/ember-block-slots#usage">SlotsMixin</a>
*/
let IdentifyMapToolComponent = Ember.Component.extend({
  /**
    Properties which will be passed to the map-tool when it will be instantiated.

    @property _identifyToolProperties
    @type Object
    @default null
  */
  _identifyToolProperties: null,

  /**
    Identify tool name computed by the specified tool settings ('identify'+ '-' + layerMode + '-' + toolMode).

    @property _identifyToolName
    @type {String}
    @readonly
  */
  _identifyToolName: null,

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
    @property layerMode
    @default 'all'
    @type String
  */
  layerMode: 'all',

  /**
    @property toolMode
    @default 'rectangle'
    @type String
  */
  toolMode: 'rectangle',

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
  leafletMap: null,

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    this.set('_identifyToolName', this._getidentifyToolName());
    this.set('_identifyToolProperties', this._getIdentifyToolProperties());
  },

  /**
    Destroys component.
  */
  willDestroy() {
    this._super(...arguments);

    this.set('_identifyToolProperties', null);
  },

  /**
    Observes changes in 'leafletMap' property.
    Attaches leafletMap event handlers.

    @method _leafletMapDidChange
    @private
  */
  _leafletMapDidChange: Ember.observer('leafletMap', function() {
    let leafletMap = this.get('leafletMap');
    if (Ember.isNone(leafletMap)) {
      return;
    }

    leafletMap.on('flexberry-map:identificationOptionChanged', this._identifyToolPropertiesDidChange, this);
  }),

  /**
    Handles changes in 'identify' tool properties.

    @method _identifyToolPropertiesDidChange
    @private
  */
  _identifyToolPropertiesDidChange: Ember.observer(
    'bufferActive',
    'bufferUnits',
    'bufferRadius',
    'layerMode',
    'toolMode',
    'layers',
    function() {
      let leafletMap = this.get('leafletMap');
      if (Ember.isNone(leafletMap)) {
        return;
      }

      // Disable currently enabled tool.
      leafletMap.flexberryMap.tools.disable();

      // Calculate actual tool name.
      let identifyToolName = this._getidentifyToolName();
      this.set('_identifyToolName', identifyToolName);

      // Calculate actual tool properties.
      let identifyToolProperties = this._getIdentifyToolProperties();
      this.set('_identifyToolProperties', identifyToolProperties);

      // Now we can enable 'identification' tool with actual tool properties.
      Ember.run.scheduleOnce('afterRender', this, function () {
        leafletMap.flexberryMap.tools.enable(identifyToolName, identifyToolProperties);
      });
    }
  ),

  /**
    Gets actual 'identify' tool name.

    @method _getidentifyToolName
    @private
  */
  _getidentifyToolName() {
    let identifyToolName = 'identify';
    let layerMode = this.get('layerMode');
    let toolMode = this.get('toolMode');

    if (!(Ember.isBlank(layerMode) || Ember.isBlank(toolMode))) {
      identifyToolName = `identify-${layerMode}-${toolMode}`;
    }

    return identifyToolName;
  },

  /**
    Gets actual 'identify' tool properties.

    @method _getIdentifyToolProperties
    @private
  */
  _getIdentifyToolProperties() {
    return {
      bufferActive: this.get('bufferActive'),
      bufferUnits: this.get('bufferUnits'),
      bufferRadius: this.get('bufferRadius'),
      layerMode: this.get('layerMode'),
      toolMode: this.get('toolMode'),
      layers: this.get('layers')
    };
  }
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
IdentifyMapToolComponent.reopenClass({
  flexberryClassNames
});

export default IdentifyMapToolComponent;
