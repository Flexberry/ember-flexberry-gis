import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import I18nService from 'ember-i18n/services/i18n';
import I18nRuLocale from 'ember-flexberry-gis/locales/ru/translations';
import I18nEnLocale from 'ember-flexberry-gis/locales/en/translations';

module('Integration | Component | layers dialogs/attributes/edit', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('locale:ru/translations', I18nRuLocale);
    this.owner.register('locale:en/translations', I18nEnLocale);
    this.owner.register('service:i18n', I18nService);

    this.i18n = this.owner.lookup('service:i18n');
    Component.reopen({
      i18n: service('i18n'),
    });

    // Set 'ru' as initial locale.
    this.set('i18n.locale', 'ru');
  });

  test('it renders', async function (assert) {
    assert.expect(1);

    this.set('fieldNames', {
      field: 'field',
    });
    this.set('fieldTypes', {
      field: 'string',
    });
    this.set('fieldParsers', {
      field(text) { return text; },
    });
    this.set('fieldValidators', {
      field(value) { return true; },
    });
    this.set('data', {
      field: 'test field',
    });

    this.set('visible', true);

    await render(hbs`
      {{layers-dialogs/attributes/edit
        visible=visible
        fieldNames=fieldNames
        fieldTypes=fieldTypes
        fieldParsers=fieldParsers
        fieldValidators=fieldValidators
        data=data
      }}`);

    // Component is rendered outside of the testing container.
    const $dialog = this.$()
      .closest('#ember-testing-container')
      .siblings('.ui.modals')
      .find('.flexberry-edit-layer-attributes-dialog');

    assert.ok($dialog.find('.flexberry-dialog-content .field input').length === 1, 'It renders one input');
  });
});
