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

module('Integration | Component | flexberry layers attributes panel', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function (assert) {
    this.owner.register('locale:ru/translations', I18nRuLocale);
    this.owner.register('locale:en/translations', I18nEnLocale);
    this.owner.register('service:i18n', I18nService);

    this.i18n = this.owner.lookup('service:i18n');
    Component.reopen({
      i18n: service('i18n')
    });

    this.set('i18n.locale', 'en');
  });

  test('it renders', async function(assert) {
    assert.equal(this.element.textContent.trim(), '');

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
    let geoJson = L.geoJSON(JSON.parse(geoJsonData));
    set(geoJson, 'readFormat', {
      featureType: {
        fieldTypes: { prop0: 'string' },
        fields: { prop0: (val) => {return val;} }
      }
    });
    this.set('items', A([{
      name: 'test layer',
      leafletObject: geoJson
    }]));

    await render(hbs`
      {{flexberry-layers-attributes-panel items=items folded=false}}
    `);

    let $tab = this.$().find('div[data-tab="test layer"]');

    assert.equal($tab.length, 1, 'Layer tab was rendered');
    assert.equal($tab.find('tbody td:last-child').text().trim(), 'value0', 'Property cell was rendered');
  });
});
