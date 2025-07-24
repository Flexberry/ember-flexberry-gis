import Ember from 'ember';
import moment from 'moment';

export default Ember.Helper.extend({
  dateFormat: 'DD.MM.YYYY',

  compute(args) {
    let value = args[0];

    if (Ember.isNone(value)) {
      return value;
    }

    let type = args[1];
    let settings = args[2] || {};

    switch (type) {
      case 'date':
      case 'dateTime':
        let dateFormat = settings.dateFormat || this.get('dateFormat');
        let dateTimeFormat = settings.dateTimeFormat;

        if (!Ember.isEmpty(dateFormat) || !Ember.isEmpty(dateTimeFormat)) {
          let dateValue = moment.utc(value).local();

          if (dateValue.isValid()) {
            if (type === 'dateTime' && !Ember.isEmpty(dateTimeFormat)) {
              return dateValue.format(dateTimeFormat);
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
      case 'number':
        return value.toFixed(2).replace(/./g, function (c, i, a) {
          return i && c !== '.' && ((a.length - i) % 3 === 0) ? ' ' + c : c;
        });
      default:
        return value;
    }

    return value;
  }
});
