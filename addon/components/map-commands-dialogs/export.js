/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/map-commands-dialogs/export';
import html2canvasClone from '../../utils/html2canvas-clone';
import { fitBounds } from '../../utils/zoom-to-bounds';

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
  pageNumber2Selected: false,
  additionalPageNumber: -1
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
  content: 'flexberry-dialog-content',
  settingsColumn: flexberryClassNamesPrefix + '-settings-column',
  settingsColumnInner: flexberryClassNamesPrefix + '-settings-column-inner',
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
    '_options.legendPosition',
    '_options.displayMode',
    function () {
      let height = this.get('_sheetOfPaperRealHeight');
      const mapPadding = this.get('mapPadding');
      let padding = (this.get('_options.displayMode') !== 'map-only-mode') ? `0 ${mapPadding}px` : `${mapPadding}px`;

      return Ember.String.htmlSafe(
        `height: ${height}px; ` +
        `width: ${this.get('_sheetOfPaperRealWidth')}px;` +
        `padding: ${padding};` +
        `border: none`);
    }
  ),

  /**
   * Array with legend pages when legends on second page.
   * Not computed because of every call recompute.
   * Better to store value in static variable
   */
  additionalPages: Ember.A(),

  /**
   * Observer to compute legend pages
   */
  additionalPagesObserver: Ember.observer('_options.legendPosition', '_sheetOfPaperPreviewScaleFactor', function () {
    let additionalPages = Ember.A();
    if (this.get('_options.legendPosition') === 'second-page') {
      let legendContainer = Ember.$('.flexberry-export-map-command-dialog-sheet-of-legend')[0];
      if (legendContainer) {
        let mapPadding = this.get('mapPadding') * this.get('_sheetOfPaperPreviewScaleFactor');
        let legendCopyContainer = Ember.$(legendContainer).clone();
        legendCopyContainer.css('position', 'absolute');
        legendCopyContainer.css('top', '0');
        legendCopyContainer.css('left', '0');
        legendCopyContainer.css('padding', `${mapPadding}px`);
        legendCopyContainer.css('columns', '2');
        legendCopyContainer.css('column-fill', 'auto');
        legendCopyContainer.css('column-gap', `${mapPadding}px`);
        legendCopyContainer.css('column-gap', `${mapPadding}px`);
        legendCopyContainer.css('overflow', `hidden`);
        legendCopyContainer.appendTo('body');
        legendCopyContainer.removeClass('hidden');
        let _this = this;
        let legends = Ember.$('.ember-view.layer-legend', legendCopyContainer[0]);
        legends.each(function () {
          Ember.$(this).css('visibility', 'visible');
          Ember.$(this).css('position', 'relative');
        });
        legendCopyContainer.waitForImages(function () {
          let legendReduce = [...legends];
          let startIndex = 0;
          let count = 2;
          while (legendReduce.length > 0) {
            let lastVisibleIndex = legendReduce.filter((l) => _this.isElementFullyVisibleInContainer(l, legendCopyContainer[0])).length - 1;
            additionalPages.pushObject({
              index: count,
              start: startIndex,
              end: startIndex + lastVisibleIndex
            });
            count++;
            startIndex += lastVisibleIndex + 1;
            for (let i = 0; i <= lastVisibleIndex; i++) {
              legendReduce[i].remove();
            }

            legendReduce = legendReduce.slice(lastVisibleIndex + 1);
          }

          legendCopyContainer.remove();
          Ember.set(_this, 'additionalPages', additionalPages);
        });
      }
    } else {
      Ember.set(this, 'additionalPages', Ember.A());
    }
  }),

  /**
    Sheet of paper container height.
    Initializes in 'didInsertElement' hook.

    @property _sheetOfPaperInitialHeight
    @type Number
    @private
    @readOnly
  */
  _sheetOfPaperInitialHeight: null,

  /**
     Sheet of paper container width.
     Initializes in 'didInsertElement' hook.

     @property _sheetOfPaperInitialWidth
     @type Number
     @private
     @readOnly
   */
  _sheetOfPaperInitialWidth: null,

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
    '_sheetOfPaperInitialHeight',
    '_sheetOfPaperInitialWidth',
    '_sheetOfPaperRealHeight',
    '_sheetOfPaperRealWidth',
    '_options.paperOrientation',
    function () {
      let sheetOfPaperInitialWidth = this.get('_sheetOfPaperInitialWidth');
      let sheetOfPaperRealWidth = this.get('_sheetOfPaperRealWidth');

      let sheetOfPaperInitialHeight = this.get('_sheetOfPaperInitialHeight');
      let sheetOfPaperRealHeight = this.get('_sheetOfPaperRealHeight');

      let sheetOfPaperPreviewScaleFactor;

      if (!Ember.isNone(sheetOfPaperInitialWidth) && !Ember.isNone(sheetOfPaperRealWidth) &&
        !Ember.isNone(sheetOfPaperInitialHeight) && !Ember.isNone(sheetOfPaperRealHeight)) {
        let widthScale = sheetOfPaperInitialWidth / sheetOfPaperRealWidth;
        let heightScale = sheetOfPaperInitialHeight / sheetOfPaperRealHeight;

        sheetOfPaperPreviewScaleFactor = widthScale < heightScale ? widthScale : heightScale;
      }

      return sheetOfPaperPreviewScaleFactor;
    }
  ),

  /**
  Sheet of paper preview height.

    @property _sheetOfPaperPreviewHeight
    @type Number
    @private
    @readOnly
  */
  _sheetOfPaperPreviewHeight: Ember.computed(
    '_sheetOfPaperRealHeight',
    '_sheetOfPaperPreviewScaleFactor',
    function () {
      let sheetOfPaperPreviewScaleFactor = this.get('_sheetOfPaperPreviewScaleFactor');
      if (Ember.isNone(sheetOfPaperPreviewScaleFactor)) {
        return null;
      }

      return Math.round(this.get('_sheetOfPaperRealHeight') * sheetOfPaperPreviewScaleFactor);
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
    'mapPadding',
    'sheetOfPaperPreviewScaleFactor',
    '_options.legendPosition',
    '_options.pageNumber2Selected',
    '_options.displayMode',
    function () {
      let sheetOfPaperPreviewWidth = this.get('_sheetOfPaperPreviewWidth');
      let sheetOfPaperPreviewHeight = this.get('_sheetOfPaperPreviewHeight');
      let mapPadding = this.get('mapPadding') * this.get('_sheetOfPaperPreviewScaleFactor');
      if (Ember.isNone(sheetOfPaperPreviewHeight) || Ember.isNone(sheetOfPaperPreviewWidth)) {
        return Ember.String.htmlSafe(``);
      }

      let padding = (this.get('_options.displayMode') !== 'map-only-mode') ? `0 ${mapPadding}px` : `${mapPadding}px`;

      let styleObject = {
        height: {
          value: sheetOfPaperPreviewHeight,
          addPx: true,
        },
        width: {
          value: sheetOfPaperPreviewWidth,
          addPx: true,
        },
        padding: {
          value: padding,
          addPx: false,
        }
      };

      if (this.get('_options.pageNumber2Selected')) {
        styleObject.padding = {
          value: mapPadding,
          addPx: true,
        };
        styleObject.columns = {
          value: 2,
          addPx: false
        };
        styleObject['column-fill'] = {
          value: 'auto',
          addPx: false,
        };
        styleObject['column-gap'] = {
          value: mapPadding,
          addPx: true,
        };
      }

      return Ember.String.htmlSafe(Object.keys(styleObject).reduce((accum, key) => {
        let value = styleObject[key].value;
        let addPx = styleObject[key].addPx;
        accum = `${key}: ${value}${addPx ? 'px' : ''};${accum}`;
        return accum;
      }, ''));

    }
  ),

  /**
   * Style is needed to be copied while exporting
   * Also needed to rewrite deep children
   */
  legendCustomStyle: Ember.computed('', function() {
    return Ember.String.htmlSafe(`<style>
    .flexberry-export-map-command-dialog-legend-control-map .layer-legend {
      display: block !important;
      vertical-align: top;
      margin-bottom: 6px;
      overflow: hidden;
    }
    .flexberry-export-map-command-dialog-legend-control-map .layer-legend-image-wrapper {
      float: none !important;
    }
    </style>`);
  }),

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
      const captionHeight = this.get('_options.captionFontSize') * parseFloat(this.get('_options.captionLineHeight'));
      let captionTopMargin = (this.get('mapPadding') - captionHeight) / 2;
      if (captionTopMargin < 0) {
        captionTopMargin = 0;
      }

      return Ember.String.htmlSafe(
        `font-family: "${this.get('_options.captionFontFamily')}"; ` +
        `line-height: ${this.get('_options.captionLineHeight')}; ` +
        `font-size: ${this.get('_options.captionFontSize')}px; ` +
        `font-weight: ${this.get('_options.captionFontWeight')}; ` +
        `font-style: ${this.get('_options.captionFontStyle')}; ` +
        `text-decoration: ${this.get('_options.captionFontDecoration')}; ` +
        `color: ${this.get('_options.captionFontColor')}; ` +
        `margin-top: ${captionTopMargin}px;` +
        `margin-bottom: ${captionTopMargin}px;` +
        `height: ${this.get('_mapCaptionRealHeight')}px;` +
        'overflow: hidden;' +
        'text-overflow: ellipsis;' +
        'white-space: nowrap;');
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
   * Padding for sheet of paper
   */
  mapPadding: 48,

  /**
   * Legend font size
   */
  legendFontSize: 18,

  /**
   * Legend line height
   */
  legendLineHeight: 20,

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

      const captionHeight = mapCaptionPreviewFontSize * parseFloat(this.get('_options.captionLineHeight'));
      let sheetOfPaperPreviewScaleFactor = this.get('_sheetOfPaperPreviewScaleFactor');
      let captionTopMargin = ((this.get('mapPadding') * sheetOfPaperPreviewScaleFactor) - captionHeight) / 2;
      if (captionTopMargin < 0) {
        captionTopMargin = 0;
      }

      return Ember.String.htmlSafe(
        `font-family: "${this.get('_options.captionFontFamily')}"; ` +
        `line-height: ${this.get('_options.captionLineHeight')}; ` +
        `font-size: ${mapCaptionPreviewFontSize}px; ` +
        `font-weight: ${this.get('_options.captionFontWeight')}; ` +
        `font-style: ${this.get('_options.captionFontStyle')}; ` +
        `text-decoration: ${this.get('_options.captionFontDecoration')}; ` +
        `height: ${captionHeight}px;` +
        `margin-top: ${captionTopMargin}px;` +
        `margin-bottom: ${captionTopMargin}px;` +
        `color: ${this.get('_options.captionFontColor')};` +
        'overflow: hidden;' +
        'text-overflow: ellipsis;' +
        'white-space: nowrap;');
    }
  ),

  /**
    Map legend real style.

    @property _mapLegendRealStyle
    @type String
    @private
    @readOnly
  */
  _mapLegendRealStyle: Ember.computed(
    'legendFontSize',
    'legendLineHeight',
    function () {
      return Ember.String.htmlSafe(
        `font-family: "Times New Roman"; ` +
        `line-height: ${this.get('legendLineHeight')}px;` +
        `font-size: ${this.get('legendFontSize')}px;` +
        `color: black;`);
    }
  ),

  /**
    Map caption preview style.

    @property _mapLegendPreviewStyle
    @type String
    @private
    @readOnly
  */
  _mapLegendPreviewStyle: Ember.computed(
    '_sheetOfPaperPreviewScaleFactor',
    'legendFontSize',
    'legendLineHeight',
    function () {
      let sheetOfPaperPreviewScaleFactor = this.get('_sheetOfPaperPreviewScaleFactor');
      return Ember.String.htmlSafe(
        `font-family: "Times New Roman"; ` +
        `line-height: ${this.get('legendLineHeight') * sheetOfPaperPreviewScaleFactor}px;` +
        `font-size: ${this.get('legendFontSize') * sheetOfPaperPreviewScaleFactor}px; ` +
        `color: black;`);
    }
  ),

  /**
    Map caption preview style.

    @property _mapLegendPreviewStyle
    @type String
    @private
    @readOnly
  */
  _mapLegendPreviewHeight: Ember.computed(
    '_sheetOfPaperPreviewScaleFactor',
    'legendLineHeight',
    function () {
      let sheetOfPaperPreviewScaleFactor = this.get('_sheetOfPaperPreviewScaleFactor');
      return Math.ceil(this.get('legendLineHeight') * sheetOfPaperPreviewScaleFactor);
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

    return (imageSrc) ? elementWidth : elementWidth + height;
  },

  /**
   * Observe map display mod and turn off legend
   */
  mapOnlyModeObserver: Ember.observer('_options.displayMode', function() {
    if (this.get('_options.displayMode') === 'map-only-mode') {
      this.set('_options.legendControl', false);
      this.set('_options.scaleControl', false);
      this.send('onPageChange', '1', -1);
    }
  }),
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
    '_sheetOfPaperPreviewScaleFactor',
    function () {
      let lineCount = 1;
      let layers = this.get('layers');
      let legends = this.get('legends');
      let legendsInfo = this._getLayersInfo(layers, legends);
      let padding = this.get('mapPadding') * this.get('_sheetOfPaperPreviewScaleFactor');
      let legendWidth = this.get('_sheetOfPaperPreviewWidth') - (padding * 2);
      let cutWidth = legendWidth;

      legendsInfo.forEach(function (legendInfo) {
        if (Ember.isBlank(legendInfo)) {
          legendInfo = {};
        }

        let fontSize = this.get('legendFontSize') * this.get('_sheetOfPaperPreviewScaleFactor');

        let font = {
          'font-family': this.get('_options.captionFontFamily'),
          'line-height': this.get('_options.captionLineHeight'),
          'font-size': `${fontSize}px`,
          'font-weight': this.get('_options.captionFontWeight'),
          'font-style': this.get('_options.captionFontStyle')
        };

        let textWidth = this._getLayerLegendWidth(legendInfo.name, font, legendInfo.image, this.get('_mapLegendPreviewHeight'));
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
    'legendLineHeight',
    '_mapHeightDelta',
    function () {
      if (this.get('_options.displayMode') === 'map-only-mode') {
        return Ember.String.htmlSafe(`height: 100%;`);
      }

      let legendHeight = this.get('legendLineHeight');
      let legendLines = this.get('_mapLegendLines');
      const padding = this.get('mapPadding');

      // 6 - is margin from css
      legendHeight = (legendHeight + 6) * legendLines + legendStyleConstants.heightMargin + padding;

      if (!this.get('_options.legendUnderMap')) {
        legendHeight = this.get('mapPadding');
      }

      const mapCaptionRealHeight = this.get('_mapCaptionRealHeight');
      const mapCaptionHeight = mapCaptionRealHeight < padding ? padding : mapCaptionRealHeight;

      let pxHeightValue = this.get('_sheetOfPaperRealHeight') -
        mapCaptionHeight -
        legendHeight;

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
    '_mapLegendPreviewHeight',
    '_mapHeightDelta',
    '_options.legendControl',
    function () {
      let sheetOfPaperPreviewHeight = this.get('_sheetOfPaperPreviewHeight');
      let mapCaptionPreviewHeight = this.get('_mapCaptionPreviewHeight');
      if (Ember.isNone(sheetOfPaperPreviewHeight) || Ember.isNone(mapCaptionPreviewHeight)) {
        return Ember.String.htmlSafe(``);
      }

      const padding = (this.get('mapPadding') * this.get('_sheetOfPaperPreviewScaleFactor'));

      // Real map size has been changed, so we need to refresh it's size after render, otherwise it may be displayed incorrectly.
      Ember.run.scheduleOnce('afterRender', () => {
        this._invalidateSizeOfLeafletMap();

        // Logic for understand are there any invisible layers (should add '...'?)
        let container = Ember.$('.flexberry-export-map-command-dialog-sheet-of-paper')[0];
        let _this = this;
        this.set('isBusy', true);
        Ember.$(container).waitForImages(function() {
          let legends = Ember.$('.ember-view.layer-legend', container);
          legends.each(function () {
            Ember.$(this).css('visibility', 'visible');
          });

          let firstInvisibleIndex = legends.length;
          legends.each(function(l) {
            if (!_this.isElementFullyVisibleInContainer(legends[l], container, padding) && l < firstInvisibleIndex) {
              firstInvisibleIndex = l;
            }
          });
          let lastVisible = (firstInvisibleIndex > 0 && firstInvisibleIndex < legends.length) ? legends[firstInvisibleIndex - 1] : null;
          let invisibleLegends = legends.filter((l) => !_this.isElementFullyVisibleInContainer(legends[l], container));
          if (_this.get('_options.legendUnderMap')) {
            if (!Ember.$('label#export-legend-more').length && invisibleLegends.length) {
              if (!lastVisible) {
                Ember.$('.flexberry-export-map-command-dialog-legend-control-map', container).prepend('<label id="export-legend-more">...</label>');
              } else {
                Ember.$('.layer-legend-image-wrapper:not(.layer-caption)', lastVisible).append('<label id="export-legend-more">...</label>');
              }
            } else if (!invisibleLegends.length) {
              Ember.$('label#export-legend-more').remove();
            }

            for (let i = firstInvisibleIndex; i < legends.length; i++) {
              Ember.$(legends[i]).css('visibility', 'hidden');
            }
          }

          _this.set('isBusy', false);
        });
      });

      if (this.get('_options.displayMode') === 'map-only-mode') {
        return Ember.String.htmlSafe(`height: 100%;`);
      }

      var legendHeight = this.get('_mapLegendPreviewHeight');
      var legendLines = this.get('_mapLegendLines');

      // 6 - is margin from css
      legendHeight = (legendHeight + 6) * legendLines + padding + legendStyleConstants.heightMargin; // margin
      if (!this.get('_options.legendUnderMap') || !this.get('_options.legendControl')) {
        legendHeight = padding;
      }

      const mapCaptionHeight = mapCaptionPreviewHeight < padding ? padding : mapCaptionPreviewHeight;
      let pxHeightValue = sheetOfPaperPreviewHeight - mapCaptionHeight -
        legendHeight;

      return Ember.String.htmlSafe(`height: ${pxHeightValue}px; min-height: 60%;`);
    }
  ),

  /**
   * Is element is visible in container.
   * For "..." add if legend is not fully rendered in container.
   * @param {DOM} element
   * @param {DOM} container
   * @param {Float} bottomPadding
   * @returns Boolean
   */
  isElementFullyVisibleInContainer(element, container, bottomPadding) {
    const elementSettings = element.getBoundingClientRect();
    const containerSettings = container.getBoundingClientRect();
    let padding = (bottomPadding) ? bottomPadding : 0;
    return (
      (elementSettings.left > containerSettings.left) &&
      (elementSettings.top > containerSettings.top) &&
      (elementSettings.right < containerSettings.right) &&
      (elementSettings.bottom < (containerSettings.bottom - padding))
    );
  },

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
    Leaflet map's initial zoom which must be restored after dialog will be closed.

    @property _leafletMapInitialZoom
    @type Number
    @private
  */
  _leafletMapInitialZoom: null,

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

  _getOptions(e, type) {
    if (this.get('_options.legendSecondPage')) {
      Ember.set(e, 'exportOptions', {
        type: type,
        data: [this._getLeafletExportOptions('1', -1), ...this.get('additionalPages').map((btn, index) => this._getLeafletExportOptions('2', index))]
      });
    } else {
      Ember.set(e, 'exportOptions', {
        type: type,
        data: [this._getLeafletExportOptions('1', -1)]
      });
    }
  },

  /**
    Flag: whether to recalc scale on map zoom change.

    @property recalcOnZoomChange
    @type Boolean
    @default null
  */
  recalcOnZoomChange: null,

  /**
    Saves the value zoomDelta for map.

    @property zoomDelta
    @type Numer
    @default null
  */
  zoomDelta: null,

  /**
    Saves the value zoomSnap for map.

    @property zoomSnap
    @type Numer
    @default null
  */
  zoomSnap: null,

  /**
    Saves the value wheelPxPerZoomLevel for map.

    @property wheelPxPerZoomLevel
    @type Numer
    @default null
  */
  wheelPxPerZoomLevel: null,

  /**
    Saves the value zoom for map.

    @property zoom
    @type Numer
    @default null
  */
  zoom: null,

  /**
    Saves the value scales for map.

    @property scales
    @type Array
    @default null
  */
  scales: null,

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
      @param {Integer} additionalPageNumber Additional legend page number.
    */
    onPageChange(newPageNumber, additionalPageNumber) {
      if (additionalPageNumber >= 0) {
        let indexes = this.get('additionalPages')[additionalPageNumber];
        let legends = Ember.$('.ember-view.layer-legend', this.get('_$sheetOfLegend'));
        legends.each(function() {
          Ember.$(this).css('visibility', 'hidden');
          Ember.$(this).css('position', 'absolute');
        });

        for (let i = indexes.start; i <= indexes.end; i++) {
          Ember.$(legends[i]).css('visibility', 'visible');
          Ember.$(legends[i]).css('position', 'relative');
        }
      }

      this.set('_options.pageNumber', newPageNumber);
      this.set('_options.additionalPageNumber', additionalPageNumber);
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
    onErrorMessageShow() { },

    /**
      Handler for error 'ui-message' component 'onHide' action.

      @method actions.onErrorMessageHide
    */
    onErrorMessageHide() {
      this.set('showErrorMessage', false);
    },

    onExport(e) {
      this._getOptions(e, 'export');

      this.sendAction('approve', e);
    },

    onPrint(e) {
      this._getOptions(e, 'print');

      this.sendAction('approve', e);
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.beforeShow:method"}}'flexberry-dialog' component's 'beforeShow' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryExportMapCommandDialogComponent/sendingActions.beforeShow:method"}}'beforeShow' action{{/crossLink}}.

      @method actions.onBeforeShow
    */
    onBeforeShow(e) {
      this.sendAction('beforeShow', e);

      // Initialize default print/export options.
      this.setDefaultExportOptions();

      // Switch scale control
      let leafletMap = this.get('leafletMap');
      let switchScaleControlMapName = this.get('switchScaleControlMapName');
      if (!Ember.isNone(switchScaleControlMapName) &&
        leafletMap.hasOwnProperty('switchScaleControl' + switchScaleControlMapName) &&
        leafletMap['switchScaleControl' + switchScaleControlMapName].options.recalcOnZoomChange) {
        this.set('recalcOnZoomChange', true);
        this.set('zoomDelta', leafletMap.options.zoomDelta);
        this.set('zoomSnap', leafletMap.options.zoomSnap);
        this.set('wheelPxPerZoomLevel', leafletMap.options.wheelPxPerZoomLevel);
        this.set('zoom', leafletMap.getZoom());
        leafletMap.options.zoomDelta = 1;
        leafletMap.options.zoomSnap = 1;
        leafletMap.options.wheelPxPerZoomLevel = 60;

        let $leafletMap = Ember.$(leafletMap._container);
        let $leafletMapControls = Ember.$('.leaflet-control-container', $leafletMap);
        let $scaleControl = Ember.$('.leaflet-control-scale-line', $leafletMapControls);
        if ($scaleControl.length === 1) {
          Ember.$($scaleControl[0]).parent().hide();
        } else {
          Ember.$($scaleControl[1]).parent().hide();
        }
      }
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.beforeHide:method"}}'flexberry-dialog' component's 'beforeHide' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryExportMapCommandDialogComponent/sendingActions.beforeHide:method"}}'beforeHide' action{{/crossLink}}.

      @method actions.onBeforeHide
    */
    onBeforeHide(e) {
      this.set('_isDialogShown', false);

      // Switch scale control
      if (this.get('recalcOnZoomChange')) {
        let leafletMap = this.get('leafletMap');
        this.set('recalcOnZoomChange', null);
        leafletMap.options.zoomDelta = this.get('zoomDelta');
        leafletMap.options.zoomSnap = this.get('zoomSnap');
        leafletMap.options.wheelPxPerZoomLevel = this.get('wheelPxPerZoomLevel');
        leafletMap.setZoom(this.get('zoom'));
        this.set('zoomDelta', null);
        this.set('zoomSnap', null);
        this.set('wheelPxPerZoomLevel', null);
        this.set('zoom', null);
      }

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
    let $leafletMap = Ember.$(leafletMap._container);
    let $leafletMapControls = Ember.$('.leaflet-control-container', $leafletMap);
    let $exportScaleControl = Ember.$('.leaflet-control-scale.export', $leafletMapControls);
    let $mainScaleControl = Ember.$('.leaflet-control-scale.main', $leafletMapControls);
    let $scaleCotrol = Ember.$('.leaflet-control-scale-line', $leafletMapControls);

    if (newMapCanBeShown) {
      this._showLeafletMap();
      $exportScaleControl.show();
      $mainScaleControl.hide();
      if ($scaleCotrol.length > 1) {
        Ember.$($scaleCotrol[1]).parent().hide();
      }
    } else {
      this._hideLeafletMap();
      $exportScaleControl.hide();
      $mainScaleControl.show();
      if ($scaleCotrol.length > 1) {
        Ember.$($scaleCotrol[1]).parent().show();
      }
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
    Observers changes in properties that affect the ability to show scale map.

    @method _scaleControlDidChange
    @private
  */
  _scaleControlDidChange: Ember.observer('_options.scaleControl', function () {
    if (this.get('_options.scaleControl')) {
      Ember.run.later(() => {
        this._activeItemDropdownScale();
      }, 500);
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
    Sets active dropdown item.

    @method _activeItemDropdownScale
  */
  _activeItemDropdownScale() {
    let leafletMap = this.get('leafletMap');
    let $leafletMap = Ember.$(leafletMap._container);
    let $leafletMapControls = Ember.$('.leaflet-control-container', $leafletMap);
    let $chooseScale = Ember.$('.map-control-scalebar-ratiomenu text', $leafletMapControls).text();
    let $scaleItems = Ember.$('.map-control-scalebar-ratiomenu .map-control-scalebar-ratiomenu-item.item', $leafletMapControls);
    Ember.$.each($scaleItems, (i, item) => {
      if (Ember.$(item).text().replaceAll('\'', '') === $chooseScale) {
        Ember.$(item).addClass('active selected');
      }
    });
  },

  /**
    Fits specified leaflet map's bounds.

    @method _fitBoundsOfLeafletMap
    @param {<a href="http://leafletjs.com/reference-1.0.1.html#latlngbounds">L.LatLngBounds</a>} bounds Bounds to be fitted.
    @returns <a htef="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Promise which will be resolved when fitting will be finished.
  */
  _fitBoundsOfLeafletMap(bounds, zoom) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let leafletMap = this.get('leafletMap');
      if (Ember.isNone(zoom)) {
        zoom = leafletMap.getZoom();
      }

      leafletMap.once('moveend', () => {
        this._activeItemDropdownScale();
        resolve();
      });

      fitBounds(leafletMap, bounds, { maxZoom: zoom });
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
    let _leafletMapInitialZoom = leafletMap.getZoom();
    this.set('_leafletMapInitialZoom', _leafletMapInitialZoom);

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
    if (!this.get('_options.scaleControl')) {
      Ember.$('.leaflet-bottom.leaflet-left', $leafletMapControls).children().hide();
    }

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
    let leafletMapInitialZoom = this.get('_leafletMapInitialZoom');

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
    this._fitBoundsOfLeafletMap(leafletMapInitialBounds, leafletMapInitialZoom).then(() => {
      $leafletMap.appendTo($leafletMapWrapper[0]);

      // Invalidate map size and then fit it's bounds again.
      return this._invalidateSizeOfLeafletMap();
    }).then(() => { return this._fitBoundsOfLeafletMap(leafletMapInitialBounds, leafletMapInitialZoom); });
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
  _getLeafletExportOptions(pageNumber, additionalPageNumber) {
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
      return this._export({ pageNumber, additionalPageNumber });
    });

    return leafletExportOptions;
  },

  /**
    Export's map with respect to selected export options.

    @method _export
    @private
  */
  _export(options) {
    return this.beforeExport(options).then(() => {
      return this._waitForLeafletMapLayersToBeReady();
    }).then(() => {
      return this.export(options);
    }).finally(() => {
      this.afterExport(options);
    });
  },

  /**
    Prepares map for export with respect to selected export options.

    @method beforeExport
  */
  beforeExport(options) {
    this.set('_options.pageNumber', '1');

    return new Ember.RSVP.Promise((resolve, reject) => {
      // Sheet of paper with legend or with interactive map, which will be prepered for export and then exported.
      let $sheetOfPaper = options.pageNumber === '2' ? this.get('_$sheetOfLegend') : this.get('_$sheetOfPaper');
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
      $sheetOfPaper.css('backgroundColor', 'white');

      $legendControlMap.attr('style', this.get('_mapLegendRealStyle'));
      if (this.get('_options.legendPosition') === 'under-map') {
        $legendControlMap.css('margin-top', '10px');
      }

      const secondPage = this.get('_options.legendPosition') === 'second-page';

      if (secondPage && options.pageNumber === '2') {
        $sheetOfPaper.css({
          'padding': `${this.get('mapPadding')}px`,
          'columns': '2',
          'column-fill': 'auto',
          'column-gap': `${this.get('mapPadding')}px`
        });
        Ember.$('.layer-legend', $sheetOfPaper).each(function() {
          Ember.$(this).css('visibility', 'visible');
          Ember.$(this).css('position', 'relative');
        });
      }

      let _this = this;

      //Styles that missing when copy sheet to body;
      Ember.$('.layer-legend', $legendControlMap).each(function () {
        let visible = Ember.$(this).css('visibility');
        Ember.$(this).attr('style', `display: inline-block; vertical-align: top; margin-bottom: 10px; visibility:${visible};`);
        Ember.$('.layer-legend-image-wrapper', this).css('display', secondPage ? 'block' : 'inline-block');
        Ember.$('.layer-legend-image-wrapper', this).css('height', secondPage ? 'auto' : `${_this.get('legendLineHeight')}px`);
        Ember.$('.layer-legend-image-wrapper.layer-caption', this).css('vertical-align', 'top');
      });

      // Replace interactivva map inside dialog with it's static clone for a while.
      $sheetOfPaperClone.prependTo($sheetOfPaperParent[0]);

      if (options.pageNumber === '2') {
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
  export(options) {
    let $sheetOfPaper = this.get('_$sheetOfPaper');
    let $sheetOfLegend = this.get('_$sheetOfLegend');
    let exportSheetOfPaper = () => {
      return window.html2canvas($sheetOfPaper[0], {
        useCORS: true,
        onclone: function (clonedDoc) {
          html2canvasClone(clonedDoc);
        }
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
      if (options.additionalPageNumber >= 0) {
        let indexes = this.get('additionalPages')[options.additionalPageNumber];
        let legends = Ember.$('.ember-view.layer-legend', $sheetOfLegend);
        legends.each(function() {
          Ember.$(this).css('visibility', 'hidden');
          Ember.$(this).css('position', 'absolute');
        });
        for (let i = indexes.start; i <= indexes.end; i++) {
          Ember.$(legends[i]).css('visibility', 'visible');
          Ember.$(legends[i]).css('position', 'relative');
        }
      }

      return window.html2canvas($sheetOfLegend[0], {
        useCORS: true,
        onclone: function (clonedDoc) {
          html2canvasClone(clonedDoc);
        }
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
    if (options.pageNumber === '2') {
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
      useCORS: true,
      onclone: function (clonedDoc) {
        html2canvasClone(clonedDoc);
      }
    }).then((canvas) => {
      $leafletShadows.removeAttr('data-html2canvas-ignore');
      let drawContext = canvas.getContext('2d');

      // Export marker's shadows.
      return window.html2canvas($leafletShadows[0], {
        useCORS: true,
        onclone: function (clonedDoc) {
          html2canvasClone(clonedDoc);
        }
      }).then((shadowsCanvas) => {
        drawContext.drawImage(shadowsCanvas, 0, 0);
        $leafletMarkers.removeAttr('data-html2canvas-ignore');
        $leafletShadows.css({ 'width': 0, 'height': 0 });

        // Export markers.
        return window.html2canvas($leafletMarkers[0], {
          useCORS: true,
          onclone: function (clonedDoc) {
            html2canvasClone(clonedDoc);
          }
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
  afterExport(options) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      // Sheet of paper with legend or with interactive map, which will be prepered for export and then exported.
      let $sheetOfPaper = options.pageNumber === '2' ? this.get('_$sheetOfLegend') : this.get('_$sheetOfPaper');
      this.set('_isPreview', true);

      let $legendControlMap = Ember.$(`.${flexberryClassNames.legendControlMap}`, $sheetOfPaper);
      let $sheetOfPaperClone = this.get('_$sheetOfPaperClone');
      let $sheetOfPaperParent = $sheetOfPaperClone.parent();

      $sheetOfPaper.attr('style', this.get('_sheetOfPaperPreviewStyle'));
      $legendControlMap.attr('style', this.get('_mapLegendPreviewStyle'));

      $sheetOfPaperClone.remove();
      this.set('_$sheetOfPaperClone', null);

      // Place sheet of papaer in the preview dialog again.
      $sheetOfPaper.prependTo($sheetOfPaperParent[0]);

      let $body = $sheetOfPaper.closest('body');
      $body.css('height', '');
      $body.css('width', '');

      if (options.pageNumber === '2') {
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
    this.setDefaultExportOptions();

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
    this.set(`_$sheetOfLegend`, $sheetOfLegend);

    let $mapCaption = Ember.$(`.${flexberryClassNames.sheetOfPaperMapCaption}`, $sheetOfPaper);
    let mapHeightDelta = parseInt($sheetOfPaper.css('padding-bottom')) +
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

    let dialogComponent = this.get(`childViews`)[0];
    let $previewColumn = dialogComponent.$(`.${flexberryClassNames.previewColumn}`);
    let $settingsColumnInner = dialogComponent.$(`.${flexberryClassNames.settingsColumnInner}`);

    this.set('_sheetOfPaperInitialHeight', $settingsColumnInner.outerHeight());
    this.set('_sheetOfPaperInitialWidth', $previewColumn.width() - 60);

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
  },
  /**
    When the form is expanded, the default settings are set

    @method setDefaultExportOptions
  */
  setDefaultExportOptions() {
    // Initialize default print/export options.
    let defaultMapCaption = this.get('defaultMapCaption');
    this.set('_options', Ember.$.extend(true, {}, defaultOptions, {
      caption: defaultMapCaption,
      fileName: defaultMapCaption
    }));
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
