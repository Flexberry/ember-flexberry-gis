import Ember from 'ember';

export function instanceOf([a, b]/*, hash*/) {
  return (a instanceof b);
}

export default Ember.Helper.helper(instanceOf);
