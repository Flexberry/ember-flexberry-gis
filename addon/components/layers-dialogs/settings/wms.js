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
    Initializes component.
  */
  init() {
    this._super(...arguments);

    // Initialize available info formats.
    let availableFormats = L.TileLayer.WMS.Format.getExisting();
    this.set('_availableInfoFormats', Ember.A(availableFormats));
  }
});
