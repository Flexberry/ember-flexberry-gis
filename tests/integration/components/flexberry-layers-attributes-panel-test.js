import { moduleForComponent, test } from 'ember-qunit';

import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import I18nService from 'ember-i18n/services/i18n';
import I18nRuLocale from 'ember-flexberry-gis/locales/ru/translations';
import I18nEnLocale from 'ember-flexberry-gis/locales/en/translations';

moduleForComponent('flexberry-layers-attributes-panel', 'Integration | Component | flexberry layers attributes panel', {

  beforeEach: function (assert) {
    this.register('locale:ru/translations', I18nRuLocale);
    this.register('locale:en/translations', I18nEnLocale);
    this.register('service:i18n', I18nService);

    this.inject.service('i18n', { as: 'i18n' });
    Ember.Component.reopen({
      i18n: Ember.inject.service('i18n')
    });

    this.set('i18n.locale', 'en');
  },

  integration: true
});

test('it renders', function (assert) {
  assert.equal(this.$().text().trim(), '');

  let geoJsonData = `
    {
      "type": "FeatureCollection",
      "features": [{
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [102.0, 0.5]
        },
        "properties": {
          "prop0": "value0"
        }
      }
    ]
  }`;
  let geoJson1 = L.geoJSON(JSON.parse(geoJsonData));
  Ember.set(geoJson1, 'readFormat', {
    featureType: {
      fieldTypes: { prop0: 'string' },
      fields: { prop0: (val) => { return val; } }
    }
  });
  let geoJson2 = L.geoJSON(JSON.parse(geoJsonData));
  Ember.set(geoJson2, 'readFormat', {
    featureType: {
      fieldTypes: { prop0: 'string' },
      fields: { prop0: (val) => { return val; } }
    }
  });
  this.set('items', Ember.A([{
    name: 'test layer 1',
    leafletObject: geoJson1,
    settings: { readonly: true }
  },
  {
    name: 'test layer 2',
    leafletObject: geoJson2,
    settings: { readonly: false }
  }]));

  this.render(hbs`
    {{flexberry-layers-attributes-panel items=items folded=false}}
  `);

  assert.equal(this.$().find('div.tab.bottompanel-tab-data-panel').length, 2, 'Two tabs was rendered');

  let $tab1 = this.$().find('div[data-tab="test layer 1"]');
  assert.equal($tab1.length, 1, 'Test layer 1 tab was rendered');
  assert.equal($tab1.find('tbody td:last-child').text().trim(), 'value0', 'Property cell was rendered');
  assert.equal($tab1.find('label[title="Find an item on the map"]').length, 1, 'Find item on map button available on tab1');
  assert.equal($tab1.find('label[title="Clear the found items"]').length, 1, 'Clear found items button available on tab1');
  assert.equal($tab1.find('label[title="Delete the selected items"]').length, 0, 'Delete button unavailable on tab1');
  assert.equal($tab1.find('.flexberry-geometry-tools').length, 0, 'Edit geometry tools unavailable on tab1');

  let $tab2 = this.$().find('div[data-tab="test layer 2"]');
  assert.equal($tab2.length, 1, 'Test layer 2 tab was rendered');
  assert.equal($tab2.find('label[title="Find an item on the map"]').length, 2, 'Find item on map button available on tab2 (toolbar+row)');
  assert.equal($tab2.find('label[title="Clear the found items"]').length, 1, 'Clear found items button available on tab2');
  assert.equal($tab2.find('label[title="Delete the selected items"]').length, 1, 'Delete button available on tab2');
  assert.equal($tab2.find('.flexberry-geometry-tools').length, 1, 'Edit geometry tools available on tab2');
});
