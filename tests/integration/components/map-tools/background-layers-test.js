import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import I18nService from 'ember-i18n/services/i18n';
import I18nRuLocale from 'ember-flexberry-gis/locales/ru/translations';
import I18nEnLocale from 'ember-flexberry-gis/locales/en/translations';
import Ember from 'ember';

moduleForComponent('map-tools/background-layers', 'Integration | Component | map tools/background layers', {
  integration: true,
  beforeEach: function (assert) {
    this.register('locale:ru/translations', I18nRuLocale);
    this.register('locale:en/translations', I18nEnLocale);
    this.register('service:i18n', I18nService);

    this.inject.service('i18n', { as: 'i18n' });
    Ember.Component.reopen({
      i18n: Ember.inject.service('i18n')
    });

    this.set('i18n.locale', 'en');
  }
});

test('isVisible false', function(assert) {
  this.set('layers', Ember.A());
  this.set('isVisible', false);

  this.render(hbs`
    {{map-tools/background-layers layers=layers isVisible=isVisible}}
  `);

  assert.equal(this.$().find('.flexberry-background-layers-map-tool-div').length, 1);
  assert.equal(this.$().find('.flexberry-background-layers-map-tool').length, 1);
  assert.equal(this.$('.flexberry-background-layers-map-tool').attr('title'), 'Background layers');

  assert.equal(this.$().find('.main-background-layers').length, 0);
  assert.equal(this.$().find('.child-background-layers').length, 0);
});

test('isVisible true', function(assert) {
  this.set('layers', Ember.A([
    Ember.Object.create({
      name: 'test layer1',
      id: 'testId1',
      visibility: true,
      settingsAsObject: {
        backgroundSettings: {
          canBeBackground: true,
          picture: 'pic1',
        }
      }
    }),
    Ember.Object.create({
      name: 'test layer2',
      id: 'testId2',
      visibility: false,
      settingsAsObject: {
        backgroundSettings: {
          canBeBackground: true,
          picture: 'pic2',
        }
      }
    })
  ]));

  this.set('isVisible', true);

  this.render(hbs`
    {{map-tools/background-layers layers=layers isVisible=isVisible}}
  `);

  assert.equal(this.$().find('.flexberry-background-layers-map-tool-div').length, 1);
  assert.equal(this.$().find('.flexberry-background-layers-map-tool').length, 1);
  assert.equal(this.$('.flexberry-background-layers-map-tool').attr('title'), 'Background layers');

  assert.equal(this.$('.main-background-layers').length, 1);
  assert.equal(this.$('.child-background-layers').length, 2);
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
