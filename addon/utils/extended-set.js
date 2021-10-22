/**
  @module ember-flexberry-gis
*/

import { isBlank } from '@ember/utils';

import { set, get } from '@ember/object';
import { assign } from '@ember/polyfills';
import { isArray } from '@ember/array';

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
const setRecord = function (source, keyName, value) {
  // array of keys
  const keys = keyName.split('.');

  if (keys.length > 1) {
    // first object of path
    let result = source.get(keys[0]);

    for (let i = 1, len = keys.length; i < len; i++) {
      // needed for recognition if key is index
      const keyValue = parseInt(keys[i]);

      if (i === (len - 1)) {
        // if previous object is array and key is index
        if (isArray(result) && !isNaN(keyValue)) {
          return assign(result.objectAt(keys[i]), value);
        }

        return set(result, keys[i], value);
      }

      if (isArray(result) && !isNaN(keyValue)) {
        result = result.objectAt(keys[i]);
      } else {
        result = result.get(keys[i]);
      }
    }
  }

  // if key is lonely - directly set value for this property
  return set(source, keys[0] || keyName, value);
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
const setAndAssign = function (source, keyName, value) {
  // Array of keys.
  const keys = keyName.split('.');
  let keyPath = keys[0];

  // Create empty object if object in path could not be found or was destroyed.
  for (let i = 1; i < keys.length; i++) {
    if (isBlank(get(source, keyPath))) {
      set(source, keyPath, {});
    }

    keyPath += `.${keys[i]}`;
  }

  // Directly set value for this property.
  set(source, keyName, value);
};

export {
  setRecord,
  setAndAssign
};
