import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import I18nService from 'ember-i18n/services/i18n';
import I18nRuLocale from 'ember-flexberry-gis/locales/ru/translations';
import I18nEnLocale from 'ember-flexberry-gis/locales/en/translations';

module('Integration | Component | flexberry search panel', function(hooks) {
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

    let leafletMap = L.map(document.createElement('div'), {
      center: [51.505, -0.09],
      zoom: 13
    });
    this.set('leafletMap', leafletMap);
  });

  test('goto by coordinates in degree min sec', async function(assert) {
    this.set('queryString', '57°27\'49.2" 57°06\'08.3"');
    await render(hbs`{{flexberry-search-panel leafletMap=leafletMap queryString=queryString}}`);
    await fillIn('.flexberry-search input', '57°27\'49.2" 57°06\'08.3"');
    await click('.flexberry-search .search-button');

    assert.equal($(this.get('leafletMap').getPane('popupPane')).text(), 'Широта: 57°27\'49.2"; Долгота: 57°06\'08.3"×');
  });

  test('goto by coordinates in decimal degrees', async function(assert) {
    this.set('queryString', '57.27492 57.06083');
    await render(hbs`{{flexberry-search-panel leafletMap=leafletMap queryString=queryString}}`);
    await fillIn('.flexberry-search input', '57.27492 57.06083');
    await click('.flexberry-search .search-button');

    assert.equal($(this.get('leafletMap').getPane('popupPane')).text(), 'Широта: 57.27492; Долгота: 57.06083×');
  });
});
