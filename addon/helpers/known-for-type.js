import Ember from 'ember';

export default Ember.Helper.extend({
  compute([layer, type]) {
    return Ember.getOwner(this).knownForType(layer, type);
  }
});
