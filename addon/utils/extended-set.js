/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Used for setting objects properties by path containing Ember.RecordArray

  @for Utils.Layers
  @method setRecord
  @param {Object} source this
  @param {String} keyName Property path
  @param {Object} value New value for Property
  @return {Object} Assigned value

  Usage:
  controllers/my-form.js
  ```javascript
    import { setRecord } from 'ember-flexberry-gis/utils/setRecord'l
    setRecord(this, 'map.mapLayer.1.visibility', false)

  ```
*/
let setRecord = function (source, keyName, value) {
  // array of keys
  let keys = keyName.split('.');

  if (keys.length > 1) {
    // first object of path
    let result = source.get(keys[0]);

    for (let i = 1, len = keys.length; i < len; i++) {
      // needed for recognition if key is index
      let keyValue = parseInt(keys[i]);

      if (i === (len - 1)) {
        // if previous object is array and key is index
        if (Ember.isArray(result) && !isNaN(keyValue)) {
          return Ember.assign(result.objectAt(keys[i]), value);
        } else {
          return Ember.set(result, keys[i], value);
        }
      } else if (Ember.isArray(result) && !isNaN(keyValue)) {
        result = result.objectAt(keys[i]);
      } else {
        result = result.get(keys[i]);
      }
    }
  }

  // if key is lonely - directly set value for this property
  return Ember.set(source, keys[0] || keyName, value);
};

/**
  Used for setting properties if object in path could not be found or was destroyed.

  @for Utils.Layers
  @method setAndAssign
  @param {Object} source this
  @param {String} keyName Property path
  @param {Object} value New value for Property

  Usage:
  controllers/my-form.js
  ```javascript
    import { setAndAssign } from 'ember-flexberry-gis/utils/assignable-get'l
    setAndAssign(this, 'map.mapLayer.1.visibility', false)

  ```
*/
let setAndAssign = function (source, keyName, value) {
  // Array of keys.
  let keys = keyName.split('.');
  let keyPath = keys[0];

  // Create empty object if object in path could not be found or was destroyed.
  for (let i = 1; i < keys.length; i++) {
    if (Ember.isBlank(Ember.get(source, keyPath))) {
      Ember.set(source, keyPath, {});
    }

    keyPath += '.' + keys[i];
  }

  // Directly set value for this property.
  Ember.set(source, keyName, value);
};

export {
  setRecord,
  setAndAssign
};
