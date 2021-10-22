import EmberObject from '@ember/object';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import I18nService from 'ember-i18n/services/i18n';
import I18nRuLocale from 'ember-flexberry-gis/locales/ru/translations';
import I18nEnLocale from 'ember-flexberry-gis/locales/en/translations';

module('Integration | Component | map tools/background layers', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function (assert) {
    this.owner.register('locale:ru/translations', I18nRuLocale);
    this.owner.register('locale:en/translations', I18nEnLocale);
    this.owner.register('service:i18n', I18nService);

    this.i18n = this.owner.lookup('service:i18n');
    Component.reopen({
      i18n: service('i18n'),
    });

    this.set('i18n.locale', 'en');
  });

  test('isVisible false', async function (assert) {
    this.set('layers', A());
    this.set('isVisible', false);

    await render(hbs`
      {{map-tools/background-layers layers=layers isVisible=isVisible}}
    `);

    assert.equal(this.$().find('.flexberry-background-map-tool-div').length, 1);
    assert.equal(this.$().find('.flexberry-background-map-tool').length, 1);
    assert.equal(find('.flexberry-background-map-tool').getAttribute('title'), 'Background layers');

    assert.equal(this.$().find('.main-background-layers').length, 0);
    assert.equal(this.$().find('.child-background-layers').length, 0);
  });

  test('isVisible true', async function (assert) {
    this.set('layers', A([
      EmberObject.create({
        name: 'test layer1',
        id: 'testId1',
        visibility: true,
        settingsAsObject: {
          backgroundSettings: {
            canBeBackground: true,
            picture: 'pic1',
          },
        },
      }),
      EmberObject.create({
        name: 'test layer2',
        id: 'testId2',
        visibility: false,
        settingsAsObject: {
          backgroundSettings: {
            canBeBackground: true,
            picture: 'pic2',
          },
        },
      })
    ]));

    this.set('isVisible', true);

    await render(hbs`
      {{map-tools/background-layers layers=layers isVisible=isVisible}}
    `);

    assert.equal(this.$().find('.flexberry-background-map-tool-div').length, 1);
    assert.equal(this.$().find('.flexberry-background-map-tool').length, 1);
    assert.equal(find('.flexberry-background-map-tool').getAttribute('title'), 'Background layers');

    assert.equal(findAll('.main-background-layers').length, 1);
    assert.equal(findAll('.child-background-layers').length, 2);
    assert.ok(this.$(this.$('.main-background-layers').children()[0]).hasClass('first-item'));
    assert.ok(this.$(this.$('.main-background-layers').children()[1]).hasClass('last-item'));
    assert.equal(this.$(this.$('.child-background-layers').children()[0]).attr('src'), 'pic1');
    assert.equal(this.$(this.$('.child-background-layers').children()[0]).attr('class'), 'picture active');
    assert.equal(this.$(this.$('.child-background-layers').children()[1]).text(), 'test layer1');
    assert.equal(this.$(this.$('.child-background-layers').children()[2]).attr('src'), 'pic2');
    assert.equal(this.$(this.$('.child-background-layers').children()[2]).attr('class'), 'picture ');
    assert.equal(this.$(this.$('.child-background-layers').children()[3]).text(), 'test layer2');

    this.$('.child-background-layers')[1].click();
    assert.equal(this.$(this.$('.child-background-layers').children()[0]).attr('class'), 'picture ');
    assert.equal(this.$(this.$('.child-background-layers').children()[2]).attr('class'), 'picture active');
  });
});
