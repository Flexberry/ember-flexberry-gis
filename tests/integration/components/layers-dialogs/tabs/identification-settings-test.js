import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import I18nService from 'ember-i18n/services/i18n';
import I18nRuLocale from 'ember-flexberry-gis/locales/ru/translations';
import I18nEnLocale from 'ember-flexberry-gis/locales/en/translations';

module('Integration | Component | identification settings', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function (assert) {
    this.owner.register('locale:ru/translations', I18nRuLocale);
    this.owner.register('locale:en/translations', I18nEnLocale);
    this.owner.register('service:i18n', I18nService);

    this.i18n = this.owner.lookup('service:i18n');
    Component.reopen({
      i18n: service('i18n')
    });

    this.set('i18n.locale', 'ru');

    let obj = {
      settings: {
        displaySettings: {
          canBeIdentified: true
        }
      }
    };

    this.set('_layer', obj);
  });

  test('it renders', async function(assert) {

    await render(hbs`{{layers-dialogs/tabs/identification-settings value=_layer.settings.displaySettings}}`);

    assert.equal(this.element.textContent.trim(), 'Может быть идентифицирован');
  });
});
