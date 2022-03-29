/**
  @module ember-flexberry-gis
*/

import { set, get } from '@ember/object';

import { isNone, isBlank } from '@ember/utils';
import { getOwner } from '@ember/application';
import Service from '@ember/service';

/**
  Map api service.
  Manages map API.

  @class MapApiService
  @extends Ember.Service
*/
export default Service.extend({
  /**
    Flag: indicates when map API available.
    This flag is readed from config setting `APP.mapApiService`.

    @property isUserSettingsServiceEnabled
    @type Boolean
    @default false
  */
  isApiAvailable: false,

  init() {
    this._super(...arguments);
    const appConfig = getOwner(this).factoryFor('config:environment').class || getOwner(this).factoryFor('config:environment');
    if (!isNone(appConfig) && !isNone(appConfig.APP.mapApiService)) {
      this.set('isApiAvailable', appConfig.APP.mapApiService);
    }
  },

  /**
    Adds specified value to map API.

    @method addToApi
    @param {String} path Path in the map API.
    @param {Object} value Specified value.
  */
  addToApi(path, value) {
    if (this.get('isApiAvailable') && !isBlank(path)) {
      if (isNone(window.mapApi)) {
        window.mapApi = {};
      }

      const pathArray = path.split('.');
      let currentPath = 'mapApi';
      pathArray.forEach((pathPart, index, array) => {
        currentPath += `.${pathPart}`;
        if (index === array.length - 1) {
          set(window, currentPath, value);
        } else if (isNone(get(window, currentPath))) {
          set(window, currentPath, {});
        }
      });
    }
  },

  /**
    Gets specified value from map API.

    @method getFromApi
    @param {String} path Path in the map API.
  */
  getFromApi(path) {
    if (this.get('isApiAvailable') && !isBlank(path)) {
      return get(window, `mapApi.${path}`);
    }
  },
});
