/**
  @module ember-flexberry-gis
*/

import { isBlank } from '@ember/utils';

import { once } from '@ember/runloop';
import { A, isArray } from '@ember/array';
import { computed, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from '../templates/components/markers-styles-editor';

/**
  Component containing GUI for markers-styles editor.

  @class MarkersStylesEditorComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Component.extend({
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
  _markersStylesRenderer: service('markers-styles-renderer'),

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
  _availableMarkerStylesCaptions: computed('_availableMarkerStyles', 'i18n.locale', function () {
    const availableMarkerStyles = this.get('_availableMarkerStyles');

    const markerStylesCaptions = A();
    if (isArray(availableMarkerStyles) && availableMarkerStyles.length > 0) {
      const i18n = this.get('i18n');
      markerStylesCaptions.pushObjects(availableMarkerStyles.map((markerStyle) => i18n.t(`markers-styles.${markerStyle}.caption`)));
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
  _availableMarkerStylesCaptionsOrSelectedMarkerStyleDidChange: observer(
    '_availableMarkerStylesCaptions.[]',
    'styleSettings.type',
    function () {
      const availableMarkerStyles = this.get('_availableMarkerStyles');
      const selectedMarkerStyle = this.get('styleSettings.type');
      const selectedMarkerStyleIndex = availableMarkerStyles.findIndex((markerStyle) => selectedMarkerStyle === markerStyle);

      if (selectedMarkerStyleIndex >= 0) {
        const markerStylesCaptions = this.get('_availableMarkerStylesCaptions');
        this.set('_selectedMarkerStyleCaption', markerStylesCaptions.objectAt(selectedMarkerStyleIndex));
      }
    }
  ),

  /**
    Observes changes in '_selectedMarkerStyleCaption' property and changes style type in related marker style settings hash.

    @method _selectedMarkerStyleCaptionDidChange
    @private
  */
  _selectedMarkerStyleCaptionDidChange: observer('_selectedMarkerStyleCaption', function () {
    once(this, '_setSelectedMarkerStyle');
  }),

  /**
    Sets selected markers-style by its i18n-ed caption.

    @method _setSelectedMarkerStyle
    @private
  */
  _setSelectedMarkerStyle() {
    const availableMarkerStyles = this.get('_availableMarkerStyles');
    const availableMarkerStylesCaptions = this.get('_availableMarkerStylesCaptions');
    const selectedMarkerStyleCaption = this.get('_selectedMarkerStyleCaption');

    if (!isArray(availableMarkerStyles) || !isArray(availableMarkerStylesCaptions) || isBlank(selectedMarkerStyleCaption)) {
      return null;
    }

    const selectedMarkerStyleIndex = availableMarkerStylesCaptions.findIndex((markerStylesCaption) => markerStylesCaption
      .toString() === selectedMarkerStyleCaption.toString());

    const selectedMarkerStyle = selectedMarkerStyleIndex > -1
      ? availableMarkerStyles.objectAt(selectedMarkerStyleIndex)
      : null;

    this.set('styleSettings.type', selectedMarkerStyle);
  },

  /**
    Observes changes in 'styleSettings.style.marker.type' and computes default style setings.

    @method _selectedMarkerStyleDidChange
    @private
  */
  _selectedMarkerStyleDidChange: observer('styleSettings.type', function () {
    once(this, '_setSelectedMarkerStyleDefaultSettings');
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
    const previouslySelectedMarkerStyle = this.get('_previouslySelectedMarkerStyle');
    const selectedMarkerStyle = this.get('styleSettings.type');
    if (isBlank(selectedMarkerStyle) || previouslySelectedMarkerStyle === selectedMarkerStyle) {
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
    },
  },
});
