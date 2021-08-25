import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

import I18nService from 'ember-i18n/services/i18n';
import I18nRuLocale from 'ember-flexberry-gis/locales/ru/translations';
import I18nEnLocale from 'ember-flexberry-gis/locales/en/translations';
import sinon from 'sinon';

moduleForComponent('layers-dialogs/settings/combine', 'Integration | Component | layers dialogs/settings/combine', {
  beforeEach: function () {
    this.register('locale:ru/translations', I18nRuLocale);
    this.register('locale:en/translations', I18nEnLocale);
    this.register('service:i18n', I18nService);

    this.inject.service('i18n', { as: 'i18n' });
    Ember.Component.reopen({
      i18n: Ember.inject.service('i18n')
    });

    this.set('i18n.locale', 'ru');
  },
  integration: true
});

test('it renders without settings and test action addTypeSettings', function(assert) {
  assert.expect(7);
  let ownerStub = sinon.stub(Ember, 'getOwner');
  ownerStub.returns({
    knownNamesForType() {
      return ['wfs', 'wms'];
    },
    lookup() {
      return null;
    },
    _lookupFactory() {
      return {
        'APP': {
          'mapApiService': true
        }
      };
    },
    knownForType() {
      return {
        createSettings() {
          return {
            crs: undefined,
            showExisting: undefined,
          };
        }
      };
    },
  });
  this.render(hbs`{{layers-dialogs/settings/combine}}`);

  assert.equal(this.$('label:first').text().trim(), 'Тип слоя');
  assert.equal(this.$('label.button').text().trim(), 'Добавить');
  assert.equal(this.$('.flexberry-dropdown .menu .item').length, 2);

  this.$('.combineAdd .dropdown').dropdown('set value', 'wfs');
  this.$('.combineAdd .flexberry-button').click();
  assert.equal(this.$('.ui.segment:first h5:first').text().trim(), 'Настройки основного слоя wfs');
  assert.equal(this.$('.ui.segment:first .field').length, 17);

  this.$('.combineAdd .dropdown').dropdown('set value', 'wms');
  this.$('.combineAdd .flexberry-button').click();
  assert.equal(this.$('.ui.segment:last h5:last').text().trim(), 'Настройки wms');
  assert.equal(this.$('.ui.segment:last .field').length, 10);

  ownerStub.restore();
});

test('it renders with settings', function(assert) {
  assert.expect(4);
  let ownerStub = sinon.stub(Ember, 'getOwner');
  ownerStub.returns({
    knownNamesForType() {
      return ['wfs', 'wms'];
    },
    lookup() {
      return null;
    },
    _lookupFactory() {
      return {
        'APP': {
          'mapApiService': true
        }
      };
    }
  });

  this.set('settings',
    {
      type: 'wfs',
      innerLayers: [
        {
          'type': 'wms'
        }
      ]
    }
  );

  this.render(hbs`{{layers-dialogs/settings/combine settings=settings}}`);

  assert.equal(this.$('.ui.segment:first h5:first').text().trim(), 'Настройки основного слоя wfs');
  assert.equal(this.$('.ui.segment:first .field').length, 17);
  assert.equal(this.$('.ui.segment:last h5:last').text().trim(), 'Настройки wms');
  assert.equal(this.$('.ui.segment:last .field').length, 10);

  ownerStub.restore();
});
