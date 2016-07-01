import Ember from 'ember';
import emberFlexberryTranslations from 'ember-flexberry/locales/ru/translations';
import emberFlexberryGisTranslations from 'ember-flexberry-gis/locales/ru/translations';

const translations = {};
Ember.$.extend(true, translations, emberFlexberryTranslations);
Ember.$.extend(true, translations, emberFlexberryGisTranslations);

Ember.$.extend(true, translations, {

});

export default translations;
