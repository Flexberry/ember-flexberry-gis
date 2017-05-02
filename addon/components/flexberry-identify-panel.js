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
    @default t('components.map-tools.identify.identify-all.caption')
  */
  allCaption: t('components.map-tools.identify.identify-all.caption'),

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
    @default t('components.map-tools.idenify.identify-all-visible.caption')
  */
  visibleCaption: t('components.map-tools.identify.identify-all-visible.caption'),

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
    @default t('components.map-tools.idenify.identify-top-visible.caption')
  */
  topCaption: t('components.map-tools.identify.identify-top-visible.caption'),

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
    tools option's 'rectangle' mode CSS-class.

    @property rectangleClass
    @type String
    @default null
  */
  rectangleClass: null,

  /**
    tools option's 'rectangle' mode's caption.

    @property rectangleCaption
    @type String
    @default t('components.map-tools.idenify.rectangle.caption')
  */
  rectangleCaption: t('components.map-tools.identify.rectangle.caption'),

  /**
    tools option's 'rectangle' mode's icon CSS-class names.

    @property rectangleIconClass
    @type String
    @default 'square outline icon'
  */
  rectangleIconClass: 'square outline icon',

  /**
    tools option's 'polygon' mode CSS-class.

    @property polygonClass
    @type String
    @default null
  */
  polygonClass: null,

  /**
    tools option's 'polygon' mode's caption.

    @property polygonCaption
    @type String
    @default t('components.map-tools.idenify.polygon.caption')
  */
  polygonCaption: t('components.map-tools.identify.polygon.caption'),

  /**
    tools option's 'polygon' mode's icon CSS-class names.

    @property polygonIconClass
    @type String
    @default 'star icon'
  */
  polygonIconClass: 'star icon',

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
    @property toolMode
    @default 'rectangle'
    @type {String}
   */
  toolMode: 'rectangle',

  /**
   @type Observer
   */
  _switchObserver: Ember.observer('layerMode', 'toolMode', function () {
    let selectedLayerOption = this.get('layerMode');
    let selectedToolOption = this.get('toolMode');

    this._switchActiveLayer(selectedLayerOption);
    this._switchActiveTool(selectedToolOption);
  }),

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

    this.set(selectedToolOption + 'Class', 'active');
  },

  actions: {
    /**
      Handles inner layer option button's 'click' action.

      @method actions.onLayerOptionChange
    */
    onLayerOptionChange(...args) {
      this.set('layerMode', args[0]);

      this.sendAction('onLayerOptionChange', ...args);
    },

    /**
      Handles inner tool option button's 'click' action.

      @method actions.onToolOptionChange
    */
    onToolOptionChange(...args) {
      this.set('toolMode', args[0]);

      this.sendAction('onToolOptionChange', ...args);
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
