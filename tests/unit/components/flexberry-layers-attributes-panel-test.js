import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';

moduleForComponent('flexberry-layers-attributes-panel', 'Unit | Component | flexberry layers attributes panel', {
  unit: true
});

let tabModel = Ember.A({
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
  let component = this.subject();
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
  let component = this.subject();
  component.changeSelectedAll(tabModel, false);
  assert.deepEqual(tabModel.get('_selectedRows'), {});
});
