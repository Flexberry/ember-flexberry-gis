import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import I18nService from 'ember-i18n/services/i18n';
import I18nRuLocale from 'ember-flexberry-gis/locales/ru/translations';
import I18nEnLocale from 'ember-flexberry-gis/locales/en/translations';

moduleForComponent('flexberry-search-panel', 'Integration | Component | flexberry search panel', {
  beforeEach: function (assert) {
    this.register('locale:ru/translations', I18nRuLocale);
    this.register('locale:en/translations', I18nEnLocale);
    this.register('service:i18n', I18nService);

    this.inject.service('i18n', { as: 'i18n' });
    Ember.Component.reopen({
      i18n: Ember.inject.service('i18n')
    });

    this.set('i18n.locale', 'ru');

    let leafletMap = L.map(document.createElement('div'), {
      center: [51.505, -0.09],
      zoom: 13
    });
    this.set('leafletMap', leafletMap);
  },

  integration: true
});

test('goto by coordinates in degree min sec', function(assert) {
  this.set('queryString', '57°27\'49.2" 57°06\'08.3"');
  this.render(hbs`{{flexberry-search-panel leafletMap=leafletMap queryString=queryString}}`);
  this.$('.flexberry-search input').val('57°27\'49.2" 57°06\'08.3"');
  this.$('.flexberry-search .search-button').click();

  assert.equal($(this.get('leafletMap').getPane('popupPane')).text(), 'Широта: 57°27\'49.2"; Долгота: 57°06\'08.3"×');
});

test('goto by coordinates in decimal degrees', function(assert) {
  this.set('queryString', '57.27492 57.06083');
  this.render(hbs`{{flexberry-search-panel leafletMap=leafletMap queryString=queryString}}`);
  this.$('.flexberry-search input').val('57.27492 57.06083');
  this.$('.flexberry-search .search-button').click();

  assert.equal($(this.get('leafletMap').getPane('popupPane')).text(), 'Широта: 57.27492; Долгота: 57.06083×');
});
