/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/flexberry-identify-panel';
import { translationMacro as t } from 'ember-i18n';

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
  {{flexberry-identify-panel
    layerMode=identifyToolSettings.layerMode
    toolMode=identifyToolSettings.toolMode
    bufferActive=identifyToolSettings.bufferActive
    bufferUnits=identifyToolSettings.bufferUnits
    bufferRadius=identifyToolSettings.bufferRadius
    layers=model.hierarchy
    leafletMap=leafletMap
    identificationFinished=(action "onIdentificationFinished")
    identificationClear=(action "onIdentificationClear")
  }}
  ```

  @class FlexberryIdentifyPanelComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
let FlexberryIdentifyPanelComponent = Ember.Component.extend({
  i18n: Ember.inject.service(),
  /**
    Identify tool name computed by the specified tool settings.

    @property _identifyToolName
    @type String
    @readOnly
  */
  _identifyToolName: Ember.computed('layerMode', 'toolMode', function () {
    let identifyToolName = 'identify';
    let layerMode = this.get('layerMode');
    let toolMode = this.get('toolMode');

    if (!(Ember.isBlank(layerMode) || Ember.isBlank(toolMode))) {
      identifyToolName = `identify-${layerMode}-${toolMode}`;
    }

    return identifyToolName;
  }),

  /**
    Gets actual 'identify' tool properties.

    @property _getIdentifyToolProperties
    @type Object
    @readOnly
    @private
  */
  _identifyToolProperties: Ember.computed(
    'bufferUnits',
    'bufferRadius',
    'layerMode',
    'toolMode',
    'layers',
    function() {
      let radius = typeof this.get('bufferRadius') === 'string' ? this.get('bufferRadius').replace(',', '.') : this.get('bufferRadius');
      return {
        bufferActive: !Ember.isNone(this.get('bufferRadius')) || !Ember.isBlank(this.get('bufferRadius')),
        bufferUnits: this.get('bufferUnits'),
        bufferRadius: radius,
        layerMode: this.get('layerMode'),
        toolMode: this.get('toolMode'),
        layers: this.get('layers')
      };
    }
  ),

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
    layers option's 'all' mode's caption.

    @property allCaption
    @type String
    @default t('components.flexberry-identify-panel.identify-all.caption')
  */
  allCaption: t('components.flexberry-identify-panel.identify-all.caption'),

  isBuffer: false,

  /**
    layers option's 'all' mode's icon CSS-class names.

    @property allIconClass
    @type String
    @default 'square outline icon'
  */
  allIconClass: 'square outline icon',

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
   Tools option's 'marker' mode's caption.

   @property markerCaption
   @type String
   @default t('components.flexberry-identify-panel.marker.caption')
 */
  fileCaption: t('components.flexberry-identify-panel.file.caption'),

  /**
    Tools option's 'marker' mode's icon CSS-class names.

    @property markerIconClass
    @type String
    @default 'icon-guideline-document'
  */
  fileIconClass: 'icon-guideline-document',

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
  rectangleIconClass: 'rectangle icon',

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
    Buffer radius caption.

    @property bufferRadiusCaption
    @type String
    @default t('components.flexberry-identify-panel.buffer.active-caption')
  */
  bufferRadiusCaption: t('components.flexberry-identify-panel.buffer.active-caption'),

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
    @default null
  */
  bufferRadius: null,

  /**
   * Color for identification layer from file
   * @property fileLayerColor
   * @default #0061D9
   */
  fileLayerColor: '#0061D9',

  /**
    Leaflet map.

    @property leafletMap
    @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
    @default null
  */
  leafletMap: null,

  layersButton: [],
  toolsButton:[],

  resultsHeightClass: null,

  resultsHeightClassObserver: Ember.observer('isBuffer', 'toolMode', function() {
    let classHeight = null;
    if (this.get('isBuffer')) {
      classHeight = 'buffer';
    }

    if (this.get('toolMode') === 'file') {
      classHeight = 'file';
    }

    if (this.get('isBuffer') && this.get('toolMode') === 'file') {
      classHeight = 'buffer-file';
    }

    this.set('resultsHeightClass', classHeight);
  }),

  actions: {
    /**
      Handles layer mode button's 'click' action.

      @method actions.onLayerModeChange
    */
    onLayerModeChange(layerMode) {
      this.set('layerMode', layerMode);

      this._enableActualIdentifyTool();
    },

    /**
      Handles tool mode button's 'click' action.

      @method actions.onToolModeChange
    */
    onToolModeChange(toolMode) {
      this.set('toolMode', toolMode);

      this._enableActualIdentifyTool();
    },

    /**
      Handles buffer units dropdown value change.

      @method actions.onBufferUnitsChange
      @param {String} unitsLocalizedCaption Selected units localized caption.
      @param {String} unitsValue Selected units value.
    */
    onBufferUnitsChange(unitsLocalizedCaption, unitsValue) {
      this.set('bufferUnits', unitsValue);
    },

    /**
      Handles 'flexberry-map:identificationFinished' event of leaflet map.

      @method onIdentificationFinished
      @param {Object} e Event object.
    */
    onIdentificationFinished(e) {
      let identificationFinished = this.get('identificationFinished');
      if (Ember.typeOf(identificationFinished) === 'function') {
        identificationFinished(e);
      }
    },

    /**
      Handles 'flexberry-map:onGeomChanged' event of leaflet map.

      @method onGeomChanged
      @param {Object} e Event object.
    */
    onGeomChanged(e) {
      let onGeomChanged = this.get('onGeomChanged');
      if (Ember.typeOf(onGeomChanged) === 'function') {
        onGeomChanged(e);
      }
    },

    /**
      Handles clear button's 'click' action.

      @method actions.onIdentificationClear
      @param {Object} e Click event-object.
    */
    onIdentificationClear(e) {
      let identificationClear = this.get('identificationClear');
      let leafletMap = this.get('leafletMap');
      if (this.get('geomOnly')) {
        let identifyToolName = this.get('_identifyToolName');
        let identifyToolProperties = this.get('_identifyToolProperties');
        leafletMap.flexberryMap.tools.disable(identifyToolName);
        leafletMap.flexberryMap.tools.enable(identifyToolName, identifyToolProperties);
      }

      if (Ember.typeOf(identificationClear) === 'function') {
        identificationClear();
      }
    },

    /**
      Handles input limit.
      @method actions.inputLimit
    */
    onInputLimit(str, e) {
      const regex = /^\.|^,|\.,|,\.|[^\d\.,]|\.(?=.*\.)|,(?=.*,)|\.(?=.*,)|,(?=.*\.)|^0+(?=\d)/g;
      if (!Ember.isEmpty(str) && regex.test(str)) {
        Ember.$(e.target).val(str.replace(regex, ''));
      }
    },

    changeBuffer() {
      this.set('isBuffer', !this.get('isBuffer'));
    }
  },

  init() {
    this._super(...arguments);
    const layersButton = [
      {
        iconClass: this.allIconClass,
        tooltip: this.get('i18n').t('components.flexberry-identify-panel.identify-all.caption').string,
        layerMode:'all'
      },
      {
        iconClass: this.visibleIconClass,
        tooltip: this.get('i18n').t('components.flexberry-identify-panel.identify-all-visible.caption').string,
        layerMode:'visible'
      },
      {
        iconClass: this.topIconClass,
        tooltip: this.get('i18n').t('components.flexberry-identify-panel.identify-top-visible.caption').string,
        layerMode:'top'
      },
    ];
    const toolsButton = [
      {
        iconClass: this.markerIconClass,
        tooltip: this.get('i18n').t('components.flexberry-identify-panel.marker.caption').string,
        layerMode:'marker'
      },
      {
        iconClass: this.polylineIconClass,
        tooltip: this.get('i18n').t('components.flexberry-identify-panel.polyline.caption').string,
        layerMode:'polyline'
      },
      {
        iconClass: this.rectangleIconClass,
        tooltip: this.get('i18n').t('components.flexberry-identify-panel.rectangle.caption').string,
        layerMode:'rectangle'
      },
      {
        iconClass: this.polygonIconClass,
        tooltip: this.get('i18n').t('components.flexberry-identify-panel.polygon.caption').string,
        layerMode:'polygon'
      },
      {
        iconClass: this.fileIconClass,
        tooltip: this.get('i18n').t('components.flexberry-identify-panel.file.caption').string,
        layerMode:'file'
      }
    ];
    this.set('layersButton', layersButton);
    this.set('toolsButton', toolsButton);
  },

  didInsertElement() {
    this._super(...arguments);
    if (this.get('geomOnly') && this.get('toolMode')) {
      this._enableActualIdentifyTool();
    }
  },
  /**
    Destroys DOM-related component's properties.
  */
  willDestroyElement() {
    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletMap)) {
      leafletMap.off('flexberry-map:identificationFinished', this.actions.onIdentificationFinished, this);
      leafletMap.off('flexberry-map:onGeomChanged', this.actions.onGeomChanged, this);
    }

    if (this.get('geomOnly')) {
      let identifyToolName = this.get('_identifyToolName');
      leafletMap.flexberryMap.tools.disable(identifyToolName);
    }

    this._super(...arguments);
  },

  /**
    Observes changes in 'leafletMap' property

    @method _leafletMapDidChange
    @type Observer
    @private
  */
  _leafletMapDidChange: Ember.on('didInsertElement', Ember.observer('leafletMap', function () {
    let leafletMap = this.get('leafletMap');
    if (Ember.isNone(leafletMap)) {
      return;
    }

    leafletMap.on('flexberry-map:identificationFinished', this.actions.onIdentificationFinished, this);
    leafletMap.on('flexberry-map:geomChanged', this.actions.onGeomChanged, this);
  })),

  /**
    Handles changes in buffer settings.

    @method _bufferSettingsDidChange
  */
  _bufferSettingsDidChange: Ember.observer('bufferUnits', 'bufferRadius', function() {
    Ember.run.once(this, '_enableActualIdentifyTool');
  }),

  /**
    Enables identify tool related to actual settings.

    @method _enableActualIdentifyTool
    @private
  */
  _enableActualIdentifyTool() {
    let leafletMap = this.get('leafletMap');
    if (Ember.isNone(leafletMap)) {
      return;
    }

    let identifyToolName = this.get('_identifyToolName');
    let identifyToolProperties = this.get('_identifyToolProperties');
    leafletMap.flexberryMap.tools.enable(identifyToolName, identifyToolProperties);
  }

  /**
    Component's action invoking when idenification finished and results must be handled.

    @method sendingActions.identificationFinished
  */

  /**
    Component's action invoking when idenification results must be cleared.

    @method sendingActions.identificationClear
  */
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryIdentifyPanelComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryIdentifyPanelComponent;
