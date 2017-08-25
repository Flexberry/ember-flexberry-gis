/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../../templates/components/layers-dialogs/settings/wfs';
import WmsSettingsComponent from './wms';

// Regular expression used to derive whether settings' url is correct.
let urlRegex = '(https?|ftp)://(-\.)?([^\s/?\.#-]+\.?)+(/[^\s]*)?';

/**
  Settings-part of WFS layer modal dialog.

  @class WfsLayerSettingsComponent
  @extends WmsSettingsComponent
*/
export default WmsSettingsComponent.extend({
  /**
    Array containing available formats.

    @property _availableInfoFormats
    @type String[]
    @private
  */
  _availableInfoFormats: null,

  /**
    Reference to component's template.
  */
  layout,

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
    'settings.typeNS',
    'settings.typeName',
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
      let typeNS = this.get('settings.typeNS');
      let typeName = this.get('settings.typeName');
      let version = this.get('settings.version');

      if (Ember.isBlank(url) || Ember.isBlank(url.toString().match(new RegExp(urlRegex)))) {
        fields.pushObject(i18n.t('components.layers-dialogs.settings.wms.url-textbox.caption'));
      }

      if (Ember.isBlank(typeName)) {
        fields.pushObject(i18n.t('components.layers-dialogs.settings.wfs.type-name-textbox.caption'));
      }

      if (Ember.isBlank(typeNS)) {
        fields.pushObject(i18n.t('components.layers-dialogs.settings.wfs.type-ns-textbox.caption'));
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

  /**
    OBSOLETE
    Observes changes in settings.url property and checks whether it is correct url.
    If url syntax is correct, requests available info formats from service.

    @method _urlDidChange
    @private
  */
  _urlDidChange() {},

  getCapabilities(settings) {
    let _this = this;

    return new Ember.RSVP.Promise((resolve, reject) => {
      L.wfs(settings, null).getBoundingBox(
        (boundingBox, xhr) => {
          if (Ember.isBlank(boundingBox)) {
            reject(`Service ${settings.url} had not returned any bounding box`);
          }

          _this.set('settings.wgs84bbox.0.1', boundingBox.getSouth());
          _this.set('settings.wgs84bbox.0.0', boundingBox.getWest());
          _this.set('settings.wgs84bbox.1.1', boundingBox.getNorth());
          _this.set('settings.wgs84bbox.1.0', boundingBox.getEast());

          resolve();
        },
        (errorThrown, xhr) => {
          _this.set('getCapabilitiesPromiseError', errorThrown);
          _this.send('onErrorMessageShow', ...args);
          reject(errorThrown);
        }
      );
    });
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    // Initialize available formats.
    let availableFormats = Ember.A(Object.keys(L.Format) || []).filter((format) => {
      format = format.toLowerCase();
      return format !== 'base' && format !== 'scheme';
    });
    this.set('_availableInfoFormats', Ember.A(availableFormats));
  }
});
