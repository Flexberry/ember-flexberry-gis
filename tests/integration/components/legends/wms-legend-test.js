import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | legends/wms legend', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(2);

    this.set('testLayer', {
      settingsAsObject: {
        url: 'http://212.192.76.235:8080/geoserver/wms',
        layers: 'lesonas1969:goszem,lesonas1969:river,lesonas1969:kvartal',
      },
    });

    await render(hbs`{{legends/wms-legend layer=testLayer}}`);

    const $images = this.$('img');
    const src = 'http://212.192.76.235:8080/geoserver/'
      + 'wms?service=WMS&request=GetLegendGraphic&version=1.1.0&format=image%2Fpng&layer=lesonas1969%3Agoszem&style=';

    assert.equal($images.length, 3, 'Images for all defined layers are rendered');
    assert.equal($images.first().attr('src'), src, 'Image\'s \'src\' attribute computed as expected');
  });
});
