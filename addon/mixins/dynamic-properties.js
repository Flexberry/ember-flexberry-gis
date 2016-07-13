import Ember from 'ember';

export default Ember.Mixin.create({
  dynamicProperties: null,

  dynamicPropertiesNames: null,

  initDynamicProperties: Ember.observer('dynamicProperties', function () {
    let properties = this.get('dynamicProperties') || {};
    let names = this.get('dynamicPropertiesNames') || [];

    // remove skipped properties from previous init
    names
      .filter(name => !properties.hasOwnProperty(name))
      .forEach(name => {
        this.set(name, undefined);
        delete this[name];
      });

    if (!Ember.isNone(properties) && typeof (properties) === 'object') {
      let newNames = [];
      for (var propertyName in properties) {
        if (properties.hasOwnProperty(propertyName)) {
          this.set(propertyName, properties[propertyName]);
          newNames.push(propertyName);
        }
      }

      this.set('dynamicPropertiesNames', newNames);
    }
  }),

  init() {
    this._super(...arguments);
    this.initDynamicProperties();
  }
});
