import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('minimap-control', 'Integration | Component | minimap control', {
  integration: true
});

test('template return L.layerGroup', function(assert) {

  assert.expect(1);

  this.set('layerGroupClass', L.LayerGroup);

  this.render(hbs`
    {{#minimap-control as |layerG|}}
       <div class="layerG-body" is-layergroup="{{instance-of layerG layerGroupClass}}"></div>
    {{/minimap-control}}
  `);

  assert.ok(this.$('div.layerG-body').attr('is-layergroup'));

});
