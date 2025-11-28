import Ember from 'ember';

export function mathAdd([a, b]) {
  return a + b;
}

export default Ember.Helper.helper(mathAdd);
