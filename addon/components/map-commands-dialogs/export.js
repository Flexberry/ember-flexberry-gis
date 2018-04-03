/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/map-commands-dialogs/export';

/**
  Constants representing default print/eport options.
*/
const defaultOptions = {
  caption: '',
  captionLineHeight: '1.2',
  captionFontFamily: 'Times New Roman',
  captionFontSize: '24',
  captionFontColor: '#000000',
  captionFontWeight: 'normal',
  captionFontStyle: 'normal',
  captionFontDecoration: 'none',
  displayMode: 'standard-mode',
  paperOrientation: 'landscape',
  paperFormat: 'A4',
  legendControl: false,
  legendPosition: 'under-map',
  legendUnderMap: false,
  legendSecondPage: false,
  scaleControl: false,
  fileName: 'map',
  fileType: 'PNG',
  pageNumber: '1',
  pageNumber2Selected: false
};

/**
  Constant representing sizes (in millimeters) of available paper formats.
*/
const paperFormatsInMillimeters = {
  'A5': {
    'portrait': {
      width: 148,
      height: 210
    },
    'landscape': {
      width: 210,
      height: 148
    }
  },
  'A4': {
    'portrait': {
      width: 210,
      height: 297
    },
    'landscape': {
      width: 297,
      height: 210
    }
  },
  'A3': {
    'portrait': {
      width: 297,
      height: 420
    },
    'landscape': {
      width: 420,
      height: 297
    }
  },
  'B5': {
    'portrait': {
      width: 176,
      height: 250
    },
    'landscape': {
      width: 250,
      height: 176
    }
  },
  'B4': {
    'portrait': {
      width: 250,
      height: 353
    },
    'landscape': {
      width: 353,
      height: 250
    }
  }
};

/**
  Constant representing default DPI.
  The most common value used by browsers is 96.
*/
const defaultDpi = 96;

/**
  Constant representing count of millimeters in one inch.
*/
const millimetersInOneInch = 25.4;

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
  sheetOfLegend: flexberryClassNamesPrefix + '-sheet-of-legend',
  sheetOfPaperMapCaption: flexberryClassNamesPrefix + '-sheet-of-paper-map-caption',
  sheetOfPaperMap: flexberryClassNamesPrefix + '-sheet-of-paper-map',
  legendControlMap: flexberryClassNamesPrefix + '-legend-control-map',
  pagingColumn: flexberryClassNamesPrefix + '-paging-column',
};

const legendStyleConstants = {
  heightMargin: 10,
  widthPadding: 15,
  rightPaddingLegend: 10
};

/**
  Flexberry 'export' map-command modal dialog with [Semantic UI modal](http://semantic-ui.com/modules/modal.html) style.

  @class FlexberryExportMapCommandDialogComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
let FlexberryExportMapCommandDialogComponent = Ember.Component.extend({
  /**
    Sheet of paper placed on dialog's preview block.

    @property _$sheetOfPaper
    @type <a href="http://learn.jquery.com/using-jquery-core/jquery-object/">jQuery-object</a>
    @default null
    @private
  */
  _$sheetOfPaper: null,

  /**
    Sheet of paper clone which will be placed on dialog's preview block while export operation is executing.

    @property _$sheetOfPaperClone
    @type <a href="http://learn.jquery.com/using-jquery-core/jquery-object/">jQuery-object</a>
    @default null
    @private
  */
  _$sheetOfPaperClone: null,

  /**
    Sheet of paper with map legend placed on dialog's preview block.

    @property _$sheetOfLegend
    @type <a href="http://learn.jquery.com/using-jquery-core/jquery-object/">jQuery-object</a>
    @default null
    @private
  */
  _$sheetOfLegend: null,

  /**
    Sheet of paper clone with map legend which will be placed on dialog's preview block while export operation is executing.

    @property _$sheetOfLegendClone
    @type <a href="http://learn.jquery.com/using-jquery-core/jquery-object/">jQuery-object</a>
    @default null
    @private
  */
  _$sheetOfLegendClone: null,

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
  _tabularMenuActiveTab: Ember.computed('_tabularMenuClickedTab', 'showDownloadingFileSettings', function () {
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
    Available paper formats.

    @property _availablePaperFormats
    @type String[]
    @default null
    @private
  */
  _availablePaperFormats: null,

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
    Current screen approximate DPI.
    Will be computed in component's 'didInsertElement' hook.

    @property _dpi
    @type Number
    @default 96
    @private
    @readOnly
  */
  _dpi: defaultDpi,

  /**
    Indicates whether or not use preview styles.

    @property _isPreview
    @type Boolean
    @default true
    @private
  */
  _isPreview: true,

  /**
    Sheet of paper real height.

    @property _sheetOfPaperRealHeight
    @type Number
    @private
    @readOnly
  */
  _sheetOfPaperRealHeight: Ember.computed(
    '_dpi',
    '_options.paperFormat',
    '_options.paperOrientation',
    function () {
      let dpi = this.get('_dpi');
      let paperFormat = this.get('_options.paperFormat');
      let paperOrientation = this.get('_options.paperOrientation');
      let paperFormatInMillimeters = paperFormatsInMillimeters[paperFormat][paperOrientation];

      return Math.round(paperFormatInMillimeters.height * dpi / millimetersInOneInch);
    }
  ),

  /**
    Sheet of paper real width.

    @property _sheetOfPaperRealWidth
    @type Number
    @private
    @readOnly
  */
  _sheetOfPaperRealWidth: Ember.computed(
    '_dpi',
    '_options.paperFormat',
    '_options.paperOrientation',
    function () {
      let dpi = this.get('_dpi');
      let paperFormat = this.get('_options.paperFormat');
      let paperOrientation = this.get('_options.paperOrientation');
      let paperFormatInMillimeters = paperFormatsInMillimeters[paperFormat][paperOrientation];

      return Math.round(paperFormatInMillimeters.width * dpi / millimetersInOneInch);
    }
  ),

  /**
    Sheet of paper real style.

    @property _sheetOfPaperRealStyle
    @type String
    @private
    @readOnly
  */
  _sheetOfPaperRealStyle: Ember.computed(
    '_sheetOfPaperRealHeight',
    '_sheetOfPaperRealWidth',
    '_options.legendSecondPage',
    'showDownloadingFileSettings',
    '_mapCaptionRealHeight',
    '_mapLegendLines',
    function () {
      let height = this.get('_sheetOfPaperRealHeight');

      return Ember.String.htmlSafe(
        `height: ${height}px; ` +
        `width: ${this.get('_sheetOfPaperRealWidth')}px;` +
        `border: none`);
    }
  ),

  /**
    Sheet of paper preview height.
    Initializes in 'didInsertElement' hook.

    @property _sheetOfPaperPreviewHeight
    @type Number
    @private
    @readOnly
  */
  _sheetOfPaperPreviewHeight: null,

  /**
    Fixed difference between map height and sheet of paper height.
    Initializes in 'didInsertElement' hook.

    @property _mapHeightDelta
    @type Number
    @private
    @readOnly
  */
  _mapHeightDelta: null,

  /**
    Sheet of paper preview scale factor.

    @property _sheetOfPaperPreviewScaleFactor
    @type Number
    @private
    @readOnly
  */
  _sheetOfPaperPreviewScaleFactor: Ember.computed(
    '_sheetOfPaperRealHeight',
    '_sheetOfPaperPreviewHeight',
    function () {
      let sheetOfPaperPreviewHeight = this.get('_sheetOfPaperPreviewHeight');
      if (Ember.isNone(sheetOfPaperPreviewHeight)) {
        return null;
      }

      return sheetOfPaperPreviewHeight / this.get('_sheetOfPaperRealHeight');
    }
  ),

  /**
    Sheet of paper preview width.

    @property _sheetOfPaperPreviewWidth
    @type Number
    @private
    @readOnly
  */
  _sheetOfPaperPreviewWidth: Ember.computed(
    '_sheetOfPaperRealWidth',
    '_sheetOfPaperPreviewScaleFactor',
    function () {
      let sheetOfPaperPreviewScaleFactor = this.get('_sheetOfPaperPreviewScaleFactor');
      if (Ember.isNone(sheetOfPaperPreviewScaleFactor)) {
        return null;
      }

      return Math.round(this.get('_sheetOfPaperRealWidth') * sheetOfPaperPreviewScaleFactor);
    }
  ),

  /**
    Style related to user-defined sheet of paper settings.

    @property _sheetOfPaperPreviewStyle
    @type String
    @private
    @readOnly
  */
  _sheetOfPaperPreviewStyle: Ember.computed(
    '_sheetOfPaperPreviewHeight',
    '_sheetOfPaperPreviewWidth',
    function () {
      let sheetOfPaperPreviewHeight = this.get('_sheetOfPaperPreviewHeight');
      let sheetOfPaperPreviewWidth = this.get('_sheetOfPaperPreviewWidth');
      if (Ember.isNone(sheetOfPaperPreviewHeight) || Ember.isNone(sheetOfPaperPreviewWidth)) {
        return Ember.String.htmlSafe(``);
      }

      return Ember.String.htmlSafe(`height: ${sheetOfPaperPreviewHeight}px; width: ${sheetOfPaperPreviewWidth}px;`);
    }
  ),

  /**
    Legends padding-right property.

    @property _legendsRightPadding    @type Number
    @private
    @readOnly
  */
  _legendsRightPadding: Ember.computed(
    '_sheetOfPaperRealWidth',
    '_sheetOfPaperPreviewWidth',
    '_isPreview',
    function () {
      let isPreview = this.get('_isPreview');
      if (isPreview) {
        return legendStyleConstants.rightPaddingLegend;
      } else {
        let sheetOfPaperRealWidth = this.get('_sheetOfPaperRealWidth');
        let sheetOfPaperPreviewWidth = this.get('_sheetOfPaperPreviewWidth');
        return sheetOfPaperRealWidth / sheetOfPaperPreviewWidth * legendStyleConstants.rightPaddingLegend;
      }
    }
  ),

  /**
    Map caption real height.

    @property _mapCaptionRealHeight
    @type Number
    @private
    @readOnly
  */
  _mapCaptionRealHeight: Ember.computed(
    '_options.captionLineHeight',
    '_options.captionFontSize',
    function () {
      return Math.floor(this.get('_options.captionLineHeight') * this.get('_options.captionFontSize'));
    }
  ),

  /**
    Map caption real style.

    @property _mapCaptionRealStyle
    @type String
    @private
    @readOnly
  */
  _mapCaptionRealStyle: Ember.computed(
    '_options.captionLineHeight',
    '_options.captionFontFamily',
    '_options.captionFontSize',
    '_options.captionFontColor',
    '_options.captionFontWeight',
    '_options.captionFontStyle',
    '_options.captionFontDecoration',
    '_mapCaptionRealHeight',
    function () {
      return Ember.String.htmlSafe(
        `font-family: "${this.get('_options.captionFontFamily')}"; ` +
        `line-height: ${this.get('_options.captionLineHeight')}; ` +
        `font-size: ${this.get('_options.captionFontSize')}px; ` +
        `font-weight: ${this.get('_options.captionFontWeight')}; ` +
        `font-style: ${this.get('_options.captionFontStyle')}; ` +
        `text-decoration: ${this.get('_options.captionFontDecoration')}; ` +
        `color: ${this.get('_options.captionFontColor')}; ` +
        `height: ${this.get('_mapCaptionRealHeight')}px;`);
    }
  ),

  /**
    Map caption preview height.

    @property _mapCaptionPreviewHeight
    @type Number
    @private
    @readOnly
  */
  _mapCaptionPreviewHeight: Ember.computed(
    '_mapCaptionRealHeight',
    '_sheetOfPaperPreviewScaleFactor',
    function () {
      let sheetOfPaperPreviewScaleFactor = this.get('_sheetOfPaperPreviewScaleFactor');
      if (Ember.isNone(sheetOfPaperPreviewScaleFactor)) {
        return null;
      }

      return Math.round(this.get('_mapCaptionRealHeight') * sheetOfPaperPreviewScaleFactor);
    }
  ),

  /**
    Map caption preview font size.

    @property _mapCaptionPreviewFontSize
    @type Number
    @private
    @readOnly
  */
  _mapCaptionPreviewFontSize: Ember.computed(
    '_options.captionLineHeight',
    '_mapCaptionPreviewHeight',
    function () {
      let mapCaptionPreviewHeight = this.get('_mapCaptionPreviewHeight');
      if (Ember.isNone(mapCaptionPreviewHeight)) {
        return null;
      }

      return Math.round(mapCaptionPreviewHeight / this.get('_options.captionLineHeight'));
    }
  ),

  /**
    Map caption preview style.

    @property _mapCaptionPreviewStyle
    @type String
    @private
    @readOnly
  */
  _mapCaptionPreviewStyle: Ember.computed(
    '_options.captionLineHeight',
    '_options.captionFontFamily',
    '_options.captionFontColor',
    '_options.captionFontWeight',
    '_options.captionFontStyle',
    '_options.captionFontDecoration',
    '_mapCaptionPreviewFontSize',
    '_mapCaptionPreviewHeight',
    function () {
      let mapCaptionPreviewFontSize = this.get('_mapCaptionPreviewFontSize');
      let mapCaptionPreviewHeight = this.get('_mapCaptionPreviewHeight');
      if (Ember.isNone(mapCaptionPreviewFontSize) || Ember.isNone(mapCaptionPreviewHeight)) {
        return Ember.String.htmlSafe(``);
      }

      return Ember.String.htmlSafe(
        `font-family: "${this.get('_options.captionFontFamily')}"; ` +
        `line-height: ${this.get('_options.captionLineHeight')}; ` +
        `font-size: ${mapCaptionPreviewFontSize}px; ` +
        `font-weight: ${this.get('_options.captionFontWeight')}; ` +
        `font-style: ${this.get('_options.captionFontStyle')}; ` +
        `text-decoration: ${this.get('_options.captionFontDecoration')}; ` +
        `color: ${this.get('_options.captionFontColor')};`);
    }
  ),

  /**
    Get map layers info.

    @type Array
    @private
  */
  _getLayersInfo(layers, legends) {
    var result = Ember.A();

    layers.forEach(function (layer) {
      if (layer.get('visibility')) {
        if (layer.get('type') === 'group') {
          result = result.concat(this._getLayersInfo(layer.layers, legends));
        } else if (layer.get('legendCanBeDisplayed')) {
          if (Ember.isArray(legends[layer.get('name')])) {
            legends[layer.get('name')].forEach(function (legend) {
              let layerInfo = {
                name: legend.useMainLayerName ? layer.get('name') : legend.layerName,
                image: legend.src
              };
              result.push(layerInfo);
            });
          } else {
            let layerInfo = {
              name: layer.get('name')
            };
            result.push(layerInfo);
          }
        }
      }
    }, this);

    return result;
  },

  /**
    Get layer legend width.

    @type Number
    @private
  */
  _getLayerLegendWidth(txt, font, imageSrc, height) {
    let element = document.createElement('div');
    element.style.cssText = `height: ${height}px; visibility: hidden; position: absolute; display: inline-block; ` +
      `font-family: ${font['font-family']}; line-height: ${font['line-height']}; font-size: ${font['font-size']}; ` +
      `font-weight: ${font['font-weight']}; font-style: ${font['font-style']}; padding-right: 10px`;
    if (!Ember.isBlank(imageSrc)) {
      let image = document.createElement('img');
      image.src = imageSrc;
      image.style.cssText = 'height: inherit;';
      element.appendChild(image);
    }

    let text = document.createElement('label');
    text.textContent = ' ' + txt;
    element.appendChild(text);
    document.body.appendChild(element);
    let elementWidth = Ember.$(element)[0].getBoundingClientRect().width;
    element.remove();

    return elementWidth;
  },

  /**
    Map legend lines.

    @property _mapLegendLines
    @type Number
    @private
    @readOnly
  */
  _mapLegendLines: Ember.computed(
    '_sheetOfPaperPreviewWidth',
    '_options.captionLineHeight',
    '_options.captionFontFamily',
    '_options.captionFontWeight',
    '_options.captionFontStyle',
    '_options.captionFontDecoration',
    '_mapCaptionPreviewFontSize',
    '_mapCaptionPreviewHeight',
    '_options.legendControl',
    'layers.@each.visibility',
    'layers.@each.isDeleted',
    'layers.@each.legendCanBeDisplayed',
    'legendsUpdateTrigger',
    function () {
      let lineCount = 1;
      let layers = this.get('layers');
      let legends = this.get('legends');
      let legendsInfo = this._getLayersInfo(layers, legends);
      let legendWidth = this.get('_sheetOfPaperPreviewWidth') - legendStyleConstants.widthPadding * 2; // padding left/right 14, border 1.
      let cutWidth = legendWidth;

      legendsInfo.forEach(function (legendInfo) {
        if (Ember.isBlank(legendInfo)) {
          legendInfo = {};
        }

        let font = {
          'font-family': this.get('_options.captionFontFamily'),
          'line-height': this.get('_options.captionLineHeight'),
          'font-size': this.get('_mapCaptionPreviewFontSize') + 'px',
          'font-weight': this.get('_options.captionFontWeight'),
          'font-style': this.get('_options.captionFontStyle')
        };

        let textWidth = this._getLayerLegendWidth(legendInfo.name, font, legendInfo.image, this.get('_mapCaptionPreviewHeight'));
        if (textWidth <= cutWidth) {
          cutWidth -= textWidth;
        } else {
          lineCount++;
          cutWidth = legendWidth - textWidth;
        }
      }, this);

      return lineCount;
    }
  ),

  /**
    Map real style.

    @property _mapRealStyle
    @type String
    @private
    @readOnly
  */
  _mapRealStyle: Ember.computed(
    '_options.displayMode',
    '_options.legendUnderMap',
    '_mapLegendLines',
    '_sheetOfPaperRealHeight',
    '_mapCaptionRealHeight',
    '_mapHeightDelta',
    function () {
      if (this.get('_options.displayMode') === 'map-only-mode') {
        return Ember.String.htmlSafe(`height: 100%;`);
      }

      let legendHeight = this.get('_mapCaptionRealHeight');
      let legendLines = this.get('_mapLegendLines');

      legendHeight = legendHeight * legendLines + legendStyleConstants.heightMargin;

      if (!this.get('_options.legendUnderMap')) {
        legendHeight = 0;
      }

      let pxHeightValue = this.get('_sheetOfPaperRealHeight') -
        this.get('_mapCaptionRealHeight') -
        legendHeight -
        this.get('_mapHeightDelta');

      return Ember.String.htmlSafe(`height: ${pxHeightValue}px;`);
    }
  ),

  /**
    Map preview style.

    @property _mapPreviewStyle
    @type String
    @private
    @readOnly
  */
  _mapPreviewStyle: Ember.computed(
    '_options.displayMode',
    '_options.legendUnderMap',
    '_mapLegendLines',
    '_sheetOfPaperPreviewHeight',
    '_mapCaptionPreviewHeight',
    '_mapHeightDelta',
    function () {
      let sheetOfPaperPreviewHeight = this.get('_sheetOfPaperPreviewHeight');
      let mapCaptionPreviewHeight = this.get('_mapCaptionPreviewHeight');
      if (Ember.isNone(sheetOfPaperPreviewHeight) || Ember.isNone(mapCaptionPreviewHeight)) {
        return Ember.String.htmlSafe(``);
      }

      // Real map size has been changed, so we need to refresh it's size after render, otherwise it may be displayed incorrectly.
      Ember.run.scheduleOnce('afterRender', () => {
        this._invalidateSizeOfLeafletMap();
      });

      if (this.get('_options.displayMode') === 'map-only-mode') {
        return Ember.String.htmlSafe(`height: 100%;`);
      }

      var legendHeight = mapCaptionPreviewHeight;
      var legendLines = this.get('_mapLegendLines');

      legendHeight = legendHeight * legendLines + legendStyleConstants.heightMargin; // margin

      if (!this.get('_options.legendUnderMap')) {
        legendHeight = 0;
      }

      let pxHeightValue = sheetOfPaperPreviewHeight - mapCaptionPreviewHeight -
        legendHeight - this.get('_mapHeightDelta');

      return Ember.String.htmlSafe(`height: ${pxHeightValue}px;`);
    }
  ),

  /**
    Flag: indicates whether file name has been changed by user or not.

    @property _fileNameHasBeenChanged
    @type Boolean
    @default false
    @private
  */
  _fileNameHasBeenChanged: false,

  /**
    File name which will be applied to exported file.

    @property _fileName
    @type String
    @private
  */
  _fileName: Ember.computed('_options.fileName', {
    get(key) {
      return this.get('_options.fileName');
    },
    set(key, value) {
      this.set('_fileNameHasBeenChanged', true);
      this.set('_options.fileName', value);
      return value;
    }
  }),

  /**
    Map caption.

    @property _caption
    @type String
    @private
  */
  _caption: Ember.computed('_options.caption', {
    get(key) {
      return this.get('_options.caption');
    },
    set(key, value) {
      if (!this.get('_fileNameHasBeenChanged')) {
        this.set('_options.fileName', value);
      }

      this.set('_options.caption', value);
      return value;
    }
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
    Flag: indicates whether print/export dialog is shown.

    @property _isDialogShown
    @type Boolean
    @default null
    @private
  */
  _isDialogShown: false,

  /**
    Flag: indicates whether map can be shown or not.

    @property _mapCanBeShown
    @type Boolean
    @private
    @readOnly
  */
  _mapCanBeShown: false,

  /**
    Leaflet map's initial bounds which must be restored after dialog will be closed.

    @property _leafletMapInitialBounds
    @type <a href="http://leafletjs.com/reference-1.0.1.html#latlngbounds">L.LatLngBounds</a>
    @private
  */
  _leafletMapInitialBounds: null,

  /**
    Leaflet map container's clone.

    @property _$leafletMapClone
    @type <a href="http://learn.jquery.com/using-jquery-core/jquery-object/">jQuery-object</a>
    @default null
    @private
  */
  _$leafletMapClone: null,

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

  /**
    Max timeout (in milliseconds) to wait for map's layers readiness before export.

    @property timeout
    @type Number
    @default 30000
  */
  timeout: 30000,

  /**
    Trigger for recompute _mapLegendLines.

    @property legendsUpdateTrigger
    @type Boolean
    @default false
  */
  legendsUpdateTrigger: false,

  /**
    All loaded legends for layers.

    @property legends
    @type Object
    @default {}
  */
  legends: {},

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
      @param {String} newDisplayMode New display mode.
    */
    onDisplayModeChange(newDisplayMode) {
      this.set('_options.displayMode', newDisplayMode);
    },

    /**
      Handler for legend position change.

      @method actions.onLegendPositionChange
      @param {String} newLegendPosition New legend position.
    */
    onLegendPositionChange(newLegendPosition) {
      this.set('_options.legendPosition', newLegendPosition);
    },

    /**
      Handler for page number change.

      @method actions.onPageChange
      @param {String} newPageNumber New page number.
    */
    onPageChange(newPageNumber) {
      this.set('_options.pageNumber', newPageNumber);
    },

    /**
      Handler for paper orientation change.

      @method actions.onPaperOrientationChange
      @param {String} newOrientation New paper orientation.
    */
    onPaperOrientationChange(newOrientation) {
      this.set('_options.paperOrientation', newOrientation);
    },

    /**
      Handler for map control change.

      @method actions.onMapControlChange
      @param {String} changedControl Changed control.
    */
    onMapControlChange(changedControl) {
      let controlOptionPath = `_options.${changedControl}`;
      this.set(controlOptionPath, !this.get(controlOptionPath));
    },

    /**
      Handler for error 'ui-message' component 'onShow' action.

      @method actions.onErrorMessageShow
    */
    onErrorMessageShow() {},

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
      if (this.get('_options.legendSecondPage')) {
        Ember.set(e, 'exportOptions', [this._getLeafletExportOptions('1'), this._getLeafletExportOptions('2')]);
      } else {
        Ember.set(e, 'exportOptions', [this._getLeafletExportOptions('1')]);
      }

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
      this.set('_isDialogShown', false);

      this.sendAction('beforeHide', e);
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.show:method"}}'flexberry-dialog' component's 'show' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryExportMapCommandDialogComponent/sendingActions.show:method"}}'show' action{{/crossLink}}.

      @method actions.onShow
    */
    onShow(e) {
      this.set('_isDialogShown', true);

      this.sendAction('show', e);
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.hide:method"}}'flexberry-dialog' component's 'hide' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryExportMapCommandDialogComponent/sendingActions.hide:method"}}'hide' action{{/crossLink}}.

      @method actions.onHide
    */
    onHide(e) {
      this.sendAction('hide', e);
    },

    /**
      Called when legends for one of the layers is loaded.

      @method actions.legendsLoaded
    */
    legendsLoaded(layerName, legends) {
      this[`legends.${layerName}`] = legends;
      this.set('legendsUpdateTrigger', !this.get('legendsUpdateTrigger'));
    }
  },

  /**
    Observers changes in properties that affect the ability to show leaflet map.

    @method _mapCanBeShownDidChange
    @private
  */
  _mapCanBeShownDidChange: Ember.observer('_isDialogAlreadyRendered', '_isDialogShown', 'leafletMap', function () {
    let leafletMap = this.get('leafletMap');
    let oldMapCanBeShown = this.get('_mapCanBeShown');
    let newMapCanBeShown = this.get('_isDialogAlreadyRendered') && this.get('_isDialogShown') && !Ember.isNone(leafletMap);
    if (oldMapCanBeShown === newMapCanBeShown) {
      return;
    }

    this.set('_mapCanBeShown', newMapCanBeShown);

    if (newMapCanBeShown) {
      this._showLeafletMap();
    } else {
      this._hideLeafletMap();
    }
  }),

  /**
    Observers changes in properties that affect the ability to show legend map.

    @method _legendControlDidChange
    @private
  */
  _legendControlDidChange: Ember.observer('_options.legendControl', '_options.legendPosition', function () {
    let legendVisible = this.get('_options.legendControl');
    let legendPosition = this.get('_options.legendPosition');

    this.set('_options.legendUnderMap', legendPosition === 'under-map' && legendVisible);
    this.set('_options.legendSecondPage', legendPosition === 'second-page' && legendVisible);

    if (legendPosition === 'under-map') {
      this.set('_options.pageNumber', '1');
    }
  }),

  /**
    Observers changes in properties that affect the ability to show pages.

    @method _pageNumberDidChange
    @private
  */
  _pageNumberDidChange: Ember.observer('_options.pageNumber', function () {
    let pageNumber = this.get('_options.pageNumber');

    this.set('_options.pageNumber2Selected', pageNumber === '2');
  }),

  /**
    Invalidates leaflet map's size.

    @method _invalidateSizeOfLeafletMap
    @returns <a htef="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Promise which will be resolved when invalidation will be finished.
  */
  _invalidateSizeOfLeafletMap() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let leafletMap = this.get('leafletMap');

      leafletMap.once('resize', () => {
        resolve();
      });

      leafletMap.invalidateSize(false);
    });
  },

  /**
    Fits specified leaflet map's bounds.

    @method _fitBoundsOfLeafletMap
    @param {<a href="http://leafletjs.com/reference-1.0.1.html#latlngbounds">L.LatLngBounds</a>} bounds Bounds to be fitted.
    @returns <a htef="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Promise which will be resolved when fitting will be finished.
  */
  _fitBoundsOfLeafletMap(bounds) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let leafletMap = this.get('leafletMap');

      leafletMap.once('moveend', () => {
        resolve();
      });

      leafletMap.fitBounds(bounds, {
        animate: false
      });
    });
  },

  /**
    Waits for leaflet map tile layers to be ready.

    @method _waitForLeafletMapTileLayersToBeReady
    @returns <a htef="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Promise which will be resolved when map's tile layers will be ready.
  */
  _waitForLeafletMapTileLayersToBeReady() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let leafletMap = this.get('leafletMap');
      let $leafletMapContainer = Ember.$(leafletMap._container);
      let $tiles = Ember.$('.leaflet-tile-pane img', $leafletMapContainer);

      if ($tiles.length === 0) {
        // There is no tiles, resolve promise to continue the following operations.
        resolve();
        return;
      }

      let timeoutId = null;
      let intervalId = null;

      // Interval to check that tiles are ready.
      intervalId = setInterval(() => {
        let allTilesAreReady = true;
        $tiles.each(function () {
          let $tile = Ember.$(this);

          // Call to $.fn.css('opacity') will return '1' if 'opacity' isn't defined, that's why element.style.opacity is preferred.
          allTilesAreReady = allTilesAreReady && (parseFloat($tile[0].style.opacity) === 1);

          // It will break 'each' loop if current tile isn't ready yet and flag became false.
          return allTilesAreReady;
        });

        if (allTilesAreReady) {
          // All tiles are ready, so both timeout and interval can be cleared and resulting promise can be resolved.
          clearTimeout(timeoutId);
          clearInterval(intervalId);
          resolve();
        }
      }, 100);

      // Timeout to avoid infinite checkings.
      timeoutId = setTimeout(() => {
        // Wait is timed out, so intarval can be cleared and resulting promise can be resolved.
        clearInterval(intervalId);
        resolve();
      }, this.get('timeout'));
    });
  },

  /**
    Waits for leaflet map overlay layers to be ready.

    @method _waitForLeafletMapOverlayLayersToBeReady
    @returns <a htef="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Promise which will be resolved when map's overlay layers will be ready.
  */
  _waitForLeafletMapOverlayLayersToBeReady() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let leafletMap = this.get('leafletMap');
      let $leafletMapContainer = Ember.$(leafletMap._container);
      let $overlays = Ember.$('.leaflet-overlay-pane', $leafletMapContainer).children();

      if ($overlays.length === 0) {
        // There is no overlays, resolve promise to continue the following operations.
        resolve();
        return;
      }

      let timeoutId = null;
      let intervalId = null;

      // Interval to check that overlays are ready.
      intervalId = setInterval(() => {
        // Don't know how to check overlays readiness, so just clear timeout, interval, and resolve resulting promise.
        clearTimeout(timeoutId);
        clearInterval(intervalId);
        resolve();
      }, 100);

      // Timeout to avoid infinite checkings.
      timeoutId = setTimeout(() => {
        // Wait is timed out, so intarval can be cleared and resulting promise can be resolved.
        clearInterval(intervalId);
        resolve();
      }, this.get('timeout'));
    });
  },

  /**
    Waits for leaflet map layers to be ready.

    @method _waitForLeafletMapLayersToBeReady
    @returns <a htef="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Promise which will be resolved when map's layers will be ready.
  */
  _waitForLeafletMapLayersToBeReady() {
    return Ember.RSVP.hash({
      tileLayers: this._waitForLeafletMapTileLayersToBeReady(),
      overlayLayers: this._waitForLeafletMapOverlayLayersToBeReady(),
    });
  },

  /**
    Shows leaflet map.

    @method _showLeafletMap
    @private
  */
  _showLeafletMap() {
    let leafletMap = this.get('leafletMap');
    let leafletMapInitialBounds = leafletMap.getBounds();
    this.set('_leafletMapInitialBounds', leafletMapInitialBounds);

    // Retrieve leaflet map wrapper.
    let $leafletMap = Ember.$(leafletMap._container);
    let $leafletMapWrapper = $leafletMap.parent();

    // Retrieve preview map wrapper.
    let $previewMapWrapper = Ember.$(`.${flexberryClassNames.sheetOfPaperMap}`, this.get('_$sheetOfPaper'));

    // Move interactive map into export dialog and replace original intercative leaflet map with it's clone for a while.
    let $leafletMapClone = $leafletMap.clone();
    this.set('_$leafletMapClone', $leafletMapClone);
    $leafletMap.appendTo($previewMapWrapper[0]);
    $leafletMapClone.appendTo($leafletMapWrapper[0]);

    // Hide map-controls.
    let $leafletMapControls = Ember.$('.leaflet-control-container', $leafletMap);
    Ember.$('.leaflet-top.leaflet-left', $leafletMapControls).children().hide();
    Ember.$('.leaflet-top.leaflet-right', $leafletMapControls).children().hide();
    Ember.$('.leaflet-bottom.leaflet-left', $leafletMapControls).children().hide();
    Ember.$('.leaflet-bottom.leaflet-right', $leafletMapControls).children().hide();

    // Invalidate map size and then fit it's bounds.
    this._invalidateSizeOfLeafletMap().then(() => {
      return this._fitBoundsOfLeafletMap(leafletMapInitialBounds);
    });
  },

  /**
    Hides leaflet map.

    @method _hideLeafletMap
    @private
  */
  _hideLeafletMap() {
    let leafletMap = this.get('leafletMap');
    let $leafletMap = Ember.$(leafletMap._container);
    let leafletMapInitialBounds = this.get('_leafletMapInitialBounds');

    // Retrieve leaflet map wrapper.
    let $leafletMapClone = this.get('_$leafletMapClone');
    let $leafletMapWrapper = $leafletMapClone.parent();

    // Restore interactive map in it's original place and remove it's clone.
    $leafletMapClone.remove();
    this.set('_$leafletMapClone', null);

    // Show map-controls.
    let $leafletMapControls = Ember.$('.leaflet-control-container', $leafletMap);
    Ember.$('.leaflet-top.leaflet-left', $leafletMapControls).children().show();
    Ember.$('.leaflet-top.leaflet-right', $leafletMapControls).children().show();
    Ember.$('.leaflet-bottom.leaflet-left', $leafletMapControls).children().show();
    Ember.$('.leaflet-bottom.leaflet-right', $leafletMapControls).children().show();

    // Fit bounds to avoid visual jumps inside restored interactive map.
    this._fitBoundsOfLeafletMap(leafletMapInitialBounds).then(() => {
      $leafletMap.appendTo($leafletMapWrapper[0]);

      // Invalidate map size and then fit it's bounds again.
      return this._invalidateSizeOfLeafletMap();
    }).then(() => {
      return this._fitBoundsOfLeafletMap(leafletMapInitialBounds);
    });
  },

  /**
    Computes current scren approximate DPI.

    @returns {Number} Current scren approximate DPI.
  */
  _getDpi() {
    if (Ember.typeOf(window.matchMedia) !== 'function') {
      return defaultDpi;
    }

    // It isn't possible to get real screen DPI with JavaScript code,
    // but some workarounds are possible (see http://stackoverflow.com/a/35941703).
    function findFirstPositive(b, a, i, c) {
      c = (d, e) => e >= d ? (a = d + (e - d) / 2, 0 < b(a) && (a === d || 0 >= b(a - 1)) ? a : 0 >= b(a) ? c(a + 1, e) : c(d, a - 1)) : -1;
      for (i = 1; 0 >= b(i);) {
        i *= 2;
      }

      return c(i / 2, i) | 0;
    }

    return findFirstPositive(x => window.matchMedia(`(max-resolution: ${x}dpi)`).matches);
  },

  /**
    Returns inner options transformed into Leaflet.Export options.

    @method _getLeafletExportOptions
    @return {Object} Hash containing inner options transformed into Leaflet.Export options.
  */
  _getLeafletExportOptions(pageNumber) {
    let leafletExportOptions = {};
    let innerOptions = this.get('_options');

    let showDownloadingFileSettings = this.get('showDownloadingFileSettings');
    if (showDownloadingFileSettings) {
      let fileName = Ember.get(innerOptions, 'fileName');
      if (Ember.isBlank(fileName)) {
        fileName = defaultOptions.fileName;
      }

      if (!Ember.isBlank(pageNumber)) {
        fileName = `${fileName}_${pageNumber}`;
      }

      let fileType = Ember.get(innerOptions, 'fileType');
      if (Ember.isBlank(fileType)) {
        fileType = defaultOptions.fileType;
      }

      Ember.set(leafletExportOptions, 'fileName', `${fileName}.${fileType.toLowerCase()}`);
      Ember.set(leafletExportOptions, 'type', fileType);
    }

    // Define custom export method.
    Ember.set(leafletExportOptions, 'export', (exportOptions) => {
      return this._export(pageNumber);
    });

    return leafletExportOptions;
  },

  /**
    Export's map with respect to selected export options.

    @method _export
    @private
  */
  _export(pageNumber) {
    return this.beforeExport(pageNumber).then(() => {
      return this._waitForLeafletMapLayersToBeReady();
    }).then(() => {
      return this.export(pageNumber);
    }).finally(() => {
      this.afterExport(pageNumber);
    });
  },

  /**
    Prepares map for export with respect to selected export options.

    @method beforeExport
  */
  beforeExport(pageNumber) {
    this.set('_options.pageNumber', '1');

    return new Ember.RSVP.Promise((resolve, reject) => {
      // Sheet of paper with legend or with interactive map, which will be prepered for export and then exported.
      let $sheetOfPaper = pageNumber === '2' ? this.get('_$sheetOfLegend') : this.get('_$sheetOfPaper');
      this.set('_isPreview', false);

      let $legendControlMap = Ember.$(`.${flexberryClassNames.legendControlMap}`, $sheetOfPaper);

      // Sheet of paper clone with static non-interactive map, which will be displayed in preview dialog while export is executing.
      let $sheetOfPaperClone = $sheetOfPaper.clone();
      this.set('_$sheetOfPaperClone', $sheetOfPaperClone);

      let $sheetOfPaperParent = $sheetOfPaper.parent();
      let $body = $sheetOfPaper.closest('body');

      // Move sheet of paper with interactive map into invisible part of document body.
      // And set sheet of paper style relative to real size of the selected paper format.
      $sheetOfPaper.appendTo($body[0]);
      $sheetOfPaper.attr('style', this.get('_sheetOfPaperRealStyle'));
      $sheetOfPaper.css('position', 'absolute');
      $sheetOfPaper.css('left', '0px');
      $sheetOfPaper.css('top', '0px');
      $body.css('height', $sheetOfPaper.css('height'));
      $body.css('width', $sheetOfPaper.css('width'));

      $legendControlMap.attr('style', this.get('_mapCaptionRealStyle'));

      // Replace interactivva map inside dialog with it's static clone for a while.
      $sheetOfPaperClone.appendTo($sheetOfPaperParent[0]);

      if (pageNumber === '2') {
        resolve();
      } else {
        let leafletMap = this.get('leafletMap');
        let leafletMapBounds = leafletMap.getBounds();
        let $sheetOfPaperMap = Ember.$(`.${flexberryClassNames.sheetOfPaperMap}`, $sheetOfPaper);
        let $sheetOfPaperMapCaption = Ember.$(`.${flexberryClassNames.sheetOfPaperMapCaption}`, $sheetOfPaper);

        // Set sheet of paper map caption style relative to real size of the selected paper format.
        $sheetOfPaperMapCaption.attr('style', this.get('_mapCaptionRealStyle'));

        // Set sheet of paper map style relative to real size of the selected paper format.
        $sheetOfPaperMap.attr('style', this.get('_mapRealStyle'));

        // Invalidate map size, then fit it's bounds, and then resolve resulting promise.
        this._invalidateSizeOfLeafletMap().then(() => {
          return this._fitBoundsOfLeafletMap(leafletMapBounds);
        }).then(() => {
          resolve();
        });
      }
    });
  },

  /**
    Export's map with respect to selected export options.

    @method export
  */
  export(pageNumber) {
    let $sheetOfPaper = this.get('_$sheetOfPaper');
    let $sheetOfLegend = this.get('_$sheetOfLegend');
    let exportSheetOfPaper = () => {
      return window.html2canvas($sheetOfPaper[0], {
        useCORS: true
      }).then((canvas) => {
        let type = 'image/png';
        return {
          data: canvas.toDataURL(type),
          width: canvas.width,
          height: canvas.height,
          type: type
        };
      });
    };

    let exportSheetOfLegend = () => {
      $sheetOfPaper.addClass('hidden');
      $sheetOfLegend.removeClass('hidden');

      return window.html2canvas($sheetOfLegend[0], {
        useCORS: true
      }).then((canvas) => {
        $sheetOfLegend.addClass('hidden');
        $sheetOfPaper.removeClass('hidden');

        let type = 'image/png';
        return {
          data: canvas.toDataURL(type),
          width: canvas.width,
          height: canvas.height,
          type: type
        };
      });
    };

    // Print second page.
    if (pageNumber === '2') {
      return exportSheetOfLegend();
    }

    let leafletMap = this.get('leafletMap');
    let $leafletMap = Ember.$(leafletMap._container);
    let $leafletMapWrapper = $leafletMap.parent();
    let leafletMapWrapperBackground = $leafletMapWrapper.css(`background`);

    let $leafletMarkers = Ember.$('.leaflet-pane.leaflet-marker-pane', $leafletMap);
    let $leafletShadows = Ember.$('.leaflet-pane.leaflet-shadow-pane', $leafletMap);
    $leafletMarkers.attr('data-html2canvas-ignore', 'true');
    $leafletMarkers.css({ 'width': $leafletMap.css('width'), 'height': $leafletMap.css('height') });
    $leafletShadows.attr('data-html2canvas-ignore', 'true');
    $leafletShadows.css({ 'width': $leafletMap.css('width'), 'height': $leafletMap.css('height') });

    // Export only map without markers.
    return window.html2canvas($leafletMap[0], {
      useCORS: true
    }).then((canvas) => {
      $leafletShadows.removeAttr('data-html2canvas-ignore');
      let drawContext = canvas.getContext('2d');

      // Export marker's shadows.
      return window.html2canvas($leafletShadows[0], {
        useCORS: true
      }).then((shadowsCanvas) => {
        drawContext.drawImage(shadowsCanvas, 0, 0);
        $leafletMarkers.removeAttr('data-html2canvas-ignore');
        $leafletShadows.css({ 'width': 0, 'height': 0 });

        // Export markers.
        return window.html2canvas($leafletMarkers[0], {
          useCORS: true
        }).then((markersCanvas) => {
          drawContext.drawImage(markersCanvas, 0, 0);
          $leafletMarkers.css({ 'width': 0, 'height': 0 });

          // Then we hide map container.
          $leafletMap.hide();
          $leafletMap.attr('data-html2canvas-ignore', 'true');

          // And set exported map's DataURL as map wrapper's background image.
          $leafletMapWrapper.css(`background`, `url(${canvas.toDataURL('image/png')})`);

          // Now we export whole sheet of paper (with caption and already exported map).
          return exportSheetOfPaper();
        });
      });
    }).then((exportedSheetOfPaper) => {
      // Restore map wrapper's original background.
      $leafletMapWrapper.css(`background`, leafletMapWrapperBackground);

      // Show hidden map container.
      $leafletMap.removeAttr('data-html2canvas-ignore');
      $leafletMap.show();

      // Finally return a result.
      return exportedSheetOfPaper;
    });
  },

  /**
    Performs after export clean up.

    @method afterExport
  */
  afterExport(pageNumber) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      // Sheet of paper with legend or with interactive map, which will be prepered for export and then exported.
      let $sheetOfPaper = pageNumber === '2' ? this.get('_$sheetOfLegend') : this.get('_$sheetOfPaper');
      this.set('_isPreview', true);

      let $legendControlMap = Ember.$(`.${flexberryClassNames.legendControlMap}`, $sheetOfPaper);
      let $sheetOfPaperClone = this.get('_$sheetOfPaperClone');
      let $sheetOfPaperParent = $sheetOfPaperClone.parent();

      $sheetOfPaper.attr('style', this.get('_sheetOfPaperPreviewStyle'));
      $legendControlMap.attr('style', this.get('_mapCaptionPreviewStyle'));

      $sheetOfPaperClone.remove();
      this.set('_$sheetOfPaperClone', null);

      // Place sheet of papaer in the preview dialog again.
      $sheetOfPaper.appendTo($sheetOfPaperParent[0]);

      let $body = $sheetOfPaper.closest('body');
      $body.css('height', '');
      $body.css('width', '');

      if (pageNumber === '2') {
        resolve();
      } else {
        let leafletMap = this.get('leafletMap');
        let leafletMapBounds = leafletMap.getBounds();
        let $sheetOfPaperMap = Ember.$(`.${flexberryClassNames.sheetOfPaperMap}`, $sheetOfPaper);
        let $sheetOfPaperMapCaption = Ember.$(`.${flexberryClassNames.sheetOfPaperMapCaption}`, $sheetOfPaper);

        // Set sheet of paper map caption style relative to preview size of the selected paper format.
        $sheetOfPaperMapCaption.attr('style', this.get('_mapCaptionPreviewStyle'));

        // Set sheet of paper map style relative to real size of the selected paper format.
        $sheetOfPaperMap.attr('style', this.get('_mapPreviewStyle'));

        // Invalidate map size, then fit it's bounds, and then resolve resulting promise.
        this._invalidateSizeOfLeafletMap().then(() => {
          return this._fitBoundsOfLeafletMap(leafletMapBounds);
        }).then(() => {
          resolve();
        });
      }
    });
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

    // Image formats supported by canvas.toDataURL method (see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL)
    // except XICON, SVG, and WEBP which aren't suitable for the high resolution raster images representing exported map.
    this.set('_availableFileTypes', Ember.A(['PNG', 'JPEG', 'JPG', 'GIF', 'BMP', 'TIFF']));

    this.set('_availablePaperFormats', Ember.A(Object.keys(paperFormatsInMillimeters)));

    // Initialize print/export options.
    let defaultMapCaption = this.get('defaultMapCaption');
    this.set('_options', Ember.$.extend(true, {}, defaultOptions, {
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

    // Compute and remember current screen approximate DPI.
    this.set('_dpi', this._getDpi());

    let dialogComponent = this.get(`childViews`)[0];

    let $sheetOfPaper = dialogComponent.$(`.${flexberryClassNames.sheetOfPaper}`);
    let $sheetOfLegend = dialogComponent.$(`.${flexberryClassNames.sheetOfLegend}`);
    this.set(`_$sheetOfPaper`, $sheetOfPaper);
    this.set('_sheetOfPaperPreviewHeight', $sheetOfPaper.outerHeight());
    this.set(`_$sheetOfLegend`, $sheetOfLegend);

    let $mapCaption = Ember.$(`.${flexberryClassNames.sheetOfPaperMapCaption}`, $sheetOfPaper);
    let mapHeightDelta = parseInt($sheetOfPaper.css('padding-top')) +
      parseInt($sheetOfPaper.css('padding-bottom')) +
      parseInt($mapCaption.css('margin-top')) +
      parseInt($mapCaption.css('margin-bottom'));
    this.set('_mapHeightDelta', mapHeightDelta);

    let $tabularMenuTabItems = dialogComponent.$(`.tabular.menu .tab.item`);
    this.set(`_$tabularMenuTabItems`, $tabularMenuTabItems);

    let $tabularMenuTabs = dialogComponent.$(`.tab.segment`);
    this.set(`_$tabularMenuTabs`, $tabularMenuTabs);

    // Attach 'click' event handler for tabular menu tabs before Semantic UI tabular menu will be initialized.
    $tabularMenuTabItems.on(`click`, this.get(`actions.onSettingsTabClick`));

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

    this.set('leafletMap', null);
    this.set('_$leafletMapClone', null);
    this.set(`_$sheetOfPaper`, null);
    this.set(`_$sheetOfPaperClone`, null);

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
