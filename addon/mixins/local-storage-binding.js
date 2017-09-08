/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import {
  setAndAssign
} from '../utils/extended-set';

/**
  Mixin containing logic which binds data from model into local storage.

  @class LocalStorageBindingMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({
  /**
    Injected local-storage-service.

    @property service
    @type <a href="http://emberjs.com/api/classes/Ember.Service.html">Ember.Service</a>
    @default service:local-storage
  */
  service: Ember.inject.service('local-storage'),

  /**
    Class name used which will be used to save data in local storage.

    @property bindingClass
    @type String
    @default null
  */
  bindingClass: null,

  /**
    Object containing bindings as key-value pairs, where value is relative to child node property path.

    @property binding
    @type Object
    @default {}
    @example
    ```javascript
    binding: {
      visibility: 'visibility',
      opacity: 'settingsAsObject.opacity'
    },
    ```
  */
  binding: {},

  /**
    Key property used which will be used to save data in local storage.

    @property keyProperty
    @type String
    @default null
  */
  keyProperty: null,

  /**
    Key value used which will be used to bind data in local storage.

    @property keyValue
    @type String
    @default null
  */
  keyValue: null,

  /**
    Binding key value used which will be used to save data in local storage.

    @property bindingKey
    @type String
    @readonly
  */
  bindingKey: Ember.computed('keyProperty', 'keyValue', function () {
    let value = this.get('keyValue');

    if (Ember.isBlank(value)) {
      let propertyPath = this.get('keyProperty');
      value = this.get(propertyPath);
    }

    return value || '';
  }),

  /**
    It mutates local storage binding value of property with given name to value of method's 'newValue' property.

    @method mutateStorage
    @param {String} bindingName Binding key name.
    @param {String} mutablePropertyPath Path to a property, which value must be mutated.
    @param {Object} newValue New value for a property, which value must be mutated.
  */
  mutateStorage(bindingName, mutablePropertyPath, newValue) {
    // Get relative property path.
    let propertyPath = this.get('binding.' + bindingName);

    // Get direct owner of property.
    let objectPath = Ember.isBlank(propertyPath) ? mutablePropertyPath : mutablePropertyPath.slice(0, mutablePropertyPath.indexOf(propertyPath) - 1);
    let bindingObject = this.get(objectPath);

    if (Ember.isBlank(bindingObject)) {
      return;
    }

    let service = this.get('service');
    let className = this.get('bindingClass');
    let key = this.get('bindingKey');

    // Get object from local storage.
    let objectId = Ember.get(bindingObject, 'id');
    let collection = service.getFromStorage(className, key);
    let storedObject = collection.findBy('id', objectId);

    if (!Ember.isBlank(storedObject)) {
      // Remove object from local storage.
      collection.removeObject(storedObject);
    }

    // Prepare new object to put in storage.
    let mutatedObject = {
      id: objectId
    };

    // Assign new value despite of blank elements on path.
    setAndAssign(mutatedObject, propertyPath, newValue);

    // Merge old object with new one.
    storedObject = Object.assign(storedObject || {}, mutatedObject);

    // Save changes.
    collection.pushObject(storedObject);
    service.setToStorage(className, key, collection);
  }
});
