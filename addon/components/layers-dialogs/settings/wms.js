/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../../templates/components/layers-dialogs/settings/wms';

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

  _urlDidChange: Ember.observer('settings.url', function () {
    let url = this.get('settings.url');
    let regEx = new RegExp(urlRegex);

    if (!Ember.isBlank(url.toString().match(regEx))) {
      let _this = this;
      new Ember.RSVP.Promise((resolve, reject) => {
        L.TileLayer.WMS.Format.getAvailable({
          url: url,
          done(capableFormats, xhr) {
            _this.set('_availableInfoFormats', Ember.A(capableFormats));
            resolve();
          },
          fail(errorThrown, xhr) {
            reject(errorThrown);
          }
        });
      });
    }
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
