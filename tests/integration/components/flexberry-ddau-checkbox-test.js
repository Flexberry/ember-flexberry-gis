import FlexberryDdauCheckboxActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-ddau-checkbox-actions-handler';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('flexberry-ddau-checkbox', 'Integration | Component | flexberry-ddau-checkbox', {
  integration: true
});

test('Component renders properly', function(assert) {
  assert.expect(5);

  this.render(hbs`{{flexberry-ddau-checkbox}}`);

  // Retrieve component & it's inner input.
  let $component = this.$().children();
  let $checkboxInput = $component.children('input');

  assert.strictEqual($component.hasClass('ui'), true, 'Component\'s container has \'ui\' css-class');
  assert.strictEqual($component.hasClass('checkbox'), true, 'Component\'s container has \'checkbox\' css-class');

  assert.strictEqual($checkboxInput.attr('type'), 'checkbox', 'Component has inner checkbox input');
  assert.strictEqual($checkboxInput.hasClass('hidden'), true, 'Component\'s inner checkbox input has \'hidden\' css-class');
  assert.strictEqual($checkboxInput.prop('checked'), false, 'Component\'s inner checkbox input isn\'t checked');
});

test('Component doesn\'t change binded value (without \'change\' action handler)', function(assert) {
  assert.expect(3);

  // Handle any actions with this.on('myAction', function(val) { ... });
  this.set('flag', false);
  this.render(hbs`{{flexberry-ddau-checkbox value=flag}}`);

  // Retrieve component & it's inner input.
  let $component = this.$().children();
  let $checkboxInput = $component.children('input');

  // Check component's initial state.
  assert.strictEqual($checkboxInput.prop('checked'), false, 'Component\'s inner checkbox input isn\'t checked before click');

  // Imitate click on component.
  $component.click();

  // Check component's & binded value's states after click.
  assert.strictEqual(
    $checkboxInput.prop('checked'),
    false,
    'Component\'s inner checkbox input isn\'t checked after click (without \'change\' action handler)');
  assert.strictEqual(
    this.get('flag'),
    false,
    'Component doesn\'t change binded value (without \'change\' action handler)');
});

test('Component changes binded value (with \'change\' action handler)', function(assert) {
  assert.expect(7);

  this.set('flag', false);
  
  // Bind component's 'change' action handler.
  this.set('actions.onFlagChange', e => {
    assert.strictEqual(e.event.target.id, this.$('input')[0].id);
    this.set('flag', e.newValue);
  });

  this.render(hbs`{{flexberry-ddau-checkbox value=flag change=(action \"onFlagChange\")}}`);

  // Retrieve component & it's inner input.
  let $component = this.$().children();
  let $checkboxInput = $component.children('input');

  // Check component's initial state.
  assert.strictEqual($checkboxInput.prop('checked'), false, 'Component\'s inner checkbox input isn\'t checked before click');  

  // Make component checked.
  $component.click();
  assert.strictEqual(
    $checkboxInput.prop('checked'),
    true,
    'Component\'s inner checkbox input is checked after click (with \'change\' action handler)');
  assert.strictEqual(
    this.get('flag'),
    true,
    'Component changed binded value (with \'change\' action handler)');

  // Make component unchecked.
  $component.click();
  assert.strictEqual(
    $checkboxInput.prop('checked'),
    false,
    'Component\'s inner checkbox input is unchecked after second click (with \'change\' action handler)');
  assert.strictEqual(
    this.get('flag'),
    false,
    'Component changed binded value after second click (with \'change\' action handler)');
});

test('Component changes binded value (with \'change\' action handler from special mixin)', function(assert) {
  assert.expect(5);

  this.set('flag', false);

  // Bind component's 'change' action handler from specialized mixin.
  this.set('actions.onCheckboxChange', FlexberryDdauCheckboxActionsHandlerMixin.mixins[0].properties.actions.onCheckboxChange);

  this.render(hbs`{{flexberry-ddau-checkbox value=flag change=(action \"onCheckboxChange\" \"flag\")}}`);

  // Retrieve component & it's inner input.
  let $component = this.$().children();
  let $checkboxInput = $component.children('input');

  // Check component's initial state.
  assert.strictEqual($checkboxInput.prop('checked'), false, 'Component\'s inner checkbox input isn\'t checked before click');  

  // Make component checked.
  $component.click();
  assert.strictEqual(
    $checkboxInput.prop('checked'),
    true,
    'Component\'s inner checkbox input is checked after click (with \'change\' action handler from special mixin)');
  assert.strictEqual(
    this.get('flag'),
    true,
    'Component changed binded value (with \'change\' action handler from special mixin)');

  // Make component unchecked.
  $component.click();
  assert.strictEqual(
    $checkboxInput.prop('checked'),
    false,
    'Component\'s inner checkbox input is unchecked after second click (with \'change\' action handler from special mixin)');
  assert.strictEqual(
    this.get('flag'),
    false,
    'Component changed binded value after second click (with \'change\' action handler from special mixin)');
});
