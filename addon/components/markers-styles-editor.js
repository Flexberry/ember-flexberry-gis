/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/markers-styles-editor';

/**
  Component containing GUI for markers-styles editor.

  @class MarkersStylesEditorComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    Component's wrapping <div> CSS-classes names.

    @property classNames
    @type String[]
    @default ['markers-styles-editor']
  */
  classNames: ['markers-styles-editor'],

  /**
    Hash containing style settings.

    @property styleSettings
    @type Object
    @default null
  */
  styleSettings: null,

  /**
    Reference to 'markers-styles-renderer' service.

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

    @method _availableMarkerStylesCaptionsOrSelectedMarkerStyleDidChange
    @private
  */
  _availableMarkerStylesCaptionsOrSelectedMarkerStyleDidChange: Ember.observer(
    '_availableMarkerStylesCaptions.[]',
    'styleSettings.type',
    function() {
      let availableMarkerStyles = this.get('_availableMarkerStyles');
      let selectedMarkerStyle = this.get('styleSettings.type');
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

    this.set('styleSettings.type', selectedMarkerStyle);
  },

  /**
    Observes changes in 'styleSettings.style.marker.type' and computes default style setings.

    @method _selectedMarkerStyleDidChange
    @private
  */
  _selectedMarkerStyleDidChange: Ember.observer('styleSettings.type', function() {
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
    let selectedMarkerStyle = this.get('styleSettings.type');
    if (Ember.isBlank(selectedMarkerStyle) || previouslySelectedMarkerStyle === selectedMarkerStyle) {
      return;
    }

    this.set('styleSettings', this.get('_markersStylesRenderer').getDefaultStyleSettings(selectedMarkerStyle));
    this.set('_previouslySelectedMarkerStyle', selectedMarkerStyle);

    this.send('onStyleSettingsChange');
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    // Initialize available markers-styles and related properties.
    this.set('_previouslySelectedMarkerStyle', this.get('styleSettings.type'));
    this.set('_availableMarkerStyles', this.get('_markersStylesRenderer').getAvailableMarkerStylesTypes());
    this._availableMarkerStylesCaptionsOrSelectedMarkerStyleDidChange();
  },

  actions: {
    /**
      Handles changes in marker style settings.

      @method actions.onStyleSettingsChange
    */
    onStyleSettingsChange() {
      this.sendAction('change', this.get('styleSettings'));
    }
  }
});
