import Transform from 'ember-data/transform';

export default Transform.extend({
  deserialize(serialized) {
    if (serialized) {
      return JSON.parse(serialized);
    }
    return {};
  },

  serialize(deserialized) {
    return JSON.stringify(deserialized);
  }
});
