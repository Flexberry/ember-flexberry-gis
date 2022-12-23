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
    {{map-commands/export leafletMap=leafletMap}}
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

    @property showDownloadingFileSettings
    @type Boolean
    @default true
  */
  showDownloadingFileSettings: true,

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

  /**
   * Compare service. Disable before open map.
   */
  compare: Ember.inject.service(),

  /**
      Shows export dialog.

      @method _showExportDialog
      @private
    */
  _showExportDialog() {
    // Include dialog to markup.
    this.set('_exportDialogHasBeenRequested', true);

    // Show dialog.
    this.set('_exportDialogIsVisible', true);
  },

  actions: {
    onButtonClick(e) {
      let compare = this.get('compare');
      let timeout = 0;
      if (compare.get('compareLayersEnabled')) {
        Ember.set(compare, 'compareLayersEnabled', false);
        timeout = 500;
        let mapController = Ember.getOwner(this).lookup('controller:map');
        if (mapController) {
          mapController.send('showCompareSideBarEnd');
        }
      }

      Ember.run.later(() => {
        this._showExportDialog();
      }, timeout);
    },

    /**
      Handles export dialog's 'approve' action.
      Invokes own {{#crossLink "ExportMapCommandComponent/sendingActions.execute:method"}}'execute' action{{/crossLink}}.

      @method actions.onExportDialogApprove
      @param {Object} e Action's event object.
    */
    onExportDialogApprove(e) {
      this.set('_exportIsInProgress', true);
      e.closeDialog = false;
      let leafletMap = this.get('leafletMap');
      let mapCommandExecutionOptions = Ember.get(e, 'exportOptions');
      leafletMap.flexberryMap.commands.execute('export', null, mapCommandExecutionOptions).then(() => {
        this.set('_exportIsInProgress', false);
        e.closeDialog = true;
        this._hideExportDialog();
      });
    }
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
