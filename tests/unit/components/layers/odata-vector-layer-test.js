import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import startApp from 'dummy/tests/helpers/start-app';
import { Query } from 'ember-flexberry-data';

let app;

moduleForComponent('layers/odata-vector-layer', 'Unit | Component | layers/odata vector layer', {
  unit: true,
  needs: [
    'service:map-api',
    'config:environment',
    'model:new-platform-flexberry-g-i-s-link-parameter'
  ],
  beforeEach: function () {
    app = startApp();
  },
  afterEach: function () {
    Ember.run(app, 'destroy');
  }
});

test('getFilterParameters return SimplePredicate on single value in array', function (assert) {
  assert.expect(2);
  var done = assert.async(1);
  Ember.run(() => {
    // arrange
    let component = this.subject();
    let linkParameter = Ember.Object.create({
      'queryKey': 'PK',
      'layerField': 'testField'
    });

    // act
    let result = component.getFilterParameters([linkParameter], { 'PK': ['id1'] });

    // assert
    let firstValue = result[0];
    assert.ok(firstValue instanceof Query.SimplePredicate);
    assert.equal(firstValue.toString(), '(testField eq id1)');
    done();
  });
});
