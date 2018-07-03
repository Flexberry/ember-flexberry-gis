/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/flexberry-identify-panel';
import {
  translationMacro as t
} from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-identify-panel').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-identify-panel').
  @property {String} flexberryClassNames.layersOptions Component's layers-options menu CSS-class name ('flexberry-identify-panel-layers-options').
  @property {String} flexberryClassNames.toolsOptions Component's tools-options menu CSS-class name ('flexberry-identify-panel-tools-options').
  @property {String} flexberryClassNames.identifyAll Component's identify-all mode's CSS-class name ('flexberry-identify-panel-all-layers-option').
  @property {String} flexberryClassNames.identifyAllVisible Component's identify-all-visible mode's CSS-class name ('flexberry-identify-panel-all-visible-layers-option').
  @property {String} flexberryClassNames.identifyTopVisible Component's identify-top-visible mode's CSS-class name ('flexberry-identify-panel-top-visible-layers-option').
  @property {String} flexberryClassNames.identifyRectangle Component's identify-all-visible mode's CSS-class name ('flexberry-identify-panel-rectangle-tools-option').
  @property {String} flexberryClassNames.identifyPolygon Component's identify-top-visible mode's CSS-class name ('flexberry-identify-panel-polygon-tools-option').
  @property {String} flexberryClassNames.identifyMarke Component's identify-all-visible mode's CSS-class name ('flexberry-identify-panel-marker-tools-option').
  @property {String} flexberryClassNames.identifyPolyline Component's identify-top-visible mode's CSS-class name ('flexberry-identify-panel-polyline-tools-option').
  @property {String} flexberryClassNames.otherOptions Component's options div CSS-class name ('flexberry-identify-panel-options').
  @readonly
  @static

  @for FlexberryIdentifyPanelComponent
*/
const flexberryClassNamesPrefix = 'flexberry-identify-panel';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix,
  layersOptions: flexberryClassNamesPrefix + '-layers-options',
  identifyAll: flexberryClassNamesPrefix + '-all-layers-option',
  identifyAllVisible: flexberryClassNamesPrefix + '-all-visible-layers-option',
  identifyTopVisible: flexberryClassNamesPrefix + '-top-visible-layers-option',
  toolsOptions: flexberryClassNamesPrefix + '-tools-options',
  identifyRectangle: flexberryClassNamesPrefix + '-rectangle-tools-option',
  identifyPolygon: flexberryClassNamesPrefix + '-polygon-tools-option',
  identifyMarker: flexberryClassNamesPrefix + '-marker-tools-option',
  identifyPolyline: flexberryClassNamesPrefix + '-polyline-tools-option',
  otherOptions: flexberryClassNamesPrefix + '-options'
};

/**
  Flexberry identify panel component.

  Usage:
  templates/my-map-form.hbs
  ```handlebars

  ```

  @class FlexberryIdentifyPanelComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
let FlexberryIdentifyPanelComponent = Ember.Component.extend({
  /**
    Observes changes buffer parameters in flexberry-identify-panel.

    @method _bufferObserver
    @type Observer
    @private
  */
  _bufferObserver: Ember.observer('bufferActive', '_selectedBufferUnits', 'bufferRadius', function () {
    let bufferActive = this.get('bufferActive');
    let selectedUnits = this.get('_selectedBufferUnits');
    let bufferRadius = this.get('bufferRadius');
    let bufferParameters = {
      active: bufferActive,
      units: selectedUnits,
      radius: bufferRadius
    };

    this.sendAction('onBufferSet', bufferParameters);
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
    layers option's additional CSS-class.

    @property class
    @type String
    @default null
  */
  class: null,

  /**
    layers option's 'all' mode CSS-class.

    @property allClass
    @type String
    @default null
  */
  allClass: null,

  /**
    layers option's 'all' mode's caption.

    @property allCaption
    @type String
    @default t('components.flexberry-identify-panel.identify-all.caption')
  */
  allCaption: t('components.flexberry-identify-panel.identify-all.caption'),

  /**
    layers option's 'all' mode's icon CSS-class names.

    @property allIconClass
    @type String
    @default 'square outline icon'
  */
  allIconClass: 'square outline icon',

  /**
    layers option's 'visible' mode CSS-class.

    @property visibleClass
    @type String
    @default null
  */
  visibleClass: null,

  /**
    layers option's 'visible' mode's caption.

    @property visibleCaption
    @type String
    @default t('components.flexberry-identify-panel.identify-all-visible.caption')
  */
  visibleCaption: t('components.flexberry-identify-panel.identify-all-visible.caption'),

  /**
    layers option's 'visible' mode's icon CSS-class names.

    @property visibleIconClass
    @type String
    @default 'square outline icon'
  */
  visibleIconClass: 'checkmark box icon',

  /**
    layers option's 'top' mode CSS-class.

    @property topClass
    @type String
    @default null
  */
  topClass: null,

  /**
    layers option's 'top' mode's caption.

    @property topCaption
    @type String
    @default t('components.flexberry-identify-panel.identify-top-visible.caption')
  */
  topCaption: t('components.flexberry-identify-panel.identify-top-visible.caption'),

  /**
    layers option's 'top' mode's icon CSS-class names.

    @property topIconClass
    @type String
    @default 'square outline icon'
  */
  topIconClass: 'chevron up icon',

  /**
    Flag: is layers option 'identify all layers' enable

    @property all
    @default true
    @type Boolean
  */
  all: true,

  /**
    Flag: is layers option 'identify all visible layers' enable

    @property visible
    @default true
    @type Boolean
  */
  visible: true,

  /**
    Flag: is layers option 'identify top layer' enable

    @property top
    @default true
    @type Boolean
  */
  top: true,

  /**
    @property layerMode
    @default 'visible'
    @type {String}
   */
  layerMode: 'visible',

  /**
    Tools option's 'rectangle' mode CSS-class.

    @property rectangleClass
    @type String
    @default null
  */
  rectangleClass: null,

  /**
    Tools option's 'rectangle' mode's caption.

    @property rectangleCaption
    @type String
    @default t('components.flexberry-identify-panel.rectangle.caption')
  */
  rectangleCaption: t('components.flexberry-identify-panel.rectangle.caption'),

  /**
    Tools option's 'rectangle' mode's icon CSS-class names.

    @property rectangleIconClass
    @type String
    @default 'square outline icon'
  */
  rectangleIconClass: 'square outline icon',

  /**
    Tools option's 'polygon' mode CSS-class.

    @property polygonClass
    @type String
    @default null
  */
  polygonClass: null,

  /**
    Tools option's 'polygon' mode's caption.

    @property polygonCaption
    @type String
    @default t('components.flexberry-identify-panel.polygon.caption')
  */
  polygonCaption: t('components.flexberry-identify-panel.polygon.caption'),

  /**
    Tools option's 'polygon' mode's icon CSS-class names.

    @property polygonIconClass
    @type String
    @default 'star icon'
  */
  polygonIconClass: 'star icon',

  /**
    Tools option's 'marker' mode CSS-class.

    @property markerClass
    @type String
    @default null
  */
  markerClass: null,

  /**
    Tools option's 'marker' mode's caption.

    @property markerCaption
    @type String
    @default t('components.flexberry-identify-panel.marker.caption')
  */
  markerCaption: t('components.flexberry-identify-panel.marker.caption'),

  /**
    Tools option's 'marker' mode's icon CSS-class names.

    @property markerIconClass
    @type String
    @default 'map marker icon'
  */
  markerIconClass: 'map marker icon',

  /**
    Tools option's 'polyline' mode CSS-class.

    @property polylineClass
    @type String
    @default null
  */
  polylineClass: null,

  /**
    Tools option's 'polyline' mode's caption.

    @property polylineCaption
    @type String
    @default t('components.flexberry-identify-panel.polyline.caption')
  */
  polylineCaption: t('components.flexberry-identify-panel.polyline.caption'),

  /**
    Tools option's 'polyline' mode's icon CSS-class names.

     @property polylineIconClass
     @type String
     @default 'minus icon'
  */
  polylineIconClass: 'minus icon',

  /**
    clear button's CSS-class.

    @property clearClass
    @type String
    @default null
  */
  clearClass: null,

  /**
    clear button's caption.

    @property clearCaption
    @type String
    @default t('components.flexberry-identify-panel.clear.caption')
  */
  clearCaption: t('components.flexberry-identify-panel.clear.caption'),

  /**
    clear button's icon CSS-class names.

    @property clearIconClass
    @type String
    @default 'remove icon'
  */
  clearIconClass: 'remove icon',

  /**
    Flag: is tools option 'rectangle' enable

    @property rectangle
    @default true
    @type Boolean
  */
  rectangle: true,

  /**
    Flag: is tools option 'polygon' enable

    @property polygon
    @default true
    @type Boolean
  */
  polygon: true,

  /**
    Flag: is tools option 'marker' enable

    @property marker
    @default true
    @type Boolean
  */
  marker: true,

  /**
    Flag: is tools option 'polyline' enable

    @property polyline
    @default true
    @type Boolean
  */
  polyline: true,

  /**
    Flag: is tools option 'buffer' enabled.

    @property polyline
    @default true
    @type Boolean
  */
  buffer: true,

  /**
    @property toolMode
    @default 'marker'
    @type {String}
   */
  toolMode: 'marker',

  /**
    Active buffer caption.

    @property bufferActiveCaption
    @type String
    @default t('components.flexberry-identify-panel.buffer.active-caption')
  */
  bufferActiveCaption: t('components.flexberry-identify-panel.buffer.active-caption'),

  /**
    Buffer radius caption.

    @property bufferRadiusCaption
    @type String
    @default t('components.flexberry-identify-panel.buffer.radius-caption')
  */
  bufferRadiusCaption: t('components.flexberry-identify-panel.buffer.radius-caption'),

  /**
    Flag indicates is buffer active

    @property bufferActive
    @type Boolean
    @default false
  */
  bufferActive: false,

  /**
    Buffer radius units

    @property _selectedBufferUnits
    @type String
    @default 'kilometers'
  */
  _selectedBufferUnits: 'kilometers',

  /**
    Buffer radius units with locale.

    @property bufferUnitsList
    @type Object
  */
  bufferUnitsList: {
    meters: 'components.flexberry-identify-panel.buffer.units.meters',
    kilometers: 'components.flexberry-identify-panel.buffer.units.kilometers'
  },

  /**
    Buffer radius in selected units

    @property bufferRadius
    @type Number
    @default 0
  */
  bufferRadius: 0,

  /**
    Leaflet map.

    @property leafletMap
    @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
    @default null
  */
  leafletMap: null,

  /**
    Observes changes in {{#crossLink "FlexberryMaptoolbarComponent/leafletMap:propery"}}'leafletMap' property{{/crossLink}}.
    Activates default map-tool when leafletMap initialized and subscribes on flexberry-map:identificationFinished event.

    @method _leafletMapDidChange
    @type Observer
    @private
  */
  _leafletMapDidChange: Ember.on('didInsertElement', Ember.observer('leafletMap', function () {

    let leafletMap = this.get('leafletMap');
    if (Ember.isNone(leafletMap)) {
      return;
    }

    // Attach custom event-handler.
    leafletMap.on('flexberry-map:identificationFinished', this.identificationFinished, this);
  })),

  actions: {
    /**
      Handles inner layer option button's 'click' action.

      @method actions.onLayerOptionChange
    */
    onLayerOptionChange(...args) {
      this.set('layerMode', args[0]);
      this._switch(true);

      this.sendAction('onLayerOptionChange', ...args);
    },

    /**
      Handles inner tool option button's 'click' action.

      @method actions.onToolOptionChange
    */
    onToolOptionChange(...args) {
      this.set('toolMode', args[0]);
      this._switch(false, true);

      this.sendAction('onToolOptionChange', ...args);
    },

    /**
      Handles buffer units dropdown value change.

      @method actions.onBufferUnitSelected
      @param {String} item Clicked item locale key.
      @param {String} key Clicked item value.
    */
    onBufferUnitSelected(item, key) {
      this.set('_selectedBufferUnits', key);
    },

    /**
      Handles inner clear button's 'click' action.

      @method actions.clear
    */
    clear(...args) {
      this.sendAction('clear', ...args);
    }
  },

  /**
      Handles 'flexberry-map:identificationFinished' event of leaflet map.

      @method identificationFinished
      @param {Object} e Event object.
      @param {Object} results Hash containing search results.
      @param {Object[]} results.features Array containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
      or a promise returning such array.
    */
  identificationFinished(e) {
    this.sendAction('onIdentificationFinished', e);
  },

  /**
    Initializes DOM-related component's properties.
  */
  didInsertElement() {
    this._super(...arguments);
    let selectedLayerOption = this.get('layerMode');
    let selectedToolOption = this.get('toolMode');

    this._switchActiveLayer(selectedLayerOption);
    this._switchActiveTool(selectedToolOption);
  },

  /**
   * @method _switchActiveLayer
   * @param {String} selectedLayerOption
   */
  _switchActiveLayer(selectedLayerOption) {
    this.set('allClass', null);
    this.set('visibleClass', null);
    this.set('topClass', null);

    this.set(selectedLayerOption + 'Class', 'active');
  },

  /**
   * @method _switchActiveLayer
   * @param {String} selectedToolOption
   */
  _switchActiveTool(selectedToolOption) {
    this.set('rectangleClass', null);
    this.set('polygonClass', null);
    this.set('markerClass', null);
    this.set('polylineClass', null);

    this.set(selectedToolOption + 'Class', 'active');
  },

  /**
   * @method _switch
   * handles changes in layer and tools options and fires 'flexberry-map:identificationOptionChanged' event
   * @private
   */
  _switch(_switchActiveLayer, _switchActiveTool) {
    let layer = this.get('layerMode');
    let tool = this.get('toolMode');

    if (_switchActiveLayer) {
      this._switchActiveLayer(layer);
    }

    if (_switchActiveTool) {
      this._switchActiveTool(tool);
    }

    let leafletMap = this.get('leafletMap');
    if (Ember.isNone(leafletMap)) {
      return;
    }

    let mapToolName = 'identify-' + layer + '-' + tool;
    leafletMap.fire('flexberry-map:identificationOptionChanged', {
      mapToolName
    });
  },

  /**
    Component's action invoking when layer option changed.

    @method sendingActions.onLayerOptionChange
    {{#crossLink "FlexberryIdentifyPanelComponent/sendingActions.onLayerOptionChange:method"}}identify panel's on layer option changed action{{/crossLink}}.
  */

  /**
    Component's action invoking when tool option changed.

    @method sendingActions.onToolOptionChange
    {{#crossLink "FlexberryIdentifyPanelComponent/sendingActions.onToolOptionChange:method"}}identify panel's on tool option changed action{{/crossLink}}.
  */

  /**
    Component's action invoking when map-tool must be activated.

    @method sendingActions.clear
    {{#crossLink "FlexberryIdentifyPanelComponent/sendingActions.clear:method"}}identify panel's on clear button clicked action{{/crossLink}}.
  */
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryIdentifyPanelComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryIdentifyPanelComponent;
