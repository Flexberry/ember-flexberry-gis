import { moduleForComponent, test } from 'ember-qunit';

import { A } from '@ember/array';
import { set } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

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
    Component.reopen({
      i18n: service('i18n'),
    });

    this.set('i18n.locale', 'en');
  },

  integration: true,
});

test('it renders', function(assert) {
  assert.equal(this.$().text().trim(), '');

  const geoJsonData = `
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
  const geoJson = L.geoJSON(JSON.parse(geoJsonData));
  set(geoJson, 'readFormat', {
    featureType: {
      fieldTypes: { prop0: 'string' },
      fields: { prop0: (val) => val, },
    }
  });
  this.set('items', A([{
    name: 'test layer',
    leafletObject: geoJson
  }]));

  this.render(hbs`
    {{flexberry-layers-attributes-panel items=items folded=false}}
  `);

  const $tab = this.$().find('div[data-tab="test layer"]');

  assert.equal($tab.length, 1, 'Layer tab was rendered');
  assert.equal($tab.find('tbody td:last-child').text().trim(), 'value0', 'Property cell was rendered');
});
