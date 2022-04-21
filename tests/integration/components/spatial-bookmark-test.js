import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import storageService from 'ember-flexberry-gis/services/local-storage';

import I18nService from 'ember-i18n/services/i18n';
import I18nRuLocale from 'ember-flexberry-gis/locales/ru/translations';
import I18nEnLocale from 'ember-flexberry-gis/locales/en/translations';

module('Integration | Component | spatial bookmark', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('locale:ru/translations', I18nRuLocale);
    this.owner.register('locale:en/translations', I18nEnLocale);
    this.owner.register('service:i18n', I18nService);

    this.i18n = this.owner.lookup('service:i18n');
    Component.reopen({
      i18n: service('i18n'),
    });

    this.set('i18n.locale', 'ru');

    this.owner.register('service:local-storage', storageService);

    this['local-storage-service'] = this.owner.lookup('service:local-storage');
    Component.reopen({
      'local-storage-service': service('local-storage'),
    });
  });

  hooks.afterEach(function () {
    Component.reopen({
      'local-storage-service': undefined,
    });
  });

  test('it renders', async function (assert) {
    await render(hbs`{{spatial-bookmark}}`);
    assert.equal(this.element.textContent.trim(), 'Добавить в закладки');
  });
});
