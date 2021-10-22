import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | flexberry layers attributes panel', function(hooks) {
  setupTest(hooks);

  let tabModel = A({
    selectAll: false,
    propertyLink: {
      'ember0': { id: 0 },
      'ember1': { id: 1 },
      'ember2': { id: 2 },
      'ember3': { id: 3 },
      'ember4': { id: 4 },
      'ember5': { id: 5 },
      'ember6': { id: 6 },
      'ember7': { id: 7 },
      'ember8': { id: 8 },
      'ember9': { id: 9 },
    }
  });

  test('test method changeSelectedAll showAll', function (assert) {
    assert.expect(1);
    let component = this.owner.factoryFor('component:flexberry-layers-attributes-panel').create();
    component.changeSelectedAll(tabModel, true);
    assert.deepEqual(tabModel.get('_selectedRows'), {
      'ember0': true,
      'ember1': true,
      'ember2': true,
      'ember3': true,
      'ember4': true,
      'ember5': true,
      'ember6': true,
      'ember7': true,
      'ember8': true,
      'ember9': true,
    });
  });

  test('test method changeSelectedAll hideAll', function (assert) {
    assert.expect(1);
    let component = this.owner.factoryFor('component:flexberry-layers-attributes-panel').create();
    component.changeSelectedAll(tabModel, false);
    assert.deepEqual(tabModel.get('_selectedRows'), {});
  });
});
