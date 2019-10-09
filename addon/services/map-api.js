/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Map api service.
  Manages map API.

  @class MapApiService
  @extends Ember.Service
*/
export default Ember.Service.extend({
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
    const appConfig = Ember.getOwner(this)._lookupFactory('config:environment');
    if (!Ember.isNone(appConfig) && !Ember.isNone(appConfig.APP.mapApiService)) {
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
    if (this.get('isApiAvailable') && !Ember.isBlank(path)) {
      if (Ember.isNone(window.mapApi)) {
        window.mapApi = {};
      }

      const pathArray = path.split('.');
      let currentPath = 'mapApi';
      pathArray.forEach((pathPart, index, array) => {
        currentPath += `.${pathPart}`;
        if (index === array.length - 1) {
          Ember.set(window, currentPath, value);
        } else {
          if (Ember.isNone(Ember.get(window, currentPath))) {
            Ember.set(window, currentPath, {});
          }
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
    if (this.get('isApiAvailable') && !Ember.isBlank(path)) {
      return Ember.get(window, `mapApi.${path}`);
    }
  }
});
