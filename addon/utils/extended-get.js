/**
  @module ember-flexberry-gis
*/

import { get } from '@ember/object';

import { isArray } from '@ember/array';

/**
  Used for getting objects by path containing Ember.RecordArray

  @for Utils.Layers
  @method getRecord
  @param {Object} source this
  @param {String} keyName Property path
  @return {Object} Retriveved object from path

  Usage:
  controllers/my-form.js
  ```javascript
    import { getRecord } from 'ember-flexberry-gis/utils/extended-get'l
    let layer = getRecord(this, 'map.mapLayer.0.layers.1')

  ```
*/
const getRecord = function (source, keyName) {
  // array of keys
  const keys = keyName.split('.');

  // first object from path
  let result = source.get(keys[0] || keyName);

  if (keys.length > 1) {
    for (let i = 1, len = keys.length; i < len; i++) {
      // needed for recognition if key is index
      const keyValue = parseInt(keys[i]);

      // if previous object is array and key is index
      if (isArray(result) && !isNaN(keyValue)) {
        result = result.objectAt(keys[i]);
      } else {
        result = get(result, keys[i]);
      }
    }
  }

  return result;
};

export {
  getRecord
};
