import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import storageService from 'ember-flexberry-gis/services/local-storage';

import I18nService from 'ember-i18n/services/i18n';
import I18nRuLocale from 'ember-flexberry-gis/locales/ru/translations';
import I18nEnLocale from 'ember-flexberry-gis/locales/en/translations';

moduleForComponent('spatial-bookmark', 'Integration | Component | spatial bookmark', {
  beforeEach: function (assert) {
    this.register('locale:ru/translations', I18nRuLocale);
    this.register('locale:en/translations', I18nEnLocale);
    this.register('service:i18n', I18nService);

    this.inject.service('i18n', { as: 'i18n' });
    Ember.Component.reopen({
      i18n: Ember.inject.service('i18n')
    });

    this.set('i18n.locale', 'ru');

    this.register('service:local-storage', storageService);

    this.inject.service('local-storage', { as: 'local-storage-service' });
    Ember.Component.reopen({
      'local-storage-service': Ember.inject.service('local-storage')
    });
  },

  afterEach: function() {
    Ember.Component.reopen({
      'local-storage-service': undefined
    });
  },

  integration: true
});

test('it renders', function (assert) {
  this.render(hbs`{{spatial-bookmark}}`);
  assert.equal(this.$().text().trim(), 'Добавить в закладки');
});
