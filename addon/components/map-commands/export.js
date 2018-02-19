/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/map-commands/export';
import { translationMacro as t } from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-drag-map-tool').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-drag-map-tool').
  @readonly
  @static

  @for ExportMapCommandComponent
*/
const flexberryClassNamesPrefix = 'flexberry-export-map-command';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix,
  exportDownload: 'flexberry-export-download-map-command',
  exportPrint: 'flexberry-export-print-map-command',
  exportDialog: 'flexberry-export-map-command-dialog'
};

/**
  Flexberry export map-command component.
  Component must be used in combination with {{#crossLink "FlexberryMaptoolbarComponent"}}flexberry-maptoolbar component{{/crossLink}}
  as a wrapper.

  Usage:
  templates/my-map-form.hbs
  ```handlebars
  {{#flexberry-maptoolbar leafletMap=leafletMap as |maptoolbar|}}
    {{map-commands/export execute=(action "onMapCommandExecute" target=maptoolbar)}}
  {{/flexberry-maptoolbar}}
  ```

  @class ExportMapCommandComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses <a href="https://github.com/ciena-blueplanet/ember-block-slots#usage">SlotsMixin</a>
*/
let ExportMapCommandComponent = Ember.Component.extend({
    /**
      Flag: indicates whether export dialog has been already requested by user or not.

      @property _exportDialogHasBeenRequested
      @type boolean
      @default false
      @private
    */
    _exportDialogHasBeenRequested: false,

    /**
      Flag: indicates whether export dialog is visible or not.

      @property _exportDialogIsVisible
      @type boolean
      @default false
      @private
    */
    _exportDialogIsVisible: false,

    /**
      Flag: indicates whether to show downloading file settings or not.

      @property _showDownloadingFileSettings
      @type Boolean
      @default false
    */
    _showDownloadingFileSettings: false,

    /**
      Event object from latest 'execute' action for 'export-download' or 'export-print' mode.

      @property _executeActionEventObject
      @type Object
      @default null
      @private
    */
    _executeActionEventObject: null,

    /**
      Flag: indicates whether export is in progress.

      @property _exportIsInProgress
      @type Boolean
      @default false
      @private
    */
    _exportIsInProgress: false,

    /**
      Flag: indicates whether to show export error message or not.

      @property _showExportErrorMessage
      @type Boolean
      @readOnly
    */
    _showExportErrorMessage: false,

    /**
      Export error message.

      @property _exportErrorMessage
      @type String
      @default null
      @private
    */
    _exportErrorMessage: null,

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
      @default t('components.map-commands.export.caption')
    */
    caption: t('components.map-commands.export.caption'),

    /**
      Map command's tooltip text.
      Will be added as wrapper's element 'title' attribute.

      @property tooltip
      @default t('components.map-commands.export.tooltip')
    */
    tooltip: t('components.map-commands.export.tooltip'),

    /**
      Map command's icon CSS-class names.

      @property iconClass
      @type String
      @default 'file image outline icon'
    */
    iconClass: 'file image outline icon',

    /**
      Map command's 'export-download' mode's additional CSS-class.

      @property class
      @type String
      @default null
    */
    exportDownloadClass: null,

    /**
      Map command's 'export-download' mode's caption.

      @property exportDownloadCaption
      @type String
      @default t('components.map-commands.export.export-download.caption')
    */
    exportDownloadCaption: t('components.map-commands.export.export-download.caption'),

    /**
      Map command's 'export-download' mode's tooltip.

      @property exportDownloadTooltip
      @type String
      @default t('components.map-commands.export.export-download.tooltip')
    */
    exportDownloadTooltip: t('components.map-commands.export.export-download.tooltip'),

    /**
      Map command's 'export-download' mode's icon CSS-class names.

      @property iconClass
      @type String
      @default 'download icon'
    */
    exportDownloadIconClass: 'download icon',

    /**
      Map command's 'export-download' mode's additional CSS-class.

      @property class
      @type String
      @default null
    */
    exportPrintClass: null,

    /**
      Map command's 'export-download' mode's caption.

      @property caption
      @type String
      @default t('components.map-commands.export.export-print.caption')
    */
    exportPrintCaption: t('components.map-commands.export.export-print.caption'),

    /**
      Map command's 'export-print' mode's tooltip.

      @property exportPrintTooltip
      @type String
      @default t('components.map-commands.export.export-print.tooltip')
    */
    exportPrintTooltip: t('components.map-commands.export.export-print.tooltip'),

    /**
      Map command's 'export-download' mode's icon CSS-class names.

      @property iconClass
      @type String
      @default 'print icon'
    */
    exportPrintIconClass: 'print icon',

    /**
      Map caption that will be displayed on print/export preview by default.

      @property defaultMapCaption
      @type String
      @default ''
    */
    defaultMapCaption: '',

    /**
      Max timeout (in milliseconds) to wait for map's layers readiness before export.

      @property timeout
      @type Number
      @default 30000
    */
    timeout: 30000,

    actions: {
      /**
        Handles {{#crossLink "BaseMapCommandComponent/sendingActions.execute:method"}}base map-command's 'execute' action{{/crossLink}}.

        @method actions.onExportDownloadMapCommandExecute
        @param {Object} e Base map-command's 'execute' action event-object.
      */
      onExportDownloadMapCommandExecute(e) {
        this._showExportDialog({ isDownloadDialog: true, executeActionEventObject: e });
      },

      /**
        Handles {{#crossLink "BaseMapCommandComponent/sendingActions.execute:method"}}base map-command's 'execute' action{{/crossLink}}.

        @method actions.onExportDownloadMapCommandExecute
        @param {Object} e Base map-command's 'execute' action event-object.
      */
      onExportPrintMapCommandExecute(e) {
        this._showExportDialog({ isDownloadDialog: false, executeActionEventObject: e });
      },

      /**
        Handles export dialog's 'approve' action.
        Invokes own {{#crossLink "ExportMapCommandComponent/sendingActions.execute:method"}}'execute' action{{/crossLink}}.

        @method actions.onExportDialogApprove
        @param {Object} e Action's event object.
      */
      onExportDialogApprove(e) {
        let options = Ember.get(e, 'exportOptions');

        if (this.get('_exportIsInProgress')) {
          // Prevent new export until already executing export will be completed.
          e.closeDialog = false;
          return;
        }

        let mapCommand = this.get('_executeActionEventObject.mapCommand');
        if (Ember.isNone(mapCommand)) {
          return;
        }

        // Listen to map-command's 'execute' event & handle it.
        mapCommand.one('execute', (e) => {
          // Hide possibly shown error message.
          this.set('_showExportErrorMessage', false);

          // Show delay indicator.
          this.set('_exportIsInProgress', true);

          e.executionResult.then(() => {
            // Export successfully completed.
            // Hide delay indicator.
            this.set('_exportIsInProgress', false);

            // Hide dialog.
            this._hideExportDialog();
          }).catch((reason) => {
            // Export failed, so don't hide dialog.
            // Hide delay indicator.
            this.set('_exportIsInProgress', false);

            // Show error message.
            this.set('_showExportErrorMessage', true);
            this.set('_exportErrorMessage', (reason || 'Map export error').toString());
          });
        });

        // Prevent export dialog from hiding until export will be completed.
        e.closeDialog = false;

        // Set 'execute' flag to true, to force map-comand to be executed (not just initialized).
        let executeActionEventObject = this.get('_executeActionEventObject');
        Ember.set(executeActionEventObject, 'execute', true);

        this.sendAction('execute', options, executeActionEventObject);
      },

      /**
        Handles export dialog's 'deny' action.

        @method actions.onExportDialogDeny
        @param {Object} e Action's event object.
      */
      onExportDialogDeny(e) {
        // Prevent export dialog from hiding until already executing export will be completed.
        e.closeDialog = !this.get('_exportIsInProgress');
      },

      /**
        Handles export dialog's 'beforeHide' action.

        @method actions.onExportDialogBeforeHide
        @param {Object} e Action's event object.
      */
      onExportDialogBeforeHide(e) {
        // Prevent export dialog from hiding until already executing export will be completed.
        e.closeDialog = !this.get('_exportIsInProgress');
      },

      /**
        Handles export dialog's 'hide' action.

        @method actions.onExportDialogHide
        @param {Object} e Action's event object.
      */
      onExportDialogHide(e) {
        // Dialog is hidden.
        // Hide error message.
        this.set('_showExportErrorMessage', false);
      }
    },

    /**
      Shows export dialog.

      @method _showExportDialog
      @param {Object} [options] Method options.
      @param {Boolean} [options.isDownloadDialog] Flag: indicates whether dialog is in 'export-download' mode.
      @private
    */
    _showExportDialog(options) {
      options = options || {};

      let isDownloadDialog = Ember.get(options, 'isDownloadDialog');
      this.set('_showDownloadingFileSettings', isDownloadDialog);

      // Delay execution, but send action to initialize map-command.
      let executeActionEventObject = Ember.get(options, 'executeActionEventObject');
      Ember.set(executeActionEventObject, 'execute', false);
      this.sendAction('execute', executeActionEventObject);

      // Remember event-object to execute command later (when dialog will be approved).
      this.set('_executeActionEventObject', executeActionEventObject);

      // Include dialog to markup.
      this.set('_exportDialogHasBeenRequested', true);

      // Show dialog.
      this.set('_exportDialogIsVisible', true);
    },

    /**
      Hides export dialog.

      @method _hideExportDialog
      @private
    */
    _hideExportDialog() {
      // Hide dialog.
      this.set('_exportDialogIsVisible', false);
    },

    /**
      Destroys DOM-related component's properties & logic.
    */
    willDestroyElement() {
      this._super(...arguments);

      this._hideExportDialog();
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
ExportMapCommandComponent.reopenClass({
  flexberryClassNames
});

export default ExportMapCommandComponent;
