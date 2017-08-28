/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../../templates/components/layers-dialogs/settings/wms';

// Regular expression used to derive whether settings' url is correct.
let urlRegex = '(https?|ftp)://(-\.)?([^\s/?\.#-]+\.?)+(/[^\s]*)?';

/**
  Settings-part of WMS layer modal dialog.

  @class WmsLayerSettingsComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend({
  /**
    Array containing available info formats.

    @property _availableInfoFormats
    @type String[]
    @private
  */
  _availableInfoFormats: null,

  /**
    Flag: indicates whether to show error message or not.

    @property _showErrorMessage
    @type Boolean
    @readOnly
  */
  _showErrorMessage: false,

  /**
    Reference to component's url regex.
  */
  urlRegex,

  /**
    Reference to component's template.
  */
  layout,

  /**
    Overridden ['tagName'](http://emberjs.com/api/classes/Ember.Component.html#property_tagName)
    is empty to disable component's wrapping <div>.

    @property tagName
    @type String
    @default ''
  */
  tagName: '',

  /**
    Editing layer deserialized type-related settings.

    @property settings
    @type Object
    @default null
  */
  settings: null,

  /**
    This layer bounding box.

    @property bounds
    @type <a href="http://leafletjs.com/reference-1.1.0.html#latlngbounds">L.LatLngBounds</a>
    @readonly
  */
  bounds: null,

  /**
    Get capabilities promise.

    @property getCapabilitiesPromise
    @type <a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    @default null
  */
  getCapabilitiesPromise: null,

  /**
    Get capabilities promise error message.

    @property getCapabilitiesPromise
    @type String
    @default null
  */
  getCapabilitiesPromiseError: null,

  /**
    Get capabilities button error message.

    @property getCapabilitiesErrorMessage
    @type String
    @readonly
  */
  getCapabilitiesErrorMessage: Ember.computed(
    'getCapabilitiesPromiseError',
    'i18n',
    'settings.url',
    'settings.layers',
    'settings.version',
    function () {
      let getCapabilitiesPromiseError = this.get('getCapabilitiesPromiseError');

      if (!Ember.isBlank(getCapabilitiesPromiseError)) {
        this.set('getCapabilitiesPromiseError', null);
        return getCapabilitiesPromiseError;
      }

      let message;
      let fields = Ember.A();

      let i18n = this.get('i18n');

      let url = this.get('settings.url');
      let layers = this.get('settings.layers');
      let version = this.get('settings.version');

      if (Ember.isBlank(url) || Ember.isBlank(url.toString().match(new RegExp(urlRegex)))) {
        fields.pushObject(i18n.t('components.layers-dialogs.settings.wms.url-textbox.caption'));
      }

      if (Ember.isBlank(layers)) {
        fields.pushObject(i18n.t('components.layers-dialogs.settings.wms.layers-textbox.caption'));
      }

      if (Ember.isBlank(version)) {
        fields.pushObject(i18n.t('components.layers-dialogs.settings.wms.version-textbox.caption'));
      }

      if (!Ember.isBlank(fields)) {
        message = i18n.t('components.layers-dialogs.edit.get-capabilities-button.error-caption') + fields.join(', ');
      }

      return message;
    }
  ),

  actions: {
    /**
      Handler for error 'ui-message' component 'onShow' action.

      @method actions.onErrorMessageShow
    */
    onErrorMessageShow() {
      this.set('_showErrorMessage', true);
    },

    /**
      Handler for error 'ui-message' component 'onHide' action.

      @method actions.onErrorMessageHide
    */
    onErrorMessageHide() {
      this.set('_showErrorMessage', false);
    },

    /**
      Handler for error 'ui-message' component 'onHide' action.

      @method actions.onGetCapabilitiesClick
    */
    onGetCapabilitiesClick(...args) {
      let getCapabilitiesErrorMessage = this.get('getCapabilitiesErrorMessage');

      if (getCapabilitiesErrorMessage) {
        this.send('onErrorMessageShow', ...args);
        return;
      }

      let settings = this.get('settings');
      let getCapabilitiesPromise = this.getCapabilities(settings);

      this.set('getCapabilitiesPromise', getCapabilitiesPromise);
      this.send('onErrorMessageHide', ...args);
    }
  },

  /**
    Observes changes in settings.url property and checks whether it is correct url.
    If url syntax is correct, requests available info formats from service.

    @method _urlDidChange
    @private
  */
  _urlDidChange: Ember.observer('settings.url', function () {
    let url = this.get('settings.url');
    let regEx = new RegExp(urlRegex);

    if (!url || Ember.isBlank(url.toString().match(regEx))) {
      return;
    }

    let _this = this;
    new Ember.RSVP.Promise((resolve, reject) => {
      L.TileLayer.WMS.Format.getAvailable({
        url: url,
        done(capableFormats, xhr) {
          if (!Ember.isArray(capableFormats) || capableFormats.length === 0) {
            reject(`Service ${url} had not returned any available formats`);
          }

          // Change current info format to available one.
          let currentInfoFormat = _this.get('settings.info_format');
          if (capableFormats.indexOf(currentInfoFormat) < 0) {
            _this.set('settings.info_format', capableFormats[0]);
          }

          _this.set('_availableInfoFormats', Ember.A(capableFormats));
          resolve();
        },
        fail(errorThrown, xhr) {
          reject(errorThrown);
        }
      });
    });
  }),

  /**
    Binds current layer's capabilities from service.

    @param {Object} settings
  */
  getCapabilities(settings) {
    let _this = this;

    return new Ember.RSVP.Promise((resolve, reject) => {
      L.tileLayer.wms(settings.url, {
        layers: settings.layers,
        version: settings.version
      }).getBoundingBox({
        done(boundingBox, xhr) {
          if (Ember.isBlank(boundingBox)) {
            reject(`Service ${settings.url} had not returned any bounding box`);
          }

          _this.set('bounds.0.0', boundingBox.getSouth());
          _this.set('bounds.0.1', boundingBox.getWest());
          _this.set('bounds.1.0', boundingBox.getNorth());
          _this.set('bounds.1.1', boundingBox.getEast());

          resolve();
        },
        fail(errorThrown, xhr) {
          _this.set('getCapabilitiesPromiseError', errorThrown);
          _this.send('onErrorMessageShow');
          reject(errorThrown);
        }
      });
    });
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    // Initialize available info formats.
    let availableFormats = L.TileLayer.WMS.Format.getExisting();
    this.set('_availableInfoFormats', Ember.A(availableFormats));
  }
});
