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
    
  ```
*/
let setRecord = function (source, keyName, value) {
  let keys = keyName.split('.');

  if (keys.length > 1) {
    let result = source.get(keys[0]);
    for (let i = 1, len = keys.length; i < len; i++) {
      if (i === (len - 1)) {
        if (Ember.isArray(result)) {
          return Ember.assign(result.objectAt(keys[i]), value);
        } else {
          return Ember.set(result, keys[i], value);
        }
      } else if (Ember.isArray(result)) {
        result = result.objectAt(keys[i]);
      } else {
        result = result.get(keys[i]);
      }
    }
  }

  return Ember.set(source, keys[0] || keyName, value);
};

export {
  setRecord
};
