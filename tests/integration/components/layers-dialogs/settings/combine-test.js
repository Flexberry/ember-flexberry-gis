import Ember from 'ember';
import { inject as service } from '@ember/service';
import { run, next } from '@ember/runloop';
import Component from '@ember/component';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  click,
  findAll,
  find
} from '@ember/test-helpers';

import hbs from 'htmlbars-inline-precompile';

import I18nService from 'ember-i18n/services/i18n';
import I18nRuLocale from 'ember-flexberry-gis/locales/ru/translations';
import I18nEnLocale from 'ember-flexberry-gis/locales/en/translations';
import sinon from 'sinon';

let ownerStub;

module('Integration | Component | layers dialogs/settings/combine', function (hooks) {
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
  });

  hooks.afterEach(function () {
    ownerStub.restore();
  });

  test('it renders without settings and test action addTypeSettings', async function (assert) {
    assert.expect(7);
    ownerStub = sinon.stub(Ember, 'getOwner');
    ownerStub.returns({
      knownNamesForType() {
        return ['wfs', 'wms'];
      },
      lookup() {
        return null;
      },
      factoryFor() {
        return {
          class: {
            APP: {
              mapApiService: true,
            },
          },
        };
      },
      knownForType() {
        return {
          createSettings() {
            return {
              crs: undefined,
              showExisting: undefined,
            };
          },
        };
      },
    });

    await render(hbs`{{layers-dialogs/settings/combine}}`);

    assert.equal(this.$('label:first').text().trim(), 'Тип слоя');
    assert.equal(find('label.button').textContent.trim(), 'Добавить');
    assert.equal(findAll('.flexberry-dropdown .menu .item').length, 2);

    run(() => {
      this.$('.combineAdd .ui.dropdown').dropdown('set value', '0');
      next(async () => {
        await click('.combineAdd .flexberry-button');
        next(() => {
          assert.equal(this.$('.ui.segment:first h5:first').text().trim(), 'Настройки основного слоя wfs');
          assert.equal(this.$('.ui.segment:first .field').length, 17);
          next(() => {
            this.$('.combineAdd .dropdown').dropdown('set value', '1');
            next(async () => {
              await click('.combineAdd .flexberry-button');
              next(() => {
                assert.equal(this.$('.ui.segment:last h5:last').text().trim(), 'Настройки wms');
                assert.equal(this.$('.ui.segment:last .field').length, 10);
              });
            });
          });
        });
      });
    });
  });

  test('it renders with settings', async function (assert) {
    assert.expect(4);
    ownerStub = sinon.stub(Ember, 'getOwner');
    ownerStub.returns({
      knownNamesForType() {
        return ['wfs', 'wms'];
      },
      lookup() {
        return null;
      },
      factoryFor() {
        return {
          class: {
            APP: {
              mapApiService: true,
            },
          },
        };
      },
    });

    this.set('settings', {
      type: 'wfs',
      innerLayers: [
        {
          type: 'wms',
        }
      ],
    });

    await render(hbs`{{layers-dialogs/settings/combine settings=settings}}`);

    assert.equal(this.$('.ui.segment:first h5:first').text().trim(), 'Настройки основного слоя wfs');
    assert.equal(this.$('.ui.segment:first .field').length, 17);
    assert.equal(this.$('.ui.segment:last h5:last').text().trim(), 'Настройки wms');
    assert.equal(this.$('.ui.segment:last .field').length, 10);
  });
});
