import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('layers-dialogs/attributes/edit', 'Integration | Component | layers dialogs/attributes/edit', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.set('data', {
    field: 'test field'
  });
  this.set('fieldTypes', {
    field: 'string'
  });
  this.set('visible', true);
  this.on('onEditRowDialogApprove', function(data) {
    assert.equal(data.field, 'test field');
  });

  this.render(hbs`
    {{layers-dialogs/attributes/edit
      visible=visible
      data=data
      fieldTypes=fieldTypes
      approve=(action "onEditRowDialogApprove")
    }}`);

  // Component is rendered outside the testing container
  let $window = this.$().closest('#ember-testing-container')
    .siblings('.ui.modals').find('.flexberry-edit-layer-attributes-dialog');
  assert.ok($window.find('.flexberry-textbox').length === 1, 'It renders one input');
  $window.find('.approve.button').click();
});
