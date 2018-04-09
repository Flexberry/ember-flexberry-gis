/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../../templates/components/markers-styles/image/icon-editor';
import { translationMacro as t } from 'ember-i18n';

/**
  Component containing GUI for 'image' markers-style icon style settings.

  @class ImageMarkersStyleIconEditorComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend({
  /**

    Property containing color of ancor-picker circle.

    @property _circleColor
    @type String
    @default #ff0000
  */
  _circleColor: '#ff0000',

  /**

    Property containing radius of ancor-picker circle.

    @property _circleRadius
    @type Number
    @default 2
  */
  _circleRadius: 2,

  /**
    A value of pixels to add / substract when scaling.

    @property _scalingStep
    @type Number
    @default 10
  */
  _scalingStep: 10,

  /**
    Flag: indicates whether icon file is loading.

    @property _iconFileIsLoading
    @type Boolean
    @default false
    @private
  */
  _iconFileIsLoading: false,

  /**
    Flag: indicates whether icon file loading operation lasts a long time.

    @property _iconFileIsLoadingLongTime
    @type Boolean
    @default false
    @private
  */
  _iconFileIsLoadingLongTime: false,

  /**
    Flag: indicates whether file loading failed.

    @property _iconFileLoadingFailed
    @type Boolean
    @default false
    @private
  */
  _iconFileLoadingFailed: false,

  /**
    Icon original aspect ratio.

    @property _iconOrigAspectRatio
    @type Number
    @default 0
    @private
  */
  _iconOrigAspectRatio: 0,

  /**
    Icon file reader.

    @property _iconFileReader
    @type <a href="https://developer.mozilla.org/ru/docs/Web/API/FileReader">FileReader</a>
    @default null
    @private
  */
  _iconFileReader: null,

  /**
    Stub for flexberry-file's 'relatedModel' property.

    @property _relatedModelStub
    @type Object
    @default null
    @private
  */
  _relatedModelStub: null,

  /**
    Icon img element.

    @property _iconImage
    @type <a href="https://developer.mozilla.org/ru/docs/Web/API/HTMLImageElement/Image">Image</a>
    @default null
    @private
  */
  _iconImage: null,

  /**
    Hash containing icon size.

    @property _iconSize
    @type Object
    @private
    @readOnly
  */
  _iconSize: Ember.computed('iconSize.[]', function() {
    let iconSize = this.get('iconSize');
    return Ember.isArray(iconSize) ?
      { width: iconSize[0], height: iconSize[1] } :
      { width: 0, height: 0 };
  }),

  /**
    Hash containing icon anchor coordiantes.

    @property _iconAnchor
    @type Object
    @private
    @readOnly
  */
  _iconAnchor: Ember.computed('iconAnchor.[]', function() {
    let iconAnchor = this.get('iconAnchor');
    return Ember.isArray(iconAnchor) ?
    { x: iconAnchor[0], y: iconAnchor[1] } :
    { x: 0, y: 0 };
  }),

  /**
    Hash containing icon zoom anchor coordiantes.

    @property _iconZoomAnchor
    @type Object
    @private
    @readOnly
  */
  _iconZoomAnchor: Ember.computed('iconZoomAnchor.[]', function() {
    let iconAnchor = this.get('iconZoomAnchor');
    return Ember.isArray(iconAnchor) ?
      { x: iconAnchor[0], y: iconAnchor[1] } :
      { x: 0, y: 0 };
  }),

  /**
    Flag: indicates whether to show icon image or not.

    @property _showIconImage
    @type Boolean
    @private
    @readOnly
  */
  _showIconImage: Ember.computed('iconUrl', '_iconSize', function() {
    let iconUrl = this.get('iconUrl');
    let iconSize = this.get('_iconSize');

    return !Ember.isBlank(iconUrl) && iconSize.width > 0 && iconSize.height > 0;
  }),

  /**
    Reference to component's template.
  */
  layout,

  /**
    Component's wrapping <div> CSS-classes names.

    @property classNames
    @type String[]
    @default ['image-markers-style-icon-editor']
  */
  classNames: ['image-markers-style-icon-editor'],

  /**
    Caption to be displayed in icon cell.

    @property iconCaption
    @type String
    @default t('components.markers-styles.image.icon-editor.icon-caption')
  */
  iconCaption: t('components.markers-styles.image.icon-editor.icon-caption'),

  /**
    Caption to be displayed in icon cell.

    @property anchorCaption
    @type String
    @default t('components.markers-styles.image.icon-editor.anchor-caption')
  */
  anchorCaption: t('components.markers-styles.image.icon-editor.anchor-caption'),

  /**
    Caption to be displayed in resize cell.

    @property anchorCaption
    @type String
    @default t('components.markers-styles.image.icon-editor.resize-caption')
  */
  resizeCaption: t('components.markers-styles.image.icon-editor.resize-caption'),

  /**
    Hash containing path style settings.

    @property styleSettings
    @type String
    @default null
  */
  iconUrl: null,

  /**
    Array containing icon size.

    @property iconSize
    @type Number[]
    @default null
  */
  iconSize: null,

  /**
    Array containing icon size after resizing.

    @property iconSizehNew
    @type Number[]
    @default null
  */
  iconSizeNew: null,

  /**
    Array containing original icon size.

    @property iconSizeOrig
    @type Number[]
    @default null
  */
  iconSizeOrig: null,

  /**
    Flag: indicates whether loaded image should keep oiginal aspect ratio.

    @property iconKeepOrigAspectRatio
    @type Boolean
    @default true
  */
  iconKeepOrigAspectRatio: true,

  /**
    Array containing icon anchor coordinates.

    @property iconAnchor
    @type Number[]
    @default null
  */
  iconAnchor: null,

  /**

    Array containing icon zoom anchor coordinates.

    @property iconZoomAnchor
    @type Number[]
    @default null
  */
  iconZoomAnchor: null,

  /**
    Hash containing zoom size.

    @property __iconZoomSize
    @type Object
    @private
    @readOnly
  */
  _iconZoomSize: Ember.computed('iconZoomSize.[]', 'iconSize.[]', 'iconSizeNew', function() {
    let iconZoomSize = this.get('iconZoomSize');
    let iconSize = this.get('iconSize');

    let w = iconZoomSize[0];
    let h = iconZoomSize[1];

    if (w === 0 && h === 0) {
      w = iconSize[0];
      h = iconSize[1];
    } else {
      w = iconZoomSize[0];
      h = iconZoomSize[1];
      this.set('_isZoom', true);
    }

    return Ember.isArray(iconZoomSize) ?
      { width: w, height: h } :
      { width: 0, height: 0 };
  }),

  /**
    Flag: indicates icon is zooming.

    @property _isZoom
    @type boolean
    @default false
    @private
  */
  _isZoom: false,

  /**
    Flag: indicates if Width input is valid.
    @property invalidWidth
    @type boolean
    @default false
  */
  invalidWidth: false,

  /**
    Flag: indicates if Height input is valid.
    @property invalidHeight
    @type boolean
    @default false
  */
  invalidHeight: false,

  /**
    Array containing icon zoom size.

    @property iconZoomSize
    @type Number[]
    @default null
  */
  iconZoomSize: null,

  /**
    Property containing container size.

    @property _containerSize
    @type Number
    @default 140
    @private
  */
  _containerSize: 140, // that fits without scroll

  /**
    Flag: indicates whether to show editor shadow icon image or not.

    @property _enabled
    @type Boolean
    @private
    @default true
  */
  _enabled: true,

  /**
    Flag: indicates whether to show checkbox for shadow or not.

    @property allowDisabling
    @type Boolean
    @default false
  */
  allowDisabling: false,

  /**
    Observer enabled did change.

    @method _enabledDidChange
    @private
  */
  _enabledDidChange: Ember.observer(
    '_enabled',
    function() {
      if (!this.get('_enabled')) {
        this._clearIconFile();
      }
    }
  ),

  /**
    Clears icon style settings and related component's properties.

    @method _clearIconFile
    @private
  */
  _clearIconFile() {
    this.setProperties({
      iconUrl: null,
      iconSize: [0, 0],
      iconSizeNew: [0, 0],
      iconSizeOrig: [0, 0],
      iconAnchor: [0, 0],

      iconZoomSize: [0, 0],
      iconZoomAnchor: [0, 0],

      _iconOrigAspectRatio: 0,

      _iconFileLoadingFailed: false,
      _iconFileIsLoading: false,
      _iconFileIsLoadingLongTime: false
    });

    this.get('_iconImage').removeAttribute('src');
  },

  /**
    Observer changes in fill style for resizing.

    @method   _styleSettingsForResizingChanged
    @private
  */
  _styleSettingsForResizingChanged: Ember.observer(
    'iconKeepOrigAspectRatio',
    'iconSizeNew.0',
    'iconSizeNew.1',
    function() {
      Ember.run.once(this, '_setNewSize');
    }
  ),

  /**
    Sets new size to icon image after resizing.

    @method _setNewSize
    @private
  */
  _setNewSize() {
    this.set('invalidWidth', false);
    this.set('invalidHeight', false);
    let ratio = this.get('_iconOrigAspectRatio');
    let iconAnchor = this.get('iconAnchor');
    let [width, height] = this.get('iconSize');
    let [newWidth, newHeight] = this.get('iconSizeNew');
    newWidth = parseInt(newWidth);
    newHeight = parseInt(newHeight);

    if (isNaN(newWidth) || newWidth === 0) {
      this.set('invalidWidth', true);
      return;
    }

    if (isNaN(newHeight) || newHeight === 0) {
      this.set('invalidHeight', true);
      return;
    }

    if (this.get('iconKeepOrigAspectRatio')) {
      if (newWidth !== width) {
        newHeight = Math.round(newWidth / ratio);
        if (newHeight === 0) {
          newHeight = 1;
        }

        this.set('iconSizeNew.1', newHeight);
      } else {
        newWidth = Math.round(newHeight * ratio);
        if (newWidth === 0) {
          newWidth = 1;
        }

        this.set('iconSizeNew.0', newWidth);
      }
    }

    let oldNewRatios = [newWidth / width, newHeight / height];
    let newSize = [newWidth, newHeight];
    this.set('iconSize', newSize);
    this.set('iconAnchor', [iconAnchor[0] * oldNewRatios[0], iconAnchor[1] * oldNewRatios[1]]);

    this._onResizeIcon();
  },

  /**
    Observer changes in fill style.

    @method _styleSettingsDidChange
    @private
  */
  _styleSettingsDidChange: Ember.observer(
    'iconUrl',
    'iconSize',
    'iconAnchor',
    'iconZoomSize',
    'iconZoomAnchor',
    function() {
      Ember.run.once(this, '_sendChangeAction');
    }
  ),

  /**
    Sends 'changeStyle' action to notify about changes in icon style.

    @method _sendChangeAction
    @private
  */
  _sendChangeAction() {
    this.sendAction('changeStyle', this.getProperties('iconUrl', 'iconSize', 'iconAnchor', 'iconZoomSize', 'iconZoomAnchor'));
  },

  /**
    Loads icon file.

    @method _loadIconFile
    @param {<a href="https://developer.mozilla.org/ru/docs/Web/API/File">File</a>} iconFile Icon file to load.
    @private
  */
  _loadIconFile(iconFile) {
    let iconFileReader = this.get('_iconFileReader');
    if (Ember.isNone(iconFileReader)) {
      return;
    }

    this.setProperties({
      _iconFileLoadingFailed: false,
      _iconFileIsLoading: true,
      _iconFileIsLoadingLongTime: false,
    });

    // Allow ember to render component's GUI before file read operation will be started.
    setTimeout(() => {
      iconFileReader.readAsDataURL(iconFile);
    }, 1);

    // Show loader if read operation takes long time.
    setTimeout(() => {
      this.set('_iconFileIsLoadingLongTime', true);
    }, 500);
  },

  /**
    Handles icon file reader 'onload' event.

    @method _onLoadIconFileSuccess
    @param {Object} e Event object.
    @private
  */
  _onLoadIconFileSuccess(e) {
    let iconUrl = e.target.result;

    // Image will start loading new file and then '_onLoadIconImageSuccess' or '_onLoadIconImageError' will be called.
    this.get('_iconImage').setAttribute('src', iconUrl);
  },

  /**
    Handles icond file reader 'onerror' event.

    @method _onLoadIconFileError
    @param {Object} e Event object.
    @private
  */
  _onLoadIconFileError(e) {
    this.setProperties({
      _iconFileLoadingFailed: true,
      _iconFileIsLoading: false,
      _iconFileIsLoadingLongTime: false
    });

    this.get('_iconImage').removeAttribute('src');
  },

  /**
    Handles icon img element 'onload' event.

    @method _onLoadIconImageSuccess
    @param {Object} e Event object.
    @private
  */
  _onLoadIconImageSuccess(e) {
    let iconImage = e.target;
    let iconUrl = iconImage.src;
    let iconSize = [iconImage.width, iconImage.height];
    let iconOrigAspectRatio = iconImage.width / iconImage.height;
    let iconAnchor = [Math.round(iconImage.width / 2), Math.round(iconImage.height / 2)];
    let iconZoomSize = [iconImage.width, iconImage.height];
    let iconZoomAnchor = [Math.round(iconImage.width / 2), Math.round(iconImage.height / 2)];

    // Remember loaded image original size, URL, and new anchor's coordanates.
    this.setProperties({
      iconUrl: iconUrl,
      iconSize: iconSize,
      iconAnchor: iconAnchor,

      iconZoomSize: iconZoomSize,
      iconZoomAnchor: iconZoomAnchor,

      iconSizeNew: iconSize.slice(),
      iconSizeOrig: iconSize.slice(),
      iconKeepOrigAspectRatio: true,
      _iconOrigAspectRatio: iconOrigAspectRatio,

      _iconFileLoadingFailed: false,
      _iconFileIsLoading: false,
      _iconFileIsLoadingLongTime: false
    });

    iconImage.removeAttribute('src');

    this._onResizeIcon();
  },

  /**
    Handles icon img element 'onerror' event.

    @method _onLoadIconImageError
    @param {Object} e Event object.
    @private
  */
  _onLoadIconImageError(e) {
    this._onLoadIconFileError(e);
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    let iconSize = this.get('iconSize');
    if (Ember.isNone(iconSize)) {
      this.set('iconSize', [0, 0]);
    }

    this.set('iconSizeNew', iconSize.slice());
    this.set('iconSizeOrig', iconSize.slice());
    this.set('_iconOrigAspectRatio', iconSize[0] / iconSize[1]);

    let iconAnchor = this.get('iconAnchor');
    if (Ember.isNone(iconAnchor)) {
      this.set('iconAnchor', [0, 0]);
    }

    let iconZoomAnchor = this.get('iconZoomAnchor');
    if (Ember.isNone(iconZoomAnchor)) {
      this.set('iconZoomAnchor', [0, 0]);
    }

    let iconZoomSize = this.get('iconZoomSize');

    if (Ember.isNone(iconZoomSize)) {
      this.set('iconZoomSize', [0, 0]);
    }

    let iconFileReader = new FileReader();
    iconFileReader.onload = this._onLoadIconFileSuccess.bind(this);
    iconFileReader.onerror = this._onLoadIconFileError.bind(this);

    this.set('_iconFileReader', iconFileReader);

    let iconImage = new Image();
    iconImage.onload = this._onLoadIconImageSuccess.bind(this);
    iconImage.onerror = this._onLoadIconFileError.bind(this);

    this.set('_iconImage', iconImage);

    // Evented stub for flexberry-file's 'relatedModel' property.
    let relatedModelStub = Ember.Object.extend(Ember.Evented, {}).create();
    this.set('_relatedModelStub', relatedModelStub);

    if (this.get('allowDisabling') && Ember.isNone(this.get('iconUrl'))) {
      this.set('_enabled', false);
    }
  },

  /**
    Lifecycle hook working after element was inserted into DOM.
  */
  didInsertElement() {
    this._super(...arguments);
    this._onResizeIcon();
  },

  /**
    Deinitializes component.
  */
  willDestroy() {
    let iconFileReader = this.get('_iconFileReader');
    iconFileReader.onload = null;
    iconFileReader.onerror = null;
    this.set('_iconFileReader', null);

    let iconImage = this.get('_iconImage');
    iconImage.onload = null;
    iconImage.onerror = null;
    this.set('_iconImage', null);

    this.set('_relatedModelStub', null);

    this._super(...arguments);
  },

  /**
    Handles icon img element resize event.

    @method _onResizeIcon
    @private
  */
  _onResizeIcon() {
    let iconZoomAnchor = this.get('_iconZoomAnchor');
    let container = this.get('_containerSize');
    if (iconZoomAnchor.x === 0 && iconZoomAnchor.y === 0) {
      iconZoomAnchor = this.get('_iconAnchor');
    }

    let step = this.get('_scalingStep');

    let iconZoomSize = this.get('_iconZoomSize');
    let w = iconZoomSize.width;
    let h = iconZoomSize.height;
    let coeff = w / h;
    let oldW = w;

    if (w < container && h < container) {
      if (w > h) {
        while (w + step * coeff <= container) {
          w += step * coeff;
          h += step;
        }
      } else {
        while (h + step <= container) {
          w += step * coeff;
          h += step;
        }
      }
    } else {
      if (w > h) {
        while (w - step * coeff >= container) {
          w -= step * coeff;
          h -= step;
        }
      } else {
        while (h - step >= container) {
          w -= step * coeff;
          h -= step;
        }
      }
    }

    let ratio = w / oldW;
    this.set('iconZoomSize', [w, h]);
    this.set('iconZoomAnchor', [iconZoomAnchor.x * ratio, iconZoomAnchor.y * ratio]);

    this.set('_isZoom', true);
  },

  actions: {
    /**
      Handles flexberry-file's 'fileChange' action.

      @method actions.onIconFileChange
      @param {Object} e Action's event object.
      @param {String} e.uploadData Data containing new icon file and it's description.
    */
    onIconFileChange({ uploadData }) {
      let iconFile = uploadData && uploadData.files && uploadData.files.length > 0 ?
        uploadData.files[0] :
        null;
      if (Ember.isNone(iconFile)) {
        this._clearIconFile();
      } else {
        this._loadIconFile(iconFile);
      }
    },

    /**
      Handles icon anchor's 'click' event.
      Sets icon anchor's new coordinates.

      @method actions.onIconAnchorClick
      @param {Object} e Action's event object.
    */
    onIconAnchorClick(e) {
      let isZoom = this.get('_isZoom');
      let iconAnchor = this.get('iconAnchor');
      let iconZoomSize = this.get('iconZoomSize');
      let iconImage = this.get('iconSize');
      if (isZoom === false) {
        this.set('iconAnchor', [e.layerX, e.layerY]);
      } else {
        this.set('iconZoomAnchor', [e.layerX, e.layerY]);

        let x = iconAnchor[0];
        let y = iconAnchor[1];

        let zoomX = iconZoomSize[0] / iconImage[0];
        let zoomY =  iconZoomSize[1] / iconImage[1];

        x = Math.round(e.layerX / zoomX);
        y = Math.round(e.layerY / zoomY);

        this.set('iconAnchor', [x, y]);
      }
    },

    /**
      Handles marker icon 'click' event.
      Sets zoom in for marker.

      @method actions.onZoomInClick
      @param {Object} e Action's event object.
    */
    onZoomInClick(e) {
      let iconZoomSize = this.get('_iconZoomSize');
      let iconZoomAnchor = this.get('_iconZoomAnchor');
      if (iconZoomAnchor.x === 0 && iconZoomAnchor.y === 0) {
        iconZoomAnchor = this.get('_iconAnchor');
      }

      let newZoomAncor = [0, 0];
      let width = iconZoomSize.width;
      let height = iconZoomSize.height;
      let iconImage = this.get('_iconSize');
      let step = this.get('_scalingStep');
      let coeff = width / height;
      let ratio;

      if (iconZoomSize !== iconImage) {
        ratio = (height + step) / height;
        newZoomAncor[0] = Math.round(iconZoomAnchor.x * ratio);
        newZoomAncor[1] = Math.round(iconZoomAnchor.y * ratio);
        width = width + step * coeff;
        height = height + step;
        this.set('_isZoom', true);
        this.set('iconZoomAnchor', newZoomAncor);
        this.set('iconZoomSize', [width, height]);
      } else {
        this.set('_isZoom', false);
      }
    },

    /**
      Handles marker icon 'click' event.
      Sets zoom out for marker.

      @method actions.onZoomOutClick
      @param {Object} e Action's event object.
    */
    onZoomOutClick(e) {
      let iconZoomAnchor = this.get('_iconZoomAnchor');
      if (iconZoomAnchor.x === 0 && iconZoomAnchor.y === 0) {
        iconZoomAnchor = this.get('_iconAnchor');
      }

      let newZoomAncor = [0, 0];
      let iconZoomSize = this.get('_iconZoomSize');
      let width = iconZoomSize.width;
      let height = iconZoomSize.height;
      let iconImage = this.get('_iconSize');
      let step = this.get('_scalingStep');
      let coeff = width / height;
      let ratio;

      if (iconZoomSize !== iconImage && width - step * coeff > 20 && height - step > 20) {
        ratio = (height - step) / height;
        newZoomAncor[0] = Math.round(iconZoomAnchor.x * ratio);
        newZoomAncor[1] = Math.round(iconZoomAnchor.y * ratio);
        width = width - step * coeff;
        height = height - step;
        this.set('_isZoom', true);
        this.set('iconZoomAnchor', newZoomAncor);
        this.set('iconZoomSize', [width, height]);
      }

      if (iconZoomSize === iconImage) {
        this.set('_isZoom', false);
        this.set('iconZoomAnchor', this.get('_iconAnchor'));
      }
    },

    /**
      Handles marker icon 'click' event.
      Sets resize for marker.

      @method actions.onResizeClick
      @param {Object} e Action's event object.
    */
    onResizeClick(e) {
      this._onResizeIcon();
    },

    /**
      Handles 'set original icon size' button click
      Sets icon size to its original one.

      @method actions.setOrigIconSize
    */
    setOrigIconSize() {
      let origSize = this.get('iconSizeOrig');
      if (origSize !== null) {
        this.set('iconSizeNew', origSize.slice());
      }

    }
  }
});
