import Ember from 'ember';
import moment from 'moment';

export default Ember.Mixin.create({
  getFeatureDisplayProperty(feature, featuresPropertiesSettings, dateFormat, dateTimeFormat, layerModel) {
    let displayPropertyIsCallback = Ember.get(featuresPropertiesSettings, 'displayPropertyIsCallback') === true;
    let displayProperty = Ember.get(featuresPropertiesSettings, 'displayProperty');

    let featureProperties = Ember.get(feature, 'properties') || {};
    let fieldTypes = layerModel.get('_leafletObject.readFormat.featureType.fieldTypes');

    for (var prop in featureProperties) {
      let type = fieldTypes ? fieldTypes[prop] : null;
      let value = featureProperties[prop];
      if ((type && type === 'date') && !Ember.isNone(value) && !Ember.isEmpty(value) &&
        (!Ember.isEmpty(dateFormat) || !Ember.isEmpty(dateTimeFormat))) {
        if (!Ember.isEmpty(dateTimeFormat)) {
          let dateValue = moment(value);
          featureProperties[prop] = (dateValue.utc().format('HH:mm:ss') === '00:00:00') ?
            moment(value).format(dateFormat) :
            moment(value).format(dateTimeFormat);
        } else {
          featureProperties[prop] = moment(value).format(dateFormat);
        }
      }

      if (type && type === 'boolean') {
        let i18n = this.get('i18n');
        let yes = i18n.t('components.layer-result-list.boolean.yes');
        let no = i18n.t('components.layer-result-list.boolean.no');
        if (typeof (value) === 'boolean') {
          featureProperties[prop] = (value) ? yes : no;
        } else {
          featureProperties[prop] = (value === 'true') ? yes : no;
        }
      }
    }

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
