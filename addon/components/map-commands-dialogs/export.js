/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/map-commands-dialogs/export';
import { translationMacro as t } from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-export-map-command-dialog').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name (null, because component is tagless).
  @readonly
  @static

  @for FlexberryExportMapCommandDialogComponent
*/
const flexberryClassNamesPrefix = 'flexberry-export-map-command-dialog';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null
};

/**
  Flexberry 'export' map-command modal dialog with [Semantic UI modal](http://semantic-ui.com/modules/modal.html) style.

  @class FlexberryExportMapCommandDialogComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
let FlexberryExportMapCommandDialogComponent = Ember.Component.extend({
    /**
      Available file types.

      @property _availableFileTypes
      @type String[]
      @default null
      @private
    */
    _availableFileTypes: null,

    /**
      Hash containing export options.

      @property _options
      @type Object
      @default null
      @private
    */
    _options: null,

    /**
      Flag: indicates whether map caption is defined or not.

      @property _hasCaption
      @type Boolean
      @readOnly
      @private
    */
    _hasCaption: Ember.computed('_options.caption', function() {
      return !Ember.isBlank(this.get('_options.caption'));
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
      @default t('components.map-commands-dialogs.export.caption')
    */
    caption: t('components.map-commands-dialogs.export.caption'),

    /**
      Component's caption in 'export-print' mode.

      @property printCaption
      @type String
      @default t('components.map-commands-dialogs.export.print-caption')
    */
    printCaption: t('components.map-commands-dialogs.export.print-caption'),

    /**
      Dialog's 'approve' button caption.

      @property approveButtonCaption
      @type String
      @default t('components.map-commands-dialogs.export.approve-button.caption')
    */
    approveButtonCaption: t('components.map-commands-dialogs.export.approve-button.caption'),

    /**
      Dialog's 'deny' button caption.

      @property denyButtonCaption
      @type String
      @default t('components.map-commands-dialogs.export.deny-button.caption')
    */
    denyButtonCaption: t('components.map-commands-dialogs.export.deny-button.caption'),

    /**
      Dialog's 'caption-segment' caption.

      @property captionSegmentCaption
      @type String
      @default t('components.map-commands-dialogs.export.caption-segment.caption')
    */
    captionSegmentCaption: t('components.map-commands-dialogs.export.caption-segment.caption'),

    /**
      Dialog's 'caption' textbox caption.

      @property captionTextboxCaption
      @type String
      @default t('components.map-commands-dialogs.export.caption-segment.caption-textbox.caption')
    */
    captionTextboxCaption: t('components.map-commands-dialogs.export.caption-segment.caption-textbox.caption'),

    /**
      Dialog's 'caption-font-name' textbox caption.

      @property captionFontNameTextboxCaption
      @type String
      @default t('components.map-commands-dialogs.export.caption-segment.font-name-textbox.caption')
    */
    captionFontNameTextboxCaption: t('components.map-commands-dialogs.export.caption-segment.font-name-textbox.caption'),

    /**
      Dialog's 'caption-font-size' textbox caption.

      @property captionFontSizeTextboxCaption
      @type String
      @default t('components.map-commands-dialogs.export.caption-segment.font-size-textbox.caption')
    */
    captionFontSizeTextboxCaption: t('components.map-commands-dialogs.export.caption-segment.font-size-textbox.caption'),

    /**
      Dialog's 'caption-font-color' textbox caption.

      @property captionFontColorTextboxCaption
      @type String
      @default t('components.map-commands-dialogs.export.caption-segment.font-color-textbox.caption')
    */
    captionFontColorTextboxCaption: t('components.map-commands-dialogs.export.caption-segment.font-color-textbox.caption'),

    /**
      Dialog's 'caption-x-coordinate' textbox caption.

      @property captionXCoordinateTextboxCaption
      @type String
      @default t('components.map-commands-dialogs.export.caption-segment.x-coordinate-textbox.caption')
    */
    captionXCoordinateTextboxCaption: t('components.map-commands-dialogs.export.caption-segment.x-coordinate-textbox.caption'),

    /**
      Dialog's 'caption-y-coordinate' textbox caption.

      @property captionYCoordinateTextboxCaption
      @type String
      @default t('components.map-commands-dialogs.export.caption-segment.y-coordinate-textbox.caption')
    */
    captionYCoordinateTextboxCaption: t('components.map-commands-dialogs.export.caption-segment.y-coordinate-textbox.caption'),

    /**
      Dialog's 'exclude-segment' caption.

      @property excludeSegmentCaption
      @type String
      @default t('components.map-commands-dialogs.export.exclude-segment.caption')
    */
    excludeSegmentCaption: t('components.map-commands-dialogs.export.exclude-segment.caption'),

    /**
      Dialog's 'exclude-zoom' checkbox caption.

      @property excludeZoomCheckboxCaption
      @type String
      @default t('components.map-commands-dialogs.export.exclude-segment.exclude-zoom-checkbox.caption')
    */
    excludeZoomCheckboxCaption: t('components.map-commands-dialogs.export.exclude-segment.exclude-zoom-checkbox.caption'),

    /**
      Dialog's 'exclude-contributing' checkbox caption.

      @property excludeContributingCheckboxCaption
      @type String
      @default t('components.map-commands-dialogs.export.exclude-segment.exclude-contributing-checkbox.caption')
    */
    excludeContributingCheckboxCaption: t('components.map-commands-dialogs.export.exclude-segment.exclude-contributing-checkbox.caption'),

    /**
      Dialog's 'download-segment' caption.

      @property downloadSegmentCaption
      @type String
      @default t('components.map-commands-dialogs.export.download-segment.caption')
    */
    downloadSegmentCaption: t('components.map-commands-dialogs.export.download-segment.caption'),

    /**
      Dialog's 'file-name' textbox caption.

      @property fileNameTextboxCaption
      @type String
      @default t('components.map-commands-dialogs.export.download-segment.file-name-textbox.caption')
    */
    fileNameTextboxCaption: t('components.map-commands-dialogs.export.download-segment.file-name-textbox.caption'),

    /**
      Dialog's 'file-type' dropdown caption.

      @property fileTypeDropdownCaption
      @type String
      @default t('components.map-commands-dialogs.export.download-segment.file-type-dropdown.caption')
    */
    fileTypeDropdownCaption: t('components.map-commands-dialogs.export.download-segment.file-type-dropdown.caption'),

    /**
      Dialog's 'error-message' caption.

      @property errorMessageCaption
      @type String
      @default t('components.map-commands-dialogs.export.error-message-caption')
    */
    errorMessageCaption: t('components.map-commands-dialogs.export.error-message-caption'),

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
      Flag: indicates whether to show download options or not.

      @property showDownloadOptions
      @type Boolean
      @default false
    */
    showDownloadOptions: false,

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

    actions: {
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
        Ember.set(e, 'exportOptions', this._getLeafletExportOptions());

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
      }
    },

    /**
      Returns inner options transformed into Leaflet.Export options.

      @method _getLeafletExportOptions
      @return {Object} Hash containing inner options transformed into Leaflet.Export options.
    */
    _getLeafletExportOptions() {
      let leafletExportOptions = {};
      let innerOptions = this.get('_options');

      let showDownloadOptions = this.get('showDownloadOptions');
      if (showDownloadOptions) {
        let fileName = Ember.get(innerOptions, 'fileName');
        if (Ember.isBlank(fileName)) {
          fileName = 'map';
        }

        let fileType = Ember.get(innerOptions, 'fileType');
        if (Ember.isBlank(fileType)) {
          fileType = 'PNG';
        }

        Ember.set(leafletExportOptions, 'fileName', `${fileName}.${fileType.toLowerCase()}`);
        Ember.set(leafletExportOptions, 'type', fileType);
      }

      if (this.get('_hasCaption')) {
        let captionOptions = {};

        let caption = Ember.get(innerOptions, 'caption');
        Ember.set(captionOptions, 'text', caption);

        let captionFontName = Ember.get(innerOptions, 'captionFontName');
        let captionFontSize = Ember.get(innerOptions, 'captionFontSize');
        Ember.set(captionOptions, 'font', `${Ember.isBlank(captionFontSize) ? '' : (captionFontSize + 'px')} ${captionFontName}`);

        let captionFontColor = Ember.get(innerOptions, 'captionFontColor');
        Ember.set(captionOptions, 'fillStyle', captionFontColor);

        let captionXCoordinate = Ember.get(innerOptions, 'captionXCoordinate');
        let captionYCoordinate = Ember.get(innerOptions, 'captionYCoordinate');
        Ember.set(captionOptions, 'position', [captionXCoordinate, captionYCoordinate]);

        Ember.set(leafletExportOptions, 'caption', captionOptions);
      }

      let exclude = [];
      let excludeZoom = Ember.get(innerOptions, 'excludeZoom');
      if (excludeZoom) {
        exclude.push('.leaflet-control-zoom');
      }

      let excludeContributing = Ember.get(innerOptions, 'excludeContributing');
      if (excludeContributing) {
        exclude.push('.leaflet-control-attribution');
      }

      Ember.set(leafletExportOptions, 'exclude', exclude);

      return leafletExportOptions;
    },

    /**
      Initializes component.
    */
    init() {
      this._super(...arguments);

      this.set('_availableFileTypes', Ember.A(['PNG', 'JPEG', 'JPG', 'GIF', 'BMP', 'TIFF', 'XICON', 'SVG', 'WEBP']));
      this.set('_options', {
        caption: '',
        captionFontName: 'Arial',
        captionFontSize: '30',
        captionFontColor: 'black',
        captionXCoordinate: '50',
        captionYCoordinate: '50',
        excludeZoom: true,
        excludeContributing: true,
        fileType: 'PNG',
        fileName: 'map'
      });
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
  }
);

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryExportMapCommandDialogComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryExportMapCommandDialogComponent;
