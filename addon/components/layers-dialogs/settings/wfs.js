/**
  @module ember-flexberry-gis
*/

import { Promise } from 'rsvp';

import { A } from '@ember/array';
import { isBlank } from '@ember/utils';
import { computed } from '@ember/object';
import layout from '../../../templates/components/layers-dialogs/settings/wfs';
import WmsSettingsComponent from './wms';

/* eslint-disable no-useless-escape */

// Regular expression used to derive whether settings' url is correct.
const urlRegex = '(https?|ftp)://(-\.)?([^\s/?\.#-]+\.?)+(/[^\s]*)?';

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

  setCapabilitiesPromiseError() {
    this.set('getCapabilitiesPromiseError', null);
  },

  /**
    Get capabilities button error message.

    @property getCapabilitiesErrorMessage
    @type String
    @readonly
  */
  getCapabilitiesErrorMessage: computed(
    'getCapabilitiesPromiseError',
    'i18n',
    'settings.{url,typeNS,typeName,version}',
    function () {
      const getCapabilitiesPromiseError = this.get('getCapabilitiesPromiseError');

      if (!isBlank(getCapabilitiesPromiseError)) {
        this.setCapabilitiesPromiseError();
        return getCapabilitiesPromiseError;
      }

      let message;
      const fields = A();

      const i18n = this.get('i18n');

      const url = this.get('settings.url');
      const typeNS = this.get('settings.typeNS');
      const typeName = this.get('settings.typeName');
      const version = this.get('settings.version');

      if (isBlank(url) || isBlank(url.toString().match(new RegExp(urlRegex)))) {
        fields.pushObject(i18n.t('components.layers-dialogs.settings.wfs.url-textbox.caption'));
      }

      if (isBlank(typeName)) {
        fields.pushObject(i18n.t('components.layers-dialogs.settings.wfs.type-name-textbox.caption'));
      }

      if (isBlank(typeNS)) {
        fields.pushObject(i18n.t('components.layers-dialogs.settings.wfs.type-ns-textbox.caption'));
      }

      if (isBlank(version)) {
        fields.pushObject(i18n.t('components.layers-dialogs.settings.wfs.version-textbox.caption'));
      }

      if (!isBlank(fields)) {
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

  /**
    Binds current layer's capabilities from service.

    @param {Object} settings
  */
  getCapabilities(settings) {
    const _this = this;

    return new Promise((resolve, reject) => {
      L.wfs(settings, null).getBoundingBox(
        (boundingBox) => {
          if (isBlank(boundingBox)) {
            reject(new Error(`Service ${settings.url} had not returned any bounding box`));
          }

          _this.set('bounds.0.0', boundingBox.getSouth());
          _this.set('bounds.0.1', boundingBox.getWest());
          _this.set('bounds.1.0', boundingBox.getNorth());
          _this.set('bounds.1.1', boundingBox.getEast());

          resolve();
        },
        (errorThrown) => {
          _this.set('getCapabilitiesPromiseError', errorThrown);
          _this.send('onErrorMessageShow');
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

    this.typeGeometry = this.typeGeometry || ['polygon', 'polyline', 'marker'];

    // Initialize available formats.
    const availableFormats = A(Object.keys(L.Format) || []).filter((format) => {
      format = format.toLowerCase();
      return format !== 'base' && format !== 'scheme';
    });
    this.set('_availableInfoFormats', A(availableFormats));
  },
});
