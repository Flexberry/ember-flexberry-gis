/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/map-commands/search';
import { translationMacro as t } from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-search-map-command').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-search-map-command').
  @property {String} flexberryClassNames.searchDialog Component's dialog CSS-class name ('flexberry-search-map-command-dialog').
  @readonly
  @static

  @for SearchMapCommandComponent
*/
const flexberryClassNamesPrefix = 'flexberry-search-map-command';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix,
  searchAttributes: 'flexberry-search-attributes-map-command',
  searchClear: 'flexberry-search-clear-map-command',
  searchDialog: flexberryClassNamesPrefix + '-dialog'
};

/**
  Flexberry search map-command component.
  Component must be used in combination with {{#crossLink "FlexberryMaptoolbarComponent"}}flexberry-maptoolbar component{{/crossLink}}
  as a wrapper.

  Usage:
  templates/my-map-form.hbs
  ```handlebars
  {{#flexberry-maptoolbar leafletMap=leafletMap as |maptoolbar|}}
    {{map-commands/search execute=(action "onMapCommandExecute" target=maptoolbar)}}
  {{/flexberry-maptoolbar}}
  ```

  @class SearchMapCommandComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
let SearchMapCommandComponent = Ember.Component.extend({
  features: null,
  /**
    Additional properties for 'search' map-commands.

    @property _searchCommandProperties
    @type Object
    @default null
  */
  _searchCommandProperties: null,

  /**
    Flag: indicates whether search dialog has been already requested by user or not.

    @property _searchDialogHasBeenRequested
    @type boolean
    @default false
    @private
  */
  _searchDialogHasBeenRequested: false,

  /**
    Flag: indicates whether search dialog is visible or not.

    @property _searchDialogIsVisible
    @type boolean
    @default false
    @private
  */
  _searchDialogIsVisible: false,

  /**
    Event object from latest map-command's 'execute' action.

    @property _searchAttributesExecuteActionEventObject
    @type Object
    @default null
    @private
  */
  _searchAttributesExecuteActionEventObject: null,

  /**
    Event object for 'search-show' map-command's 'execute' action.

    @property _searchShowExecuteActionEventObject
    @type Object
    @default null
    @private
  */
  _searchShowExecuteActionEventObject: null,

  /**
    Flag: indicates whether search is in progress.

    @property _searchIsInProgress
    @type Boolean
    @default false
    @private
  */
  _searchIsInProgress: false,

  /**
    Flag: indicates whether to show search error message or not.

    @property _showSearchErrorMessage
    @type Boolean
    @readOnly
  */
  _showSearchErrorMessage: false,

  /**
    Search error message.

    @property _searchErrorMessage
    @type String
    @default null
    @private
  */
  _searchErrorMessage: null,

  /**
    Search results.
    Features array containing founded (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects].

    @property _foundedFeatures
    @type Object[]
    @default null
    @private
  */
  _foundedFeatures: null,

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
    Map command's additional CSS-class.

    @property class
    @type String
    @default null
  */
  class: null,

  /**
    Map command's caption.

    @property caption
    @type String
    @default t('components.map-commands.search.caption')
  */
  caption: t('components.map-commands.search.caption'),

  /**
    Map command's tooltip text.
    Will be added as wrapper's element 'title' attribute.

    @property tooltip
    @default t('components.map-commands.search.tooltip')
  */
  tooltip: t('components.map-commands.search.tooltip'),

  /**
    Map command's icon CSS-class names.

    @property iconClass
    @type String
    @default 'search icon'
  */
  iconClass: 'search icon',

  /**
    Map command's 'search-attributes' mode's additional CSS-class.

    @property searchAttributesClass
    @type String
    @default null
  */
  searchAttributesClass: null,

  /**
    Map command's 'search-attributes' mode's caption.

    @property searchAttributesCaption
    @type String
    @default t('components.map-commands.search.search-attributes.caption')
  */
  searchAttributesCaption: t('components.map-commands.search.search-attributes.caption'),

  /**
    Map command's 'search-attributes' mode's icon CSS-class.

    @property searchAttributesIconClass
    @type String
    @default 'search icon'
  */
  searchAttributesIconClass: 'search icon',

  /**
    Map command's 'search-clear' mode's additional CSS-class.

    @property searchClearClass
    @type String
    @default null
  */
  searchClearClass: null,

  /**
    Map command's 'search-clear' mode's caption.

    @property searchClearCaption
    @type String
    @default t('components.map-commands.search.search-clear.caption')
  */
  searchClearCaption: t('components.map-commands.search.search-clear.caption'),

  /**
    Map command's 'search-clear' mode's icon CSS-class.

    @property searchClearIconClass
    @type String
    @default 'trash icon'
  */
  searchClearIconClass: 'trash icon',

  actions: {
    /**
      Handles {{#crossLink "BaseMapCommandComponent/sendingActions.execute:method"}}base map-command's 'execute' action{{/crossLink}}.

      @method actions.onSearchAttributesMapCommandExecute
      @param {Object} e Base map-command's 'execute' action event-object.
    */
    onMapCommandButtonClick(e) {
      // Show dialog.
      this._showSearchDialog();
    },

    /**
      Handles {{#crossLink "BaseMapCommandComponent/sendingActions.execute:method"}}'search-clear' map-command's 'execute' action{{/crossLink}}.

      @method actions.onSearchAttributesMapCommandExecute
      @param {Object} e Base map-command's 'execute' action event-object.
    */
    onMapCommandButtonClearClick(e) {
      let leafletMap = this.get('leafletMap');
      let mapCommandName = 'search-clear';
      let mapCommandProperties = this.get('_searchCommandProperties');
      let mapCommandExecutionOptions = e;

      leafletMap.flexberryMap.commands.execute(mapCommandName, mapCommandProperties, mapCommandExecutionOptions);
    },

    /**
      Handles export dialog's 'approve' action.
      Invokes own {{#crossLink "ExportMapCommandComponent/sendingActions.execute:method"}}'execute' action{{/crossLink}}.

      @method actions.onExportDialogApprove
      @param {Object} e Action's event object.
    */
    onSearchDialogApprove(e) {
      e.closeDialog = false;
      let leafletMap = this.get('leafletMap');
      let mapCommandName = 'search-attributes';
      let mapCommandProperties = this.get('_searchCommandProperties');
      this.set('_searchIsInProgress', true);
      leafletMap.flexberryMap.commands.execute(mapCommandName, mapCommandProperties, e).then(res=> {
        res[0].features.then(result=> {
          this.set('_foundedFeatures', result);
          this.set('_searchIsInProgress', false);
        });
      });
    },

    /**
      Handles search dialog's 'showFoundedFeatures' action.

      @method actions.onSearchDialogShowFoundedFeatures
      @param {Object} e Action's event object.
    */
    onSearchDialogShowFoundedFeatures(e) {
      let leafletMap = this.get('leafletMap');
      let mapCommandName = 'search-show';
      let mapCommandProperties = this.get('_searchCommandProperties');
      let mapCommandExecutionOptions = e;
      this.set('features', leafletMap.flexberryMap.commands.execute(mapCommandName, mapCommandProperties, mapCommandExecutionOptions));
    }
  },

  /**
    Shows search dialog.

    @method _showSearchDialog
    @private
  */
  _showSearchDialog() {
    // Include dialog to markup.
    this.set('_searchDialogHasBeenRequested', true);

    // Show dialog.
    this.set('_searchDialogIsVisible', true);
  },

  /**
    Hides search dialog.

    @method _hideSearchDialog
    @private
  */
  _hideSearchDialog() {
    // Hide dialog.
    this.set('_searchDialogIsVisible', false);
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    this.set('_searchCommandProperties', {
      featuresLayer: new L.FeatureGroup()
    });
  },

  /**
    Destroys DOM-related component's properties & logic.
  */
  willDestroyElement() {
    this._super(...arguments);

    this._hideSearchDialog();
  },

  /**
    Destroys component.
  */
  willDestroy() {
    this._super(...arguments);

    this.get('_searchCommandProperties', null);
    this.set('_searchAttributesExecuteActionEventObject', null);
    this.set('_searchShowExecuteActionEventObject', null);
  }

  /**
    Component's action invoking when map-command must be executed.

    @method sendingActions.execute
    @param {Object} e Action's event object from
    {{#crossLink "BaseMapCommandComponent/sendingActions.execute:method"}}base map-command's 'execute' action{{/crossLink}}.
  */
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
SearchMapCommandComponent.reopenClass({
  flexberryClassNames
});

export default SearchMapCommandComponent;
