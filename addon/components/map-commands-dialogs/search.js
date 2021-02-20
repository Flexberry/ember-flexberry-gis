/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/map-commands-dialogs/search';
import { translationMacro as t } from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-search-map-command-dialog').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name (null, because component is tagless).
  @readonly
  @static

  @for FlexberrySearchMapCommandDialogComponent
*/
const flexberryClassNamesPrefix = 'flexberry-search-map-command-dialog';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null,
  settings: flexberryClassNamesPrefix + '-settings',
  results: flexberryClassNamesPrefix + '-results'
};

/**
  Flexberry 'search' map-command modal dialog with [Semantic UI modal](http://semantic-ui.com/modules/modal.html) style.

  @class FlexberrySearchMapCommandDialogComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
let FlexberrySearchMapCommandDialogComponent = Ember.Component.extend({
  /**
    Available layers.
  */
  _availableLayers: null,

  /**
    Available layers types.

    @property _availableLayersTypes
    @type String[]
    @default null
    @private
  */
  _availableLayersTypes: Ember.computed('_availableLayers.@each.type', function () {
    let availableLayers = this.get('_availableLayers');
    if (!Ember.isArray(availableLayers)) {
      return Ember.A();
    }

    return Ember.A(availableLayers.map((layer) => {
      return Ember.get(layer, 'type');
    }));
  }),

  /**
    Selected layer.

    @property _layer
    @type Object
    @default null
    @private
  */
  _selectedLayer: null,

  /**
    Flag: indicates whether selected layer's type is valid.

    @property _selectedLayerTypeIsValid
    @type Boolean
    @default null
    @private
  */
  _selectedLayerTypeIsValid: Ember.computed('_selectedLayer.type', '_availableLayersTypes', function () {
    let availableLayersTypes = this.get('_availableLayersTypes');
    if (!Ember.isArray(availableLayersTypes)) {
      return false;
    }

    return availableLayersTypes.contains(this.get('_selectedLayer.type'));
  }),

  /**
    Selected layer features properties excluded from being displayed in search results table.

    @property _selectedLayerFeaturesExcludedProperties
    @type String[]
    @readOnly
    @private
  */
  _selectedLayerFeaturesExcludedProperties: Ember.computed(
    '_selectedLayer.settingsAsObject.displaySettings.featuresPropertiesSettings.excludedProperties',
    function () {
      let excludedProperties = Ember.A(
        this.get('_selectedLayer.settingsAsObject.displaySettings.featuresPropertiesSettings.excludedProperties') || []);
      return excludedProperties;
    }
  ),

  /**
    Selected layer features localized properties to being displayed in search results table.

    @property _selectedLayerFeaturesLocalizedProperties
    @type String[]
    @readOnly
    @private
  */
  _selectedLayerFeaturesLocalizedProperties: Ember.computed(
    '_selectedLayer.settingsAsObject.displaySettings.featuresPropertiesSettings.localizedProperties',
    'i18n.locale',
    function () {
      let currentLocale = this.get('i18n.locale');
      let localizedProperties = this.get(
        `_selectedLayer.settingsAsObject.displaySettings.` +
        `featuresPropertiesSettings.localizedProperties.${currentLocale}`) || {};
      return localizedProperties;
    }
  ),

  /**
    Array containing available layers & cached search options related to them.

    @property _availableLayersOptions
    @type Object[]
    @default null
    @private
  */
  _availableLayersOptions: null,

  /**
    Hash containing search options related to currently selected layer.

    @property _options
    @type Object
    @default null
    @private
  */
  _options: null,

  /**
    Flag: indicates whether some founded features are defined or not.

    @property _hasFoundedFeatures
    @type Boolean
    @readOnly
    @private
  */
  _hasFoundedFeatures: Ember.computed('foundedFeatures', function () {
    return Ember.isArray(this.get('foundedFeatures'));
  }),

  /**
    Flag: indicates whether all founded features contains '_selected' flag setted to 'true'.

    @property _allFoundedFeaturesAreSelected
    @type Boolean
    @default false
    @private
  */
  _allFoundedFeaturesAreSelected: Ember.computed('foundedFeatures.@each._selected', function () {
    let foundedFeatures = this.get('foundedFeatures');
    if (!Ember.isArray(foundedFeatures)) {
      return false;
    }

    return foundedFeatures.every((feature) => {
      return Ember.get(feature, '_selected') === true;
    });
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
    is empty to disable component's wrapping <div>.

    @property tagName
    @type String
    @default ''
  */
  tagName: '',

  /**
    Component's additional CSS-class names.

    @property class
    @type String
    @default null
  */
  class: null,

  /**
    Component's caption.

    @property caption
    @type String
    @default t('components.map-commands-dialogs.search.caption')
  */
  caption: t('components.map-commands-dialogs.search.caption'),

  /**
    Dialog's 'approve' button caption.

    @property approveButtonCaption
    @type String
    @default t('components.map-commands-dialogs.search.approve-button.caption')
  */
  approveButtonCaption: t('components.map-commands-dialogs.search.approve-button.caption'),

  /**
    Dialog's 'deny' button caption.

    @property denyButtonCaption
    @type String
    @default t('components.map-commands-dialogs.search.deny-button.caption')
  */
  denyButtonCaption: t('components.map-commands-dialogs.search.deny-button.caption'),

  /**
    Dialog's 'caption' textbox caption.

    @property layersDropdownCaption
    @type String
    @default t('components.map-commands-dialogs.search.layers-dropdown.caption')
  */
  layersDropdownCaption: t('components.map-commands-dialogs.search.layers-dropdown.caption'),

  /**
    Dialog's 'error-message' caption.

    @property errorMessageCaption
    @type String
    @default t('components.map-commands-dialogs.search.error-message-caption')
  */
  errorMessageCaption: t('components.map-commands-dialogs.search.error-message-caption'),

  /**
    Dialog's 'founded-features' segment's caption.

    @property foundedFeaturesSegmentCaption
    @type String
    @default t('components.map-commands-dialogs.search.founded-features-segment.caption')
  */
  foundedFeaturesSegmentCaption: t('components.map-commands-dialogs.search.founded-features-segment.caption'),

  /**
    Dialog's 'founded-features' segment's 'nothing-founded' message.

    @property foundedFeaturesSegmentNothingFoundMessage
    @type String
    @default t('components.map-commands-dialogs.search.founded-features.nothing-found-message')
  */
  foundedFeaturesSegmentNothingFoundMessage: t('components.map-commands-dialogs.search.founded-features-segment.nothing-found-message'),

  /**
    Flag: indicates whether dialog is visible or not.
    If true, then dialog will be shown, otherwise dialog will be closed.

    @property visible
    @type Boolean
    @default false
  */
  visible: false,

  /**
    Flag: indicates whether export dialog is busy or not.

    @type Boolean
    @default false
    @readOnly
    @private
  */
  isBusy: false,

  /**
    Flag: indicates whether to show error message or not.

    @property showErrorMessage
    @type Boolean
    @readOnly
  */
  showErrorMessage: false,

  /**
    Error message.

    @property errorMessage
    @type String
    @default null
  */
  errorMessage: null,

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
    Search results.
    Features array containing founded (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects].

    @property foundedFeatures
    @type Object[]
    @default null
    @private
  */
  foundedFeatures: null,

  actions: {
    onLayersDropdownLayerChange(selectedLayer) {
      this.set('_selectedLayer', selectedLayer);
    },

    onLayersDropdownAvailableLayersChange(availableLayers) {
      this.set('_availableLayers', availableLayers);

      if (Ember.isNone(this.get('_selectedLayer')) && Ember.isArray(availableLayers) && availableLayers.length > 0) {
        this.set('_selectedLayer', availableLayers[0]);
      }

      let availableLayersOptions = this.get('_availableLayersOptions');
      if (!Ember.isArray(availableLayersOptions)) {
        availableLayersOptions = Ember.A();
      }

      if (!Ember.isArray(availableLayers)) {
        return;
      }

      // Align cached search options to current state of available layers array.
      // If cache is empty it will be generated.
      let newAvailableLayerOptions = Ember.A();
      let owner = Ember.getOwner(this);
      availableLayers.forEach((availableLayer) => {
        let alreadyExistingOptions = null;
        let alreadyExistingFoundedFeatures = null;

        availableLayersOptions.forEach(({ layer, options, foundedFeatures }) => {
          if (layer === availableLayer) {
            alreadyExistingOptions = options;
            alreadyExistingFoundedFeatures = foundedFeatures;
            return false;
          }
        });

        if (!Ember.isNone(alreadyExistingOptions)) {
          newAvailableLayerOptions.pushObject({
            layer: availableLayer,
            options: alreadyExistingOptions,
            foundedFeatures: alreadyExistingFoundedFeatures
          });
        } else {
          let availableLayerClass = owner.knownForType('layer', Ember.get(availableLayer, 'type'));
          newAvailableLayerOptions.pushObject({
            layer: availableLayer,
            options: availableLayerClass.createSearchSettings(),
            foundedFeatures: null
          });
        }
      });

      this.set('_availableLayersOptions', newAvailableLayerOptions);
    },

    /**
      Handler for error 'ui-message. component 'onShow' action.

      @method actions.onErrorMessageShow
    */
    onErrorMessageShow() {
    },

    /**
      Handler for error 'ui-message' component 'onHide' action.

      @method actions.onErrorMessageHide
    */
    onErrorMessageHide() {
      this.set('showErrorMessage', false);
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.approve:method"}}'flexberry-dialog' component's 'approve' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryExportMapCommandDialogComponent/sendingActions.approve:method"}}'approve' action{{/crossLink}}.

      @method actions.onApprove
    */
    onApprove(e) {
      let selectedLayer = this.get('_selectedLayer');
      if (Ember.isNone(e)) {
        e = {};
      }

      if (Ember.isNone(selectedLayer)) {
        this.set('errorMessage', this.get('i18n').t('components.map-commands-dialogs.search.error-message-empty-selected-layer'));
        this.set('showErrorMessage', true);
        Ember.set(e, 'closeDialog', false);

        return;
      }

      Ember.set(e, 'layer', this.get('_selectedLayer'));
      Ember.set(e, 'searchOptions', this.get('_options'));

      this.sendAction('approve', e);
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.deny:method"}}'flexberry-dialog' component's 'deny' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryExportMapCommandDialogComponent/sendingActions.deny:method"}}'deny' action{{/crossLink}}.

      @method actions.onDeny
    */
    onDeny(e) {
      this.sendAction('deny', e);
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.beforeShow:method"}}'flexberry-dialog' component's 'beforeShow' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryExportMapCommandDialogComponent/sendingActions.beforeShow:method"}}'beforeShow' action{{/crossLink}}.

      @method actions.onBeforeShow
    */
    onBeforeShow(e) {
      this.sendAction('beforeShow', e);
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.beforeHide:method"}}'flexberry-dialog' component's 'beforeHide' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryExportMapCommandDialogComponent/sendingActions.beforeHide:method"}}'beforeHide' action{{/crossLink}}.

      @method actions.onBeforeHide
    */
    onBeforeHide(e) {
      this.sendAction('beforeHide', e);
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.show:method"}}'flexberry-dialog' component's 'show' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryExportMapCommandDialogComponent/sendingActions.show:method"}}'show' action{{/crossLink}}.

      @method actions.onShow
    */
    onShow(e) {
      this.sendAction('show', e);
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.hide:method"}}'flexberry-dialog' component's 'hide' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryExportMapCommandDialogComponent/sendingActions.hide:method"}}'hide' action{{/crossLink}}.

      @method actions.onHide
    */
    onHide(e) {
      this.sendAction('hide', e);
      this.set('foundedFeatures', []);
      this.set('_selectedLayer', []);
      this.set('_options', {
        localizedValue: '',
        propertyName: '',
        queryString: ''
      });
    },

    /**
      Handles 'select-all-features' checkboxes 'change' action.
      Selects/deselects all founded features & checkboxes related to them.

      @method actions.onSelectAllFeaturesCheckboxChange
      @param {Object} e Actions event-object.
      @param {Boolean} e.newValue Checkboxes new value.
    */
    onSelectAllFeaturesCheckboxChange(e) {
      let foundedFeatures = this.get('foundedFeatures');
      if (!Ember.isArray(foundedFeatures)) {
        return;
      }

      // Select all founded features.
      foundedFeatures.forEach((feature) => {
        Ember.set(feature, '_selected', e.newValue);
      });
    },

    /**
      Handles 'select-feature' checkbox 'change' action.
      Selects/deselects founded feature related to checkbox.

      @method actions.onSelectFeatureCheckboxChange
      @param {Number} featureIndex Index of selected/deselected feature in 'foundedFeatures' array.
      @param {Object} e Actions event-object.
      @param {Boolean} e.newValue Checkboxes new value.
    */
    onSelectFeatureCheckboxChange(featureIndex, e) {
      let foundedFeatures = this.get('foundedFeatures');
      if (!Ember.isArray(foundedFeatures)) {
        return;
      }

      Ember.set(foundedFeatures[featureIndex], '_selected', e.newValue);
    },

    /**
      Handles 'show-all-selected-features' button's 'click' action.
      Shows selected features on map.

      @method actions.onShowAllFeaturesButtonClick
    */
    onShowAllFeaturesButtonClick() {
      let foundedFeatures = this.get('foundedFeatures');
      if (!Ember.isArray(foundedFeatures)) {
        return;
      }

      // Show all selected features.
      let features = foundedFeatures.filter((feature) => {
        return Ember.get(feature, '_selected') === true;
      });

      this._showFoundedFeatures(features, this.get('_selectedLayer'));
    },

    /**
      Handles 'show-selected-feature' button's 'click' action.
      Shows feature with the specified index.

      @method actions.onShowFeatureButtonClick
      @param {Number} featureIndex Index of the specified feature in 'foundedFeatures' array.
    */
    onShowFeatureButtonClick(featureIndex) {
      let foundedFeatures = this.get('foundedFeatures');
      if (!Ember.isArray(foundedFeatures)) {
        return;
      }

      let features = [foundedFeatures[featureIndex]];
      this._showFoundedFeatures(features, this.get('_selectedLayer'));
    }
  },

  /**
    Observer changes in available layers & in selected layer.
    Retrieves search options related to selected layer fro cache & remember them as current.

    @method _availableOrSelectedLayerDidChange
    @private
  */
  _availableOrSelectedLayerDidChange: Ember.observer('_availableLayersOptions.[]', '_selectedLayer', function () {
    let selectedLayerSearchOptions = {};
    let selectedLayerFoundedFeatures = null;

    let availableLayersOptions = this.get('_availableLayersOptions');
    let selectedLayer = this.get('_selectedLayer');
    if (Ember.isArray(availableLayersOptions) && !Ember.isNone(selectedLayer)) {
      availableLayersOptions.forEach(({ layer, options, foundedFeatures }) => {
        if (layer === selectedLayer) {
          selectedLayerSearchOptions = options;
          selectedLayerFoundedFeatures = foundedFeatures;
          return false;
        }
      });
    }

    // For some reason '_options' as computed property doesn't take an effect, thats why we use these observer method.
    this.set('_options', selectedLayerSearchOptions);
    this.set('foundedFeatures', selectedLayerFoundedFeatures);
  }),

  /**
    Observes changes in founded features.
    Caches them in cache related to selected layer.

    @method _foundedFeaturesDidChange
    @private
  */
  _foundedFeaturesDidChange: Ember.observer('foundedFeatures', function () {
    let availableLayersOptions = this.get('_availableLayersOptions');
    let selectedLayer = this.get('_selectedLayer');

    if (Ember.isArray(availableLayersOptions) && !Ember.isNone(selectedLayer)) {
      availableLayersOptions.forEach((cachedEntry) => {
        if (Ember.get(cachedEntry, 'layer') === selectedLayer) {
          let dateFormat = Ember.get(selectedLayer, 'settingsAsObject.displaySettings.dateFormat');
          if (!Ember.isEmpty(dateFormat)) {
            this.get('foundedFeatures').forEach((feature) => {
              let featureProperties = Ember.get(feature, 'properties') || {};

              for (var prop in featureProperties) {
                let value = featureProperties[prop];
                if (value instanceof Date && !Ember.isNone(value) && !Ember.isEmpty(value) && !Ember.isEmpty(dateFormat)) {
                  featureProperties[prop] = moment(value).format(dateFormat);
                }
              }
            });
          }

          Ember.set(cachedEntry, 'foundedFeatures', this.get('foundedFeatures'));
          return false;
        }
      });
    }
  }),

  /**
    Shows specified features on map.

    @method _showFoundedFeatures
    @param {Object[]} features Specified features that must be shown on map.
    @private
  */
  _showFoundedFeatures(features, layer) {
    if (!Ember.isArray(features) || Ember.get(features, 'length') === 0) {
      return;
    }

    this.sendAction('showFoundedFeatures', {
      features: features,
      layer: layer
    });

    // Hide dialog.
    this.set('visible', false);
  },

  /**
    Filter method for available layers.

    @method _layerCanBeSearched
    @param {Object} layer Layer which must be checked for 'search' operation availability for it.
    @return {Boolean} Flag: indicates whether 'search' operation is available for the specified layer.
    @private
  */
  _layerCanBeSearched(layer) {
    return Ember.get(layer, 'canBeSearched');
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    this.set('_options', {});
  }

  /**
    Component's action invoking when dialog starts to show.

    @method sendingActions.beforeShow
  */

  /**
    Component's action invoking when dialog starts to hide.

    @method sendingActions.beforeHide
  */

  /**
    Component's action invoking when dialog is shown.

    @method sendingActions.show
  */

  /**
    Component's action invoking when dialog is hidden.

    @method sendingActions.hide
  */

  /**
    Component's action invoking when dialog is approved.

    @method sendingActions.approve
  */

  /**
    Component's action invoking when dialog is denied.

    @method sendingActions.deny
  */

  /**
    Component's action invoking when dialog wants to show founded features on map.

    @method sendingActions.showFoundedFeatures
    @param {Object} e Action's event-object.
    @param {Object[]} e.features Founded features to show.
  */
}
);

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberrySearchMapCommandDialogComponent.reopenClass({
  flexberryClassNames
});

export default FlexberrySearchMapCommandDialogComponent;
