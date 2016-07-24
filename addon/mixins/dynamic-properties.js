/**
  @module ember-flexberry-gis
 */


import Ember from 'ember';
/**
  Mixin for pass dynamicProperties to Ember.object.
  @class DynamicPropertiesMixin
  @uses <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
 */
export default Ember.Mixin.create({
  /**
    Object with properties thats should pass to this.
    @property dynamicProperties
    @type Object
    @default null
   */
  dynamicProperties: null,

  /**
    Array of passed dynamic properties names.
    @property dynamicPropertiesNames
    @type Array
    @default null
   */
  dynamicPropertiesNames: null,

  /**
    Observers dynamicProperties property, remove skipped properties and add or change presented.
   */
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
