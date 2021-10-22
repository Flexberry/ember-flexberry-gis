import $ from 'jquery';
import EmberFlexberryTranslations from 'ember-flexberry/locales/en/translations';
import EmberFlexberryGisTranslations from 'ember-flexberry-gis/locales/en/translations';

import FormsTranslations from './forms';

const translations = {};
$.extend(true, translations, EmberFlexberryTranslations, EmberFlexberryGisTranslations);

$.extend(true, translations, {
  'application-name': 'Test stand for ember-flexberry-gis',
  forms: FormsTranslations,
});

export default translations;
