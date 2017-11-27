/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/layers-styles/simple';

/**
  Component containing GUI for 'simple' layers-style

  @class SimpleLayersStyleComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend({
  /**
    Currently active tab name.

    @property _activeTab
    @type String
    @default 'path-tab'
    @private
  */
  _activeTab: 'path-tab',

  /**
    Reference to 'layers-styles-renderer' service.

    @property _layersStylesRenderer
    @type LayersStylesRendererService
    @private
  */
  _layersStylesRenderer: Ember.inject.service('layers-styles-renderer'),

  /**
    Reference to 'markers-styles-renderer' service.

    @property _markersStylesRenderer
    @type MarkersStylesRendererService
    @private
  */
  _markersStylesRenderer: Ember.inject.service('markers-styles-renderer'),

  /**
    Path stytle settings preview canvas.

    @property _$pathPreviewCanvas
    @type <a =ref="https://developer.mozilla.org/ru/docs/Web/HTML/Element/canvas">Canvas</a>
    @default null
    @private
  */
  _pathPreviewCanvas: null,

  /**
    Marker stytle settings preview canvas.

    @property _$markerPreviewCanvas
    @type <a =ref="https://developer.mozilla.org/ru/docs/Web/HTML/Element/canvas">Canvas</a>
    @default null
    @private
  */
  _markerPreviewCanvas: null,

  /**
    Reference to component's template.
  */
  layout,

  /**
    Component's wrapping <div> CSS-classes names.

    @property classNames
    @type String[]
    @default ['simple-layers-style']
  */
  classNames: ['simple-layers-style'],

  /**
    Hash containing style settings.

    @property styleSettings
    @type Object
    @default null
  */
  styleSettings: null,

  /**
    Hash containing layer display settings.

    @property displaySettings
    @type Object
    @default null
  */
  displaySettings: null,

  /**
    Related layer's type.

    @property layerType
    @type String
    @default null
  */
  layerType: null,

  /**
    Method returning related leaflet layer.

    @property leafletLayer
    @type Function
    @default null
  */
  getLeafletLayer: null,

  /**
    Renderes path style settings preview on canvas.

    @method _renderPathPreviewOnCanvas
    @private
  */
  _renderPathPreviewOnCanvas() {
    this.get('_layersStylesRenderer').renderOnCanvas({
      canvas: this.get('_pathPreviewCanvas'),
      styleSettings: this.get('styleSettings'),
      target: 'preview'
    });
  },

  /**
    Renderes marker style settings preview on canvas.

    @method _renderMarkerPreviewOnCanvas
    @private
  */
  _renderMarkerPreviewOnCanvas() {
    this.get('_markersStylesRenderer').renderOnCanvas({
      canvas: this.get('_markerPreviewCanvas'),
      styleSettings: this.get('styleSettings.style.marker'),
      target: 'preview'
    });
  },

  /**
    Initializes DOM-related component's properties.
  */
  didInsertElement() {
    this._super(...arguments);

    let pathPreviewCanvas = this.$('.ui.tab.segment[data-tab=path-tab] canvas')[0];
    this.set('_pathPreviewCanvas', pathPreviewCanvas);

    let markerPreviewCanvas = this.$('.ui.tab.segment[data-tab=marker-tab] canvas')[0];
    this.set('_markerPreviewCanvas', markerPreviewCanvas);

    this._renderPathPreviewOnCanvas();
    this._renderMarkerPreviewOnCanvas();
  },

  /**
    Destroys DOM-related component's properties.
  */
  willDestroyElement() {
    this._super(...arguments);

    this.set('_pathPreviewCanvas', null);
    this.set('_markerPreviewCanvas', null);
  },

  actions: {
    /**
      Handles clicks on tabs.

      @method actions.onTabClick
      @param {Object} e Click event object.
    */
    onTabClick(e) {
      e = Ember.$.event.fix(e);

      let $clickedTab = Ember.$(e.currentTarget);
      let clickedTabName = $clickedTab.attr('data-tab');

      this.set('_activeTab', clickedTabName);
    },

    /**
      Handles changes in path style settings.

      @method actions.onPathStyleSettingsChange
    */
    onPathStyleSettingsChange() {
      this._renderPathPreviewOnCanvas();
    },

    /**
      Handles changes in marker style settings.

      @method actions.onMarkerStyleSettingsChange
    */
    onMarkerStyleSettingsChange() {
      this._renderMarkerPreviewOnCanvas();
    }
  }
});
