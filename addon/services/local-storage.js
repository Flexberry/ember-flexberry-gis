/**
  @module ember-flexberry-gis
*/

import { isBlank } from '@ember/utils';

import { A } from '@ember/array';
import Service from '@ember/service';

/**
  Local storage service.
  Interacts with local storage to save and load data using key-value pairs.

  @class LocalStorageService
  @extends Ember.Service
*/
export default Service.extend({
  /**
    Flag: indicates whether service is available.

    @property available
    @type Boolean
    @default false
  */
  available: false,

  /**
    Checks whether window.localStorage is available in current browser.

    @method getAvailable
    @returns Boolean available
  */
  getAvailable() {
    try {
      return window.localStorage !== null;
    } catch (e) {
      return false;
    }
  },

  /**
    Initializes storage.
  */
  init() {
    this._super(...arguments);

    this.set('available', this.getAvailable());
  },

  /**
    Returns collection of object from local storage with provided className and key.

    @method getFromStorage
    @param {String} className Name of class of stored objects.
    @param {String} key Key of collection.
    @returns Object[] collection
  */
  getFromStorage(className, key) {
    let collection = A();

    if (this.get('available')) {
      try {
        let inStore = A(JSON.parse(localStorage.getItem(`${className}_${key}`)));

        if (!isBlank(inStore)) {
          inStore.forEach((element) => {
            collection.pushObject(element);
          });
        }
      } catch (e) {
        return collection;
      }
    }

    return collection;
  },

  /**
    Returns value from local storage with provided className and Key.

    @method getFromStorageSingle
    @param {String} className Name of class of stored objects.
    @param {String} key Key of value in class.
    @param {Object} defaultValue default value thats return for something error.
    @returns {Object}
  */
  getFromStorageSingle(className, key, defaultValue) {
    if (this.get('available')) {
      try {
        return JSON.parse(localStorage.getItem(`${className}_${key}`));
      } catch (e) {
        return defaultValue;
      }
    }

    return defaultValue;
  },

  /**
    Set new value to local storage with provided className and key.

    @method setToStorage
    @param {String} className Name of class of stored objects.
    @param {String} key Key of value.
    @param Object[] value New value for specified className and Key.
  */
  setToStorage(className, key, value) {
    if (this.get('available')) {
      localStorage.setItem(`${className}_${key}`, JSON.stringify(value));
    }
  }
});
