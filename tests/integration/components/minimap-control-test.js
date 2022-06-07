import { moduleForComponent, skip } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('minimap-control', 'Integration | Component | minimap control', {
  integration: true
});

skip('template return L.layerGroup', async function(assert) {

  assert.expect(1);

  this.set('layerGroupClass', L.LayerGroup);

  this.render(hbs`
    {{#minimap-control as |layerG|}}
       <div class="layerG-body" is-layergroup="{{instance-of layerG layerGroupClass}}"></div>
    {{/minimap-control}}
  `);

  assert.ok(this.$('div.layerG-body').attr('is-layergroup'));

});