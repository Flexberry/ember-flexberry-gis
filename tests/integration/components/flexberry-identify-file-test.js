import { moduleForComponent, test } from 'ember-qunit';

import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import I18nService from 'ember-i18n/services/i18n';
import I18nRuLocale from 'ember-flexberry-gis/locales/ru/translations';
import I18nEnLocale from 'ember-flexberry-gis/locales/en/translations';

moduleForComponent('flexberry-identify-file', 'Integration | Component | flexberry identify file', {
  beforeEach: function (assert) {
    this.register('locale:ru/translations', I18nRuLocale);
    this.register('locale:en/translations', I18nEnLocale);
    this.register('service:i18n', I18nService);

    this.inject.service('i18n', { as: 'i18n' });
    Ember.Component.reopen({
      i18n: Ember.inject.service('i18n')
    });

  },
  integration: true,
});

test('it renders', function(assert) {
  this.set('coordinate', 'auto');
  this.set('systemCoordinates', { 'auto': 'auto' });
  this.render(hbs`
    {{flexberry-identify-file geomOnly=true coordinate=coordinate systemCoordinates=systemCoordinates}}
  `);
  let hiddenInput = this.$().find('input.d-none');
  let fileInput = this.$().find('input.file-input');
  let selectedCrs = this.$('.flexberry-dropdown .text').text();
  assert.equal(hiddenInput.length, 1);
  assert.equal(fileInput.length, 1);
  assert.equal(selectedCrs, 'auto');

  this.render(hbs`
    {{flexberry-identify-file geomOnly=false coordinate=coordinate systemCoordinates=systemCoordinates}}
  `);
  let buttons = this.$('.d-flex.justify-content-center.p-10 .flexberry-button');
  assert.equal(buttons.length, 3);
});
