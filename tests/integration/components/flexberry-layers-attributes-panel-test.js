import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
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

test('it renders', function(assert) {
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
  Ember.set(geoJson, 'readFormat', {
    featureType: {
      fieldTypes: { prop0: 'string' },
      fields: { prop0: (val) => {return val;} }
    }
  });
  this.set('items', Ember.A([{
    name: 'test layer',
    leafletObject: geoJson
  }]));
  Ember.getOwner(this).knownNamesForType = () => { return []; };

  this.render(hbs`
    {{flexberry-layers-attributes-panel items=items folded=false}}
  `);

  let $tab = this.$().find('div[data-tab="test layer"]');

  assert.equal($tab.length, 1, 'Layer tab was rendered');
  assert.equal($tab.find('tbody td:last-child').text().trim(), 'value0', 'Property cell was rendered');
});
