import Ember from 'ember';

export default Ember.Helper.extend({
  compute([type, name]) {
    return Ember.getOwner(this).isKnownNameForType(type, name);
  }
});
