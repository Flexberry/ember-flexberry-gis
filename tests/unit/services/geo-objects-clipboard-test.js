import { moduleFor, test } from 'ember-qunit';

moduleFor('service:geo-objects-clipboard', 'Unit | Service | geo-objects-clipboard');

test('it exists and works', function(assert) {
  assert.expect(5);

  let clipboard = this.subject();
  let copy = { leafletLayer: { toGeoJSON: () => ({}) } };
  let cut = { leafletLayer: { toGeoJSON: () => ({}) } };
  clipboard.on('paste', (c) => {
    assert.ok(c === cut);
  });

  clipboard.cut(copy);
  clipboard.copy(copy);
  clipboard.copy(cut);
  clipboard.cut(cut);

  assert.throws(() => {
    clipboard.paste({});
  });
  assert.equal(clipboard.get('content.length'), 2);

  clipboard.paste(clipboard.get('content.firstObject'));
  assert.equal(clipboard.get('content.length'), 1);

  clipboard.paste(clipboard.get('content.firstObject'));
  assert.equal(clipboard.get('isEmpty'), true);
});
