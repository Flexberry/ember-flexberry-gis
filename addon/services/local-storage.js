/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Local storage service.
  Interacts with local storage to save and load data using key-value pairs.

  @class LocalStorageService
  @extends Ember.Service
*/
export default Ember.Service.extend({
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
    let collection = Ember.A();

    if (this.get('available')) {
      try {
        let inStore = Ember.A(JSON.parse(localStorage.getItem(`${className}_${key}`)));

        if (!Ember.isBlank(inStore)) {
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
    Returns collection of object from local storage with provided className and key.

    @method getFromStorage
    @param {String} className Name of class of stored objects.
    @param {String} key Key of collection.
    @param Object[] value New value for a collection.
  */
  setToStorage(className, key, value) {
    if (this.get('available')) {
      localStorage.setItem(`${className}_${key}`, JSON.stringify(value));
    }
  }
});
