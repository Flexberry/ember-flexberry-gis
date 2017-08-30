import Ember from 'ember';

export function getField(params/*, hash*/) {
  let [obj, fieldName] = params;
  return obj.get(fieldName);
}

export default Ember.Helper.helper(getField);
