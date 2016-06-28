import Ember from 'ember';

export default Ember.Mixin.create({
  dynamicProperties: null,

  initDynamicProperties: function () {
    let properties = this.get('dynamicProperties');
    if (!Ember.isNone(properties) && typeof (properties) === 'object') {
      for (var propertyName in properties) {
        if (properties.hasOwnProperty(propertyName)) {
          this.set(propertyName, properties[propertyName]);
        }
      }
    }
  }
});
