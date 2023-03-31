import Ember from 'ember';
import moment from 'moment';

export default Ember.Helper.extend({
  compute(args) {
    let value = args[0];

    if (Ember.isNone(value)) {
      return value;
    }

    let prop = args[1];
    let settings = args[2];

    let fieldTypes = settings.layerModel.get('_leafletObject.readFormat.featureType.fieldTypes');
    let type = fieldTypes ? fieldTypes[prop] : null;

    switch (type) {
      case 'date':
        let dateFormat = settings.dateFormat;
        let dateTimeFormat = settings.dateTimeFormat;

        if (!Ember.isEmpty(dateFormat) || !Ember.isEmpty(dateTimeFormat)) {
          let dateValue = moment(value);

          if (dateValue.isValid()) {
            if (!Ember.isEmpty(dateTimeFormat)) {
              return (dateValue.format('HH:mm:ss') === '00:00:00') ? dateValue.format(dateFormat) : dateValue.format(dateTimeFormat);
            } else {
              return dateValue.format(dateFormat);
            }
          }
        }

        break;
      case 'boolean':
        let i18n = this.get('i18n');
        let yes = i18n.t('components.layer-result-list.boolean.yes');
        let no = i18n.t('components.layer-result-list.boolean.no');

        return (typeof (value) === 'boolean') ? (value) ? yes : no : (value === 'true') ? yes : no;
      default:
        return value;
    }

    return value;
  }
});
