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

      @property _executeActionEventObject
      @type Object
      @default null
      @private
    */
    _executeActionEventObject: null,

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
      Map command's icon CSS-class names.

      @property iconClass
      @type String
      @default 'search icon'
    */
    iconClass: 'search icon',

    actions: {
      /**
        Handles {{#crossLink "BaseMapCommandComponent/sendingActions.execute:method"}}base map-command's 'execute' action{{/crossLink}}.

        @method actions.onMapCommandExecute
        @param {Object} e Base map-command's 'execute' action event-object.
      */
      onMapCommandExecute(e) {
        // Delay execution, but send action to initialize map-command.
        Ember.set(e, 'execute', false);
        this.sendAction('execute', e);

        // Remember event-object to execute command later (when dialog will be approved).
        this.set('_executeActionEventObject', e);

        // Show dialog.
        this._showSearchDialog();
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

        let executeActionEventObject = this.get('_executeActionEventObject');
        let mapCommand = Ember.get(executeActionEventObject, 'mapCommand');

        // Prevent export dialog from hiding until export will be completed.
        e.closeDialog = false;

        // Listen to map-command's 'execute' event & handle it.
        mapCommand.one('execute', (e) => {
          // Hide possibly shown error message.
          this.set('_showSearchErrorMessage', false);

          // Show delay indicator.
          this.set('_searchIsInProgress', true);

          e.executionResult.then((features) => {
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

      this.set('_executeActionEventObject', null);
    }

    /**
      Component's action invoking when map-command must be executed.

      @method sendingActions.execute
      @param {Object} e Action's event object from
      {{#crossLink "BaseMapCommandComponent/sendingActions.execute:method"}}base map-command's 'execute' action{{/crossLink}}.
    */
  }
);

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
SearchMapCommandComponent.reopenClass({
  flexberryClassNames
});

export default SearchMapCommandComponent;
