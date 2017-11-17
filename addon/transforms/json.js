import Transform from 'ember-data/transform';

/**
  Transformation for model's attributes defined as JSON.

  @class JsonTransform
  @extends <a href="http://emberjs.com/api/data/classes/DS.Transform.html">DS.Transform</a>
  @example
  ```
  import DS from 'ember-data';
  export default DS.Model.extend({
    externaJson: DS.attr('json')
  });
  ```
*/
export default Transform.extend({
  /**
    Deserializes serialized attribute value.
  */
  deserialize(serialized) {
    return serialized;
  },

  /**
    Serializes deserialized attribute value.
   */
  serialize(deserialized) {
    return deserialized;
  }
});
