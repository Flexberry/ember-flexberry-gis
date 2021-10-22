import $ from 'jquery';
import EmberFlexberryTranslations from 'ember-flexberry/locales/ru/translations';
import EmberFlexberryGisTranslations from 'ember-flexberry-gis/locales/ru/translations';

import FormsTranslations from './forms';

const translations = {};
$.extend(true, translations, EmberFlexberryTranslations, EmberFlexberryGisTranslations);

$.extend(true, translations, {
  'application-name': 'Тестовый стэнд ember-flexberry-gis',
  'forms': FormsTranslations
});

export default translations;
