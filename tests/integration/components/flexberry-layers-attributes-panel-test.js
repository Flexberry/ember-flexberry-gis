import { A } from '@ember/array';
import { set } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { render } from '@ember/test-helpers';

import hbs from 'htmlbars-inline-precompile';
import I18nService from 'ember-i18n/services/i18n';
import I18nRuLocale from 'ember-flexberry-gis/locales/ru/translations';
import I18nEnLocale from 'ember-flexberry-gis/locales/en/translations';

module('Integration | Component | flexberry layers attributes panel', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('locale:ru/translations', I18nRuLocale);
    this.owner.register('locale:en/translations', I18nEnLocale);
    this.owner.register('service:i18n', I18nService);

    this.i18n = this.owner.lookup('service:i18n');
    Component.reopen({
      i18n: service('i18n'),
    });

    this.set('i18n.locale', 'en');
  });

  test('it renders', async function (assert) {
    assert.equal(this.element.textContent.trim(), '');

    const geoJsonData = `
    {"type": "FeatureCollection",
      "features": [{
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [102.0, 0.5]
        },
        "properties": {
          "prop0": "value0"
        }
      }]
    }`;
    const geoJson1 = L.geoJSON(JSON.parse(geoJsonData));
    set(geoJson1, 'readFormat', {
      featureType: {
        fieldTypes: { prop0: 'string', },
        fields: { prop0: (val) => val, },
      },
    });
    const geoJson2 = L.geoJSON(JSON.parse(geoJsonData));
    set(geoJson2, 'readFormat', {
      featureType: {
        fieldTypes: { prop0: 'string', },
        fields: { prop0: (val) => val, },
      },
    });
    this.set('items', A([{
      name: 'test layer 1',
      leafletObject: geoJson1,
      settings: { readonly: true, },
    },
    {
      name: 'test layer 2',
      leafletObject: geoJson2,
      settings: { readonly: false, },
    }]));

    await render(hbs`
      {{flexberry-layers-attributes-panel items=items folded=false}}
    `);

    assert.equal(this.$().find('div.tab.bottompanel-tab-data-panel').length, 2, 'Two tabs was rendered');

    const $tab1 = this.$().find('div[data-tab="test layer 1"]');
    assert.equal($tab1.length, 1, 'Test layer 1 tab was rendered');
    assert.equal($tab1.find('tbody td:last-child').text().trim(), 'value0', 'Property cell was rendered');
    assert.equal($tab1.find('label[title="Find an item on the map"]').length, 1, 'Find item on map button available on tab1');
    assert.equal($tab1.find('label[title="Clear the found items"]').length, 1, 'Clear found items button available on tab1');
    assert.equal($tab1.find('label[title="Delete the selected items"]').length, 0, 'Delete button unavailable on tab1');
    assert.equal($tab1.find('.flexberry-geometry-tools').length, 0, 'Edit geometry tools unavailable on tab1');

    const $tab2 = this.$().find('div[data-tab="test layer 2"]');
    assert.equal($tab2.length, 1, 'Test layer 2 tab was rendered');
    assert.equal($tab2.find('label[title="Find an item on the map"]').length, 2, 'Find item on map button available on tab2 (toolbar+row)');
    assert.equal($tab2.find('label[title="Clear the found items"]').length, 1, 'Clear found items button available on tab2');
    assert.equal($tab2.find('label[title="Delete the selected items"]').length, 1, 'Delete button available on tab2');
    assert.equal($tab2.find('.flexberry-geometry-tools').length, 1, 'Edit geometry tools available on tab2');
  });
});
