/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import FlexberyMapActionsHandlerMixin from '../../mixins/flexberry-map-actions-handler';
import layout from '../../templates/components/map-commands-dialogs/export';

/**
  Constant representing dependency between element height and font size in pixels.
*/
const fontSizeScaleFactor = 1.4;

/**
  Constants representing default print/eport options.
*/
const defaultOptions = {
  caption: '',
  captionFontFamily: 'Times New Roman',
  captionFontSize: '14',
  captionFontColor: '#000000',
  captionFontWeight: 'normal',
  captionFontStyle: 'normal',
  captionFontDecoration: 'none',
  displayMode: 'standard-mode',
  fileType: 'PNG',
  fileName: 'map'
};

/**
  Constant representing dialog content's style (see styles/components/map-commands-dialogs/export.scss).
*/
const contentStyle = {
  height: 400,
  padding: 14
};

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
  wrapper: null,
  settingsColumn: flexberryClassNamesPrefix + '-settings-column',
  previewColumn: flexberryClassNamesPrefix + '-preview-column',
  sheetOfPaper: flexberryClassNamesPrefix + '-sheet-of-paper',
  sheetOfPaperMapCaption: flexberryClassNamesPrefix + '-sheet-of-paper-map-caption',
  sheetOfPaperMap: flexberryClassNamesPrefix + '-sheet-of-paper-map'
};

/**
  Flexberry 'export' map-command modal dialog with [Semantic UI modal](http://semantic-ui.com/modules/modal.html) style.

  @class FlexberryExportMapCommandDialogComponent
  @uses FlexberyMapActionsHandlerMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
let FlexberryExportMapCommandDialogComponent = Ember.Component.extend(FlexberyMapActionsHandlerMixin, {
  /**
    Tabular menu tabs items placed on dialog's settings block.

    @property _$tabularMenuTabItems
    @type <a href="http://learn.jquery.com/using-jquery-core/jquery-object/">jQuery-object</a>
    @default null
    @private
  */
  _$tabularMenuTabItems: null,

  /**
    Tabular menu tabs placed on dialog's settings block.

    @property _$tabularMenuTabs
    @type <a href="http://learn.jquery.com/using-jquery-core/jquery-object/">jQuery-object</a>
    @default null
    @private
  */
  _$tabularMenuTabs: null,

  /**
    Tabular menu clicked tab.

    @property _tabularMenuClickedTab
    @type {String}
    @default null
    @private
  */
  _tabularMenuClickedTab: null,

  /**
    Tabular menu active tab.

    @property _activeSettingsTab
    @type {String}
    @default 'caption'
    @private
  */
  _tabularMenuActiveTab: Ember.computed('_tabularMenuClickedTab', 'showDownloadingFileSettings', function() {
    let tabularMenuDefaultTab = 'caption';
    let tabularMenuClickedTab = this.get('_tabularMenuClickedTab') || tabularMenuDefaultTab;
    let showDownloadingFileSettings = this.get('showDownloadingFileSettings');

    // Activate default tab if 'downloading-file' tab is active, but showDownloadingFileSettings is false.
    return tabularMenuClickedTab === 'downloading-file' && !showDownloadingFileSettings ? tabularMenuDefaultTab : tabularMenuClickedTab;
  }),

  /**
    Available font families.

    @property _availableFontFamilies
    @type String[]
    @default null
    @private
  */
  _availableFontFamilies: null,

  /**
    Available font sizes.

    @property _availableFontSizes
    @type String[]
    @default null
    @private
  */
  _availableFontSizes: null,

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
    Map caption height related to user-defined font settings.

    @property _mapCaptionHeight
    @type String
    @private
    @readOnly
  */
  _mapCaptionHeight: Ember.computed('_options.captionFontSize', function() {
    return Math.round((this.get('_options.captionFontSize') || defaultOptions.captionFontSize) * fontSizeScaleFactor);
  }),

  /**
    Map caption style related to user-defined font settings.

    @property _mapCaptionStyle
    @type String
    @private
    @readOnly
  */
  _mapCaptionStyle: Ember.computed(
    '_options.captionFontFamily',
    '_options.captionFontSize',
    '_options.captionFontColor',
    '_options.captionFontWeight',
    '_options.captionFontStyle',
    '_options.captionFontDecoration', function() {
      return Ember.String.htmlSafe(
        `font-family: "${this.get('_options.captionFontFamily')}"; ` +
        `font-size: ${this.get('_options.captionFontSize')}px; ` +
        `font-weight: ${this.get('_options.captionFontWeight')}; ` +
        `font-style: ${this.get('_options.captionFontStyle')}; ` +
        `text-decoration: ${this.get('_options.captionFontDecoration')}; ` +
        `color: ${this.get('_options.captionFontColor')}; ` +
        `height: ${this.get('_mapCaptionHeight')}px;`);
    }
  ),

  /**
    Map style related to user-defined font settings.

    @property _mapStyle
    @type String
    @private
    @readOnly
  */
  _mapStyle: Ember.computed('_options.captionFontSize', '_options.displayMode', function() {
    if (this.get('_options.displayMode') === 'map-only-mode') {
      return ``;
    }

    return Ember.String.htmlSafe(`height: ${contentStyle.height - contentStyle.padding * 5 - this.get('_mapCaptionHeight')}px;`);
  }),

  /**
    Flag: indicates whether print/export dialog is already rendered.

    @property _isDialogAlreadyRendered
    @type Boolean
    @default null
    @private
  */
  _isDialogAlreadyRendered: false,

  /**
    Preview leaflet map.

    @property _previewLeafletMap
    @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
    @default null
    @private
  */
  _previewLeafletMap: null,

  /**
    Main leaflet map.

    @property leafletMap
    @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
    @default null
  */
  leafletMap: null,

  /**
    Map layers hierarchy.

    @property layers
    @type Object[]
    @default null
  */
  layers: null,

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
    Component's additional CSS-class names.

    @property class
    @type String
    @default null
  */
  class: null,

  /**
    Overridden ['tagName'](http://emberjs.com/api/classes/Ember.Component.html#property_tagName)
    is empty to disable component's wrapping <div>.

    @property tagName
    @type String
    @default ''
  */
  tagName: '',

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
    Flag: indicates whether to show downloading file settings or not.

    @property showDownloadingFileSettings
    @type Boolean
    @default false
  */
  showDownloadingFileSettings: false,

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
    Map caption that will be displayed on print/export preview by default.

    @property defaultMapCaption
    @type String
    @default null
  */
  defaultMapCaption: null,

  actions: {
    /**
      Handler for settings tabs 'click' action.

      @method actions.onSettingsTabClick
      @param {Object} e Click event-object.
    */
    onSettingsTabClick(e) {
      let $clickedTab = Ember.$(e.currentTarget);
      if ($clickedTab.hasClass('disabled')) {
        // Prevent disabled tabs from being activated.
        e.stopImmediatePropagation();

        return;
      }

      // Remember currently clicked tab.
      this.set('_tabularMenuClickedTab', $clickedTab.attr('data-tab'));
    },

    /**
      Handler for bold font button's 'click' action.

      @method actions.onBoldFontButtonClick
    */
    onBoldFontButtonClick() {
      let previousFontWeight = this.get('_options.captionFontWeight');
      this.set('_options.captionFontWeight', previousFontWeight !== 'bold' ? 'bold' : 'normal');
    },

    /**
      Handler for italic font button's 'click' action.

      @method actions.onItalicFontButtonClick
    */
    onItalicFontButtonClick() {
      let previousFontWeight = this.get('_options.captionFontStyle');
      this.set('_options.captionFontStyle', previousFontWeight !== 'italic' ? 'italic' : 'normal');
    },

    /**
      Handler for underline font button's 'click' action.

      @method actions.onUnderlineFontButtonClick
    */
    onUnderlineFontButtonClick() {
      let previousFontWeight = this.get('_options.captionFontDecoration');
      this.set('_options.captionFontDecoration', previousFontWeight !== 'underline' ? 'underline' : 'none');
    },

    /**
      Handler for line-through font button's 'click' action.

      @method actions.onLinethroughFontButtonClick
    */
    onLinethroughFontButtonClick() {
      let previousFontWeight = this.get('_options.captionFontDecoration');
      this.set('_options.captionFontDecoration', previousFontWeight !== 'line-through' ? 'line-through' : 'none');
    },

    /**
      Handler for font colorpicker's 'change' action.

      @method actions.onCaptionFontColorChange
    */
    onCaptionFontColorChange(e) {
      this.set('_options.captionFontColor', e.newValue);
    },

    /**
      Handler for display mode change.

      @method actions.onDisplayModeChange
    */
    onDisplayModeChange(newDisplayMode) {
      this.set('_options.displayMode', newDisplayMode);
    },

    /**
      Handler for error 'ui-message' component 'onShow' action.

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
      let previewLeafletMap = this.get('_previewLeafletMap');
      if (!Ember.isNone(previewLeafletMap)) {
        // Map was hidden before, so we need to refresh it, otherwise it may be displayed incorrectly.
        previewLeafletMap.invalidateSize(false);
      }

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
    Observes changes in reference to leaflet map.
    Attaches map events handlers.

    @method _leafletMapDidChange
    @private
  */
  _leafletMapDidChange: Ember.on('init', Ember.observer('leafletMap', '_previewLeafletMap', function() {
    let leafletMap = this.get('leafletMap');
    let previewLeafletMap = this.get('_previewLeafletMap');
    if (Ember.isNone(leafletMap) || Ember.isNone(previewLeafletMap)) {
      return;
    }

    leafletMap.on('moveend', this._onLeafletMapViewChanged, this);
    leafletMap.on('zoomend', this._onLeafletMapViewChanged, this);
    this._onLeafletMapViewChanged();
  })),

  /**
    Handles changes in leaflet map's current view.

    @method _onLeafletMapViewChanged
    @private
  */
  _onLeafletMapViewChanged() {
    let leafletMap = this.get('leafletMap');
    let previewLeafletMap = this.get('_previewLeafletMap');
    if (Ember.isNone(leafletMap) || Ember.isNone(previewLeafletMap)) {
      return;
    }

    previewLeafletMap.setView(leafletMap.getCenter(), leafletMap.getZoom());
  },

  /**
    Returns inner options transformed into Leaflet.Export options.

    @method _getLeafletExportOptions
    @return {Object} Hash containing inner options transformed into Leaflet.Export options.
  */
  _getLeafletExportOptions() {
    let leafletExportOptions = {};
    let innerOptions = this.get('_options');

    let showDownloadingFileSettings = this.get('showDownloadingFileSettings');
    if (showDownloadingFileSettings) {
      let fileName = Ember.get(innerOptions, 'fileName');
      if (Ember.isBlank(fileName)) {
        fileName = defaultOptions.fileName;
      }

      let fileType = Ember.get(innerOptions, 'fileType');
      if (Ember.isBlank(fileType)) {
        fileType = defaultOptions.fileType;
      }

      Ember.set(leafletExportOptions, 'fileName', `${fileName}.${fileType.toLowerCase()}`);
      Ember.set(leafletExportOptions, 'type', fileType);
    }

    Ember.set(leafletExportOptions, 'container', Ember.$(this.get('_previewLeafletMap._container')).closest(`.${flexberryClassNames.sheetOfPaper}`)[0]);

    return leafletExportOptions;
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    // There is no easy way to programmatically get list of all available system fonts (in JavaScript),
    // so we can only list some web-safe fonts statically (see https://www.w3schools.com/csSref/css_websafe_fonts.asp).
    this.set('_availableFontFamilies', Ember.A([
      'Georgia',
      'Palatino Linotype',
      'Times New Roman',
      'Arial',
      'Arial Black',
      'Comic Sans MS',
      'Impact',
      'Lucida Sans Unicode',
      'Tahoma',
      'Trebuchet MS',
      'Verdana',
      'Courier New',
      'Lucida Console'
    ]));

    // Same situation with available font sizes.
    this.set('_availableFontSizes', Ember.A(['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '26', '28', '36', '48', '72']));

    // Image formats supported by canvas.toDataURL method (see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL).
    this.set('_availableFileTypes', Ember.A(['PNG', 'JPEG', 'JPG', 'GIF', 'BMP', 'TIFF', 'XICON', 'SVG', 'WEBP']));

    // Initialize print/export options.
    let defaultMapCaption = this.get('defaultMapCaption');
    this.set('_options', Ember.$.extend(true, defaultOptions, {
      caption: defaultMapCaption,
      fileName: defaultMapCaption
    }));

    // Bind context to tabular menu tabs 'click' event handler.
    this.set('actions.onSettingsTabClick', this.get('actions.onSettingsTabClick').bind(this));
  },

  /**
    Initializes component's DOM-related properties.
  */
  didInsertElement() {
    this._super(...arguments);

    let dialogComponent = this.get('childViews')[0];

    let $tabularMenuTabItems = dialogComponent.$('.tabular.menu .tab.item');
    this.set('_$tabularMenuTabItems', $tabularMenuTabItems);

    let $tabularMenuTabs = dialogComponent.$('.tab.segment');
    this.set('_$tabularMenuTabs', $tabularMenuTabs);

    // Attach 'click' event handler for tabular menu tabs before Semantic UI tabular menu will be initialized.
    $tabularMenuTabItems.on('click', this.get('actions.onSettingsTabClick'));

    // Initialize Semantic UI tabular menu.
    $tabularMenuTabItems.tab();
  },

  /**
    Called after a component has been rendered, both on initial render and in subsequent rerenders.
  */
  didRender() {
    this._super(...arguments);

    this.set('_isDialogAlreadyRendered', true);
  },

  /**
    Destroys component.
  */
  willDestroyElement() {
    this._super(...arguments);

    let leafletMap = this.get('leafletMap');
    if (Ember.isNone(leafletMap)) {
      return;
    }

    leafletMap.off('moveend', this._onLeafletMapViewChanged, this);
    leafletMap.off('zoomend', this._onLeafletMapViewChanged, this);

    this.set('leafletMap', null);

    let $tabularMenuTabItems = this.get('_$tabularMenuTabItems');
    if (!Ember.isNone($tabularMenuTabItems)) {
      // Detach 'click' event handler for tabular menu tabs.
      $tabularMenuTabItems.off('click', this.get('actions.onSettingsTabClick'));

      // Deinitialize Semantic UI tabular menu.
      $tabularMenuTabItems.tab('destroy');
      this.set('_$tabularMenuTabItems', null);
      this.set('_$tabularMenuTabs', null);
    }
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
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryExportMapCommandDialogComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryExportMapCommandDialogComponent;
