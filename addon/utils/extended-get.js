/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

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
let getRecord = function (source, keyName) {
  let keys = keyName.split('.');
  let result = source.get(keys[0] || keyName);

  if (keys.length > 1) {
    for (let i = 1, len = keys.length; i < len; i++) {
      if (Ember.isArray(result)) {
        result = result.objectAt(keys[i]);
      } else {
        result = result.get(keys[i]);
      }
    }
  }

  return result;
};

export {
  getRecord
};
