import Ember from 'ember';
import EmberFlexberryTranslations from 'ember-flexberry/locales/ru/translations';
import EmberFlexberryGisTranslations from 'ember-flexberry-gis/locales/ru/translations';

import FormsTranslations from './forms';

const translations = {};
Ember.$.extend(true, translations, EmberFlexberryTranslations, EmberFlexberryGisTranslations);

Ember.$.extend(true, translations, {
  'application-name': 'Тестовый стэнд ember-flexberry-gis',
  'forms': FormsTranslations
});

export default translations;
