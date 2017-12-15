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
    Hash cintaining icon size.

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

    @property anchhorCaption
    @type String
    @default t('components.markers-styles.image.icon-editor.anchor-caption')
  */
  anchorCaption: t('components.markers-styles.image.icon-editor.anchor-caption'),

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
    Array containing icon anchor coordinates.

    @property iconAnchor
    @type Number[]
    @default null
  */
  iconAnchor: null,

  /**
    Flag: indicates whether to show editor shadow icon image or not.

    @property _disabled
    @type Boolean
    @private
    @default false
  */  
  _disabled: Ember.computed('iconUrl', function(){    
    let iconUrl_ = this.get('iconUrl');    
    
    if(iconUrl_!=null){        
      return true;
    }
    else{                  
      this._clearIconFile();
      return false;
    }
  }),

  /**
    Flag: indicates whether to show body of the component or not.
    @property _disabledBody
    @type Boolean
    @private
    @default true
  */
  _disabledBody: Ember.computed('_disabled', 'allowDisabling', function(){
    let disabled_ = this.get('_disabled');
    let allowDisabling_ = this.get('allowDisabling');    
    if(!allowDisabling_){      
      return true;
    }
    if(allowDisabling_ && !disabled_){           
      return false;
    }
    else{           
      return true;
    }

  }),

  /**
    Flag: indicates whether to show checkbox for shadow or not.

    @property allowDisabling
    @type Boolean
    @default false
  */
  allowDisabling: false,    

  /**
    Clears icon style settings and related component's properties.

    @method _clearIconFile
    @private
  */
  _clearIconFile() {
    this.setProperties({
      iconUrl: null,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      _iconFileLoadingFailed: false,
      _iconFileIsLoading: false,
      _iconFileIsLoadingLongTime: false
    });

    this.get('_iconImage').removeAttribute('src');    
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
    function() {
      Ember.run.once(this, '_sendChangeAction');
    }
  ),

  /**
    Sends 'change' action to notify about changes in icon style.

    @method _sendChangeAction
    @private
  */
  _sendChangeAction() {
    this.sendAction('change', this.getProperties('iconUrl', 'iconSize', 'iconAnchor'));
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
      _iconFileIsLoadingLongTime: false
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
    Handles icond file reader 'onload' event.

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

    @method _onLoadIConFileError
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
    let iconAnchor = [Math.round(iconImage.width / 2), Math.round(iconImage.height / 2)];

    // Remember loaded image original size, URL, and new anchor's coordanates.
    this.setProperties({
      iconUrl: iconUrl,
      iconSize: iconSize,
      iconAnchor: iconAnchor,
      _iconFileLoadingFailed: false,
      _iconFileIsLoading: false,
      _iconFileIsLoadingLongTime: false,      
    });

    iconImage.removeAttribute('src');
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

    let iconAnchor = this.get('iconAnchor');
    if (Ember.isNone(iconAnchor)) {
      this.set('iconAnchor', [0, 0]);
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
      } 
      else {        
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
      this.set('iconAnchor', [e.layerX, e.layerY]);
    }
              
  }
});
