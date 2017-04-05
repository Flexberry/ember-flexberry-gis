import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('legends/wms-legend', 'Integration | Component | legends/wms legend', {
  integration: true
});

test('it renders', function(assert) {
  this.set('testLayer', { 'settingsAsObject':
    { 'url': 'http://212.192.76.235:8080/geoserver/wms',
    'layers': 'lesonas1969:goszem,lesonas1969:river,lesonas1969:kvartal'
    }
  });

  this.render(hbs`{{legends/wms-legend layerModel=testLayer}}`);

  assert.equal(this.$('div img').size(), 3, 'render all <img> in <div> blocks');

  let testRequestStr = 'http://212.192.76.235:8080/geoserver/wms?' +
    'service=WMS&request=GetLegendGraphic&format=image%2Fpng&version=1.1.0&layer=lesonas1969%3Agoszem';

  assert.equal(this.$('div img').attr('src'), testRequestStr, 'request\'s string generated correctly');
});
