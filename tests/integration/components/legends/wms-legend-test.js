import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('legends/wms-legend', 'Integration | Component | legends/wms legend', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  this.set('testLayer', {
    settingsAsObject: {
      url: 'http://212.192.76.235:8080/geoserver/wms',
      layers: 'lesonas1969:goszem,lesonas1969:river,lesonas1969:kvartal'
    }
  });

  this.render(hbs`{{legends/wms-legend layer=testLayer}}`);

  let $images = this.$('img');
  let expectedSrc = 'http://212.192.76.235:8080/geoserver/wms?service=WMS&request=GetLegendGraphic&version=1.1.0&format=image%2Fpng&layer=lesonas1969%3Agoszem';

  assert.equal($images.size(), 3, 'Images for all defined layers are rendered');
  assert.equal($images.first().attr('src'), expectedSrc, 'Image\'s \'src\' attribute computed as expected');
});
