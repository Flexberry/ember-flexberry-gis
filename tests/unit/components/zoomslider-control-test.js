/* eslint-disable ember/no-restricted-resolver-tests */
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('zoomslider-control', 'Unit | Component | zoomslider control', {
  unit: true,
  needs: [
    'service:i18n',
    'service:local-storage'
  ],
});

test('it should return L.Control.Zoomslider from createControl', function (assert) {
  const component = this.subject();

  // Renders the component to the page.
  const control = component.createControl();

  assert.ok(control instanceof L.Control.Zoomslider);
});
