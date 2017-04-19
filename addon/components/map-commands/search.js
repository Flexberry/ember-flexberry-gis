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
    onSearchAttributesMapCommandExecute(e) {
      // Delay execution, but send action to initialize map-command.
      Ember.set(e, 'execute', false);
      this.sendAction('execute', e);

      // Remember event-object to execute command later (when dialog will be approved).
      this.set('_searchAttributesExecuteActionEventObject', e);

      // Show dialog.
      this._showSearchDialog();
    },

    /**
      Handles {{#crossLink "BaseMapCommandComponent/sendingActions.execute:method"}}'search-clear' map-command's 'execute' action{{/crossLink}}.

      @method actions.onSearchAttributesMapCommandExecute
      @param {Object} e Base map-command's 'execute' action event-object.
    */
    onSearchClearMapCommandExecute(e) {
      this.sendAction('execute', e);
    },

    /**
      Handles export dialog's 'approve' action.
      Invokes own {{#crossLink "ExportMapCommandComponent/sendingActions.execute:method"}}'execute' action{{/crossLink}}.

      @method actions.onExportDialogApprove
      @param {Object} e Action's event object.
    */
    onSearchDialogApprove(e) {
      if (this.get('_searchIsInProgress')) {
        // Prevent new search until already executing search will be completed.
        e.closeDialog = false;
        return;
      }

      let executeActionEventObject = this.get('_searchAttributesExecuteActionEventObject');
      let mapCommand = Ember.get(executeActionEventObject, 'mapCommand');

      // Prevent export dialog from hiding until export will be completed.
      e.closeDialog = false;

      // Listen to map-command's 'execute' event & handle it.
      mapCommand.one('execute', (e) => {
        // Hide possibly shown error message.
        this.set('_showSearchErrorMessage', false);

        // Show delay indicator.
        this.set('_searchIsInProgress', true);

        // here we have only one search results
        e.executionResult.get('firstObject.features').then((features) => {

          this.set('_foundedFeatures', features);

          // Search successfully completed.
          // Hide delay indicator.
          this.set('_searchIsInProgress', false);
        }).catch((reason) => {
          this.set('_foundedFeatures', null);

          // Search failed, so don't hide dialog.
          // Hide delay indicator.
          this.set('_searchIsInProgress', false);

          // Show error message.
          this.set('_showSearchErrorMessage', true);
          this.set('_searchErrorMessage', (reason || 'Search error').toString());
        });
      });

      // Clean up results of previous search.
      this.set('_foundedFeatures', null);

      // Map toolbar will catch action, call to map-command's 'execute' method, then 'execute' event will be triggered.
      Ember.set(executeActionEventObject, 'execute', true);
      this.sendAction('execute', e, executeActionEventObject);
    },

    /**
      Handles export dialog's 'deny' action.

      @method actions.onSearchDialogDeny
      @param {Object} e Action's event object.
    */
    onSearchDialogDeny(e) {
      // Prevent export dialog from hiding until already executing search will be completed.
      e.closeDialog = !this.get('_searchIsInProgress');
    },

    /**
      Handles search dialog's 'hide' action.

      @method actions.onSearchDialogHide
      @param {Object} e Action's event object.
    */
    onSearchDialogHide(e) {
      // Dialog is hidden.
      // Hide error message.
      this.set('_showSearchErrorMessage', false);
    },

    /**
      Handles search dialog's 'showFoundedFeatures' action.

      @method actions.onSearchDialogShowFoundedFeatures
      @param {Object} e Action's event object.
      @param {Object[]} e.features Founded features to show.
    */
    onSearchDialogShowFoundedFeatures(e) {
      let executeActionEventObject = this.get('_searchShowExecuteActionEventObject');

      // Initialize & remember 'execute' action's event-object for 'search-show' map-command,
      // if it isn't initialized yet.
      if (Ember.isNone(executeActionEventObject)) {
        executeActionEventObject = {
          mapCommand: null,
          target: null,
          originalEvent: null
        };

        let mapCommand = Ember.getOwner(this).lookup('map-command:search-show');
        Ember.assert(
          `Can't lookup \`map-command:search-show\` such map-command doesn\`t exist`,
          !Ember.isNone(mapCommand));

        let mapCommandProperties = this.get('_searchCommandProperties');
        if (!Ember.isNone(mapCommandProperties)) {
          Ember.A(Object.keys(mapCommandProperties)).forEach((propertyName) => {
            Ember.set(mapCommand, propertyName, Ember.get(mapCommandProperties, propertyName));
          });
        }

        Ember.set(executeActionEventObject, 'mapCommand', mapCommand);
        this.set('_searchShowExecuteActionEventObject', executeActionEventObject);
      }

      Ember.$.extend(executeActionEventObject, e);
      this.sendAction('execute', executeActionEventObject);
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
