import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('flexberry-layers-attributes-panel', 'Integration | Component | flexberry layers attributes panel', {
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

  this.render(hbs`
    {{flexberry-layers-attributes-panel items=items folded=false}}
  `);

  let $tab = this.$().find('div[data-tab="test layer"]');

  assert.equal($tab.length, 1, 'Layer tab was rendered');
  assert.equal($tab.find('tbody td:last-child').text().trim(), 'value0', 'Property cell was rendered');
});
