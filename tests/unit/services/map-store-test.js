import Ember from 'ember';

import { moduleFor, test } from 'ember-qunit';

import startApp from 'dummy/tests/helpers/start-app';

let App;

moduleFor('service:map-store', 'Unit | Service | map store', {
  // Specify the other units that are required for this test.
  needs: [
  'model:custom-inflector-rules',
  'model:new-platform-flexberry-g-i-s-layer-link',
  'model:new-platform-flexberry-g-i-s-layer-metadata',
  'model:new-platform-flexberry-g-i-s-link-metadata',
  'model:new-platform-flexberry-g-i-s-link-parameter',
  'model:new-platform-flexberry-g-i-s-map-layer',
  'model:new-platform-flexberry-g-i-s-map-object-setting',
  'model:new-platform-flexberry-g-i-s-map',
  'model:new-platform-flexberry-g-i-s-parameter-metadata'
  ],

  beforeEach() {
    App = startApp();
  },

  afterEach() {
    Ember.run(App, 'destroy');
  }
});

// Replace this with your real tests.
test('it exists', function(assert) {
  Ember.run(() => {
    let service = this.subject();
    assert.ok(service);
  });
});

test('it should have property osmmap after init', function(assert) {
  Ember.run(() => {
    assert.expect(3);
    let service = this.subject();
    let defaultMap = service.get('osmmap');
    assert.ok(defaultMap, 'Map created');
    assert.equal(defaultMap.get('mapLayer').length, 1, 'it have one map layer');
    assert.equal(defaultMap.get('mapLayer').objectAt(0).get('type'), 'osm', 'and this layer of type osm');
  });
});
