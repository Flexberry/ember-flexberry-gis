import Ember from 'ember';

export function mathSub([a, b]) {
  return a - b;
}

export default Ember.Helper.helper(mathSub);
