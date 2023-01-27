import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import I18nService from 'ember-i18n/services/i18n';
import I18nRuLocale from 'ember-flexberry-gis/locales/ru/translations';
import I18nEnLocale from 'ember-flexberry-gis/locales/en/translations';
import startApp from '../../helpers/start-app';

let app;

moduleForComponent('flexberry-boundingbox', 'Integration | Component | flexberry boundingbox', {
  beforeEach: function (assert) {
    this.register('locale:ru/translations', I18nRuLocale);
    this.register('locale:en/translations', I18nEnLocale);
    this.register('service:i18n', I18nService);
    app = startApp();

    this.inject.service('i18n', { as: 'i18n' });
    Ember.Component.reopen({
      i18n: Ember.inject.service('i18n')
    });

  },
  integration: true
});

test('flexberry-boundingbox test', function(assert) {
  assert.expect(2);
  var done = assert.async(1);
  this.set('leafletMap', L.map(document.createElement('div')));
  this.render(hbs`{{flexberry-boundingbox _leafletMap=leafletMap}}`);

  let resultMessage = 'bounding box accept button is disabled on init';
  assert.equal(this.$('.flexberry-boundingbox .flexberry-button').hasClass('disabled'), true, resultMessage);

  fillIn('.flexberry-boundingbox input:first', '1').then(() => {
    resultMessage = 'bounding box accept button is enabled on input fields changing';
    assert.equal(this.$('.flexberry-boundingbox .flexberry-button').hasClass('disabled'), false, resultMessage);
    done();
  });

  this.$('.leaflet-areaselect-handle .leaflet-control');
});
