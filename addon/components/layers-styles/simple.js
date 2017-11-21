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
    Reference to 'layers-styles-renderer' servie.

    @property _layersStylesRenderer
    @type LayersStylesRendererService
    @private
  */
  _layersStylesRenderer: Ember.inject.service('layers-styles-renderer'),

  /**
    Reference to 'markers-styles-renderer' servie.

    @property _markersStylesRenderer
    @type MarkersStylesRendererService
    @private
  */
  _markersStylesRenderer: Ember.inject.service('markers-styles-renderer'),

  /**
    Available marlers-styles.
    Initializes in component's 'init' method.

    @property _availableMarkerStyles
    @type String[]
    @default null
    @private
  */
  _availableMarkerStyles: null,

  /**
    Available markers-styles captions.

    @property _availableMarkerStylesCaptions
    @type String[]
    @readonly
  */
  _availableMarkerStylesCaptions: Ember.computed('_availableMarkerStyles', 'i18n.locale', function() {
    let availableMarkerStyles = this.get('_availableMarkerStyles');

    let markerStylesCaptions = Ember.A();
    if (Ember.isArray(availableMarkerStyles) && availableMarkerStyles.length > 0) {
      let i18n = this.get('i18n');
      markerStylesCaptions.pushObjects(availableMarkerStyles.map((markerStyle) => {
        return i18n.t(`markers-styles.${markerStyle}.caption`);
      }));
    }

    return markerStylesCaptions;
  }),

  /**
    Selected markers-style caption.

    @property _selectedMarkerStyleCaption
    @type String
    @default null
    @private
  */
  _selectedMarkerStyleCaption: null,

  /**
    Observes changes in '_availableMarkerStylesCaptions' or 'styleSettings.style.marker.type' and computes '_selectedMarkerStyleCaption'.

    @method _availableLayerStylesCaptionsOrSelectedLayerStyleDidChange
    @private
  */
  _availableLayerStylesCaptionsOrSelectedLayerStyleDidChange: Ember.observer(
    '_availableMarkerStylesCaptions.[]',
    'styleSettings.style.marker.type',
    function() {
      let availableMarkerStyles = this.get('_availableMarkerStyles');
      let selectedMarkerStyle = this.get('styleSettings.style.marker.type');
      let selectedMarkerStyleIndex = availableMarkerStyles.findIndex((markerStyle) => {
        return selectedMarkerStyle === markerStyle;
      });

      if (selectedMarkerStyleIndex >= 0) {
        let markerStylesCaptions = this.get('_availableMarkerStylesCaptions');
        this.set('_selectedMarkerStyleCaption', markerStylesCaptions.objectAt(selectedMarkerStyleIndex));
      }
    }
  ),

  /**
    Observes changes in '_selectedMarkerStyleCaption' property and changes style type in related marker style settings hash.

    @method _selectedMarkerStyleCaptionDidChange
    @private
  */
  _selectedMarkerStyleCaptionDidChange: Ember.observer('_selectedMarkerStyleCaption', function () {
    Ember.run.once(this, '_setSelectedMarkerStyle');
  }),

  /**
    Sets selected markers-style by its i18n-ed caption.

    @method _setSelectedMarkerStyle
    @private
  */
  _setSelectedMarkerStyle() {
    let availableMarkerStyles = this.get('_availableMarkerStyles');
    let availableMarkerStylesCaptions = this.get('_availableMarkerStylesCaptions');
    let selectedMarkerStyleCaption = this.get('_selectedMarkerStyleCaption');

    if (!Ember.isArray(availableMarkerStyles) || !Ember.isArray(availableMarkerStylesCaptions) || Ember.isBlank(selectedMarkerStyleCaption)) {
      return null;
    }

    let selectedMarkerStyleIndex = availableMarkerStylesCaptions.findIndex((markerStylesCaption) => {
      return markerStylesCaption.toString() === selectedMarkerStyleCaption.toString();
    });

    let selectedMarkerStyle = selectedMarkerStyleIndex > -1 ?
      availableMarkerStyles.objectAt(selectedMarkerStyleIndex) :
      null;

    this.set('styleSettings.style.marker.type', selectedMarkerStyle);
  },

  /**
    Observes changes in 'styleSettings.style.marker.type' and computes default style setings.

    @method _selectedMarkerStyleDidChange
    @private
  */
  _selectedMarkerStyleDidChange: Ember.observer('styleSettings.style.marker.type', function() {
    Ember.run.once(this, '_setSelectedMarkerStyleDefaultSettings');
  }),

  /**
    Previosly selected layer style.

    @property _previouslySelectedMarkerStyle
    @type string
    @private
  */
  _previouslySelectedMarkerStyle: null,

  /**
    Sets default style settings with respect to 'styleSettings.style.marker.type'.

    @method _setSelectedMarkerStyleDefaultSettings
    @private
  */
  _setSelectedMarkerStyleDefaultSettings() {
    let previouslySelectedMarkerStyle = this.get('_previouslySelectedMarkerStyle');
    let selectedMarkerStyle = this.get('styleSettings.style.marker.type');
    if (Ember.isBlank(selectedMarkerStyle) || previouslySelectedMarkerStyle === selectedMarkerStyle) {
      return;
    }

    this.set('styleSettings.style.marker.style', this.get('_markersStylesRenderer').getDefaultStyleSettings(selectedMarkerStyle));
    this.set('_previouslySelectedMarkerStyle', selectedMarkerStyle);
  },

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
    Initializes component.
  */
  init() {
    this._super(...arguments);

    // Initialize available markers-styles and related properties.
    this.set('_previouslySelectedMarkerStyle', this.get('styleSettings.style.marker.type'));
    this.set('_availableMarkerStyles', this.get('_markersStylesRenderer').getAvailableMarkerStylesTypes());
    this._availableLayerStylesCaptionsOrSelectedLayerStyleDidChange();
  },

  /**
    Initializes DOM-related component's properties.
  */
  didInsertElement() {
    this._super(...arguments);

    // TODO: Rerender on each change in styleSettings nested properties.
    let pathPreviewCanvas = this.$('.ui.tab.segment[data-tab=path-tab] canvas')[0];
    this.get('_layersStylesRenderer').renderOnCanvas({ canvas: pathPreviewCanvas, styleSettings: this.get('styleSettings') });

    let markerPreviewCanvas = this.$('.ui.tab.segment[data-tab=marker-tab] canvas')[0];
    this.get('_markersStylesRenderer').renderOnCanvas({ canvas: markerPreviewCanvas, style: this.get('styleSettings.style.marker') });
  },

  /**
    Destroys DOM-related component's properties.
  */
  willDestroyElement() {
    this._super(...arguments);
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
    }
  }
});
