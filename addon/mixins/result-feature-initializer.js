import Ember from 'ember';

export default Ember.Mixin.create({
  getFeatureDisplayProperty(feature, featuresPropertiesSettings) {
    let displayPropertyIsCallback = Ember.get(featuresPropertiesSettings, 'displayPropertyIsCallback') === true;
    let displayProperty = Ember.get(featuresPropertiesSettings, 'displayProperty');

    let featureProperties = Ember.get(feature, 'properties') || {};

    if (!Ember.isArray(displayProperty) && !displayPropertyIsCallback) {
      return '';
    }

    if (Ember.typeOf(displayProperty) !== 'string' && displayPropertyIsCallback) {
      return '';
    }

    if (!displayPropertyIsCallback) {

      let displayValue = Ember.none;
      displayProperty.forEach((prop) => {
        if (featureProperties.hasOwnProperty(prop)) {
          let value = featureProperties[prop];
          if (Ember.isNone(displayValue) && !Ember.isNone(value) && !Ember.isEmpty(value) && value.toString().toLowerCase() !== 'null') {
            displayValue = value;
          }
        }
      });

      return displayValue || '';
    }

    let calculateDisplayProperty = eval(`(${displayProperty})`);
    Ember.assert(
      'Property \'settings.displaySettings.featuresPropertiesSettings.displayProperty\' ' +
      'is not a valid javascript function',
      Ember.typeOf(calculateDisplayProperty) === 'function');

    return calculateDisplayProperty(feature);
  }
});
