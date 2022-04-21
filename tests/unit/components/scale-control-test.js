/* eslint-disable ember/no-restricted-resolver-tests */
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('scale-control', 'Unit | Component | scale control', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar'],
  unit: true,
  needs: [
    'service:i18n',
    'service:local-storage'
  ],
});

test('it should return L.Control.Scale from createControl', function (assert) {
  const component = this.subject();

  // Renders the component to the page.
  const control = component.createControl();

  assert.ok(control instanceof L.Control.Scale);
});
