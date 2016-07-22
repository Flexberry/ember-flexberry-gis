import Ember from 'ember';
import FlexberryDdauCheckboxComponent from 'ember-flexberry-gis/components/flexberry-ddau-checkbox';
import FlexberryDdauCheckboxActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-ddau-checkbox-actions-handler';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('flexberry-ddau-checkbox', 'Integration | Component | flexberry-ddau-checkbox', {
  integration: true
});

test('Component renders properly', function(assert) {
  assert.expect(13);

  this.render(hbs`{{flexberry-ddau-checkbox caption=caption}}`);

  // Retrieve component, it's inner <input> & <label>.
  let $component = this.$().children();
  let $checkboxInput = $component.children('input');
  let $checkboxCaption = $component.children('label');

  let flexberryClassNames = FlexberryDdauCheckboxComponent.flexberryClassNames;

  // Check wrapper <div>.
  assert.strictEqual($component.prop('tagName'), 'DIV', 'Component\'s wrapper is a <div>');
  assert.strictEqual(
    $component.hasClass(flexberryClassNames.wrapper),
    true,
    'Component\'s container has \'' + flexberryClassNames.wrapper + '\' css-class');
  assert.strictEqual($component.hasClass('ui'), true, 'Component\'s wrapper has \'ui\' css-class');
  assert.strictEqual($component.hasClass('checkbox'), true, 'Component\'s wrapper has \'checkbox\' css-class');

  // Check <input>.
  assert.strictEqual($checkboxInput.length === 1, true, 'Component has inner <input>');
  assert.strictEqual($checkboxInput.attr('type'), 'checkbox', 'Component\'s inner <input> is of checkbox type');
  assert.strictEqual(
    $checkboxInput.hasClass(flexberryClassNames.checkboxInput),
    true,
    'Component\'s inner checkbox <input> has \'' + flexberryClassNames.checkboxInput + '\' css-class');
  assert.strictEqual($checkboxInput.hasClass('hidden'), true, 'Component\'s inner checkbox <input> has \'hidden\' css-class');
  assert.strictEqual($checkboxInput.prop('checked'), false, 'Component\'s inner checkbox <input> isn\'t checked');

  // Check caption's <label>.
  assert.strictEqual($checkboxCaption.length === 1, true, 'Component has inner <label>');
  assert.strictEqual(
    $checkboxCaption.hasClass(flexberryClassNames.checkboxCaption),
    true,
    'Component\'s inner <label> has \'' + flexberryClassNames.checkboxCaption + '\' css-class');
  assert.strictEqual(
    Ember.$.trim($checkboxCaption.text()).length === 0,
    true,
    'Component\'s inner <label> is empty by default');

  let checkboxCaptionText = 'Checkbox caption';
  this.set('caption', checkboxCaptionText);
  assert.strictEqual(
    Ember.$.trim($checkboxCaption.text()),
    checkboxCaptionText,
    'Component\'s inner <label> text changes when component\'s \'caption\' property changes');
});

test('Component invokes actions', function(assert) {
  assert.expect(9);

  let latestEventObjects = {
    change: null,
    check: null,
    uncheck: null,
  };

  // Bind component's action handlers.
  this.set('actions.onFlagChange', e => {
    latestEventObjects.change = e;
  });
  this.set('actions.onFlagCheck', e => {
    latestEventObjects.check = e;
  });
  this.set('actions.onFlagUncheck', e => {
    latestEventObjects.uncheck = e;
  });
  this.render(hbs`{{flexberry-ddau-checkbox change=(action \"onFlagChange\") check=(action \"onFlagCheck\") uncheck=(action \"onFlagUncheck\")}}`);

  // Retrieve component.
  let $component = this.$().children();

  assert.strictEqual(latestEventObjects.change, null, 'Component\'s \'change\' action wasn\'t invoked before click');
  assert.strictEqual(latestEventObjects.check, null, 'Component\'s \'check\' action wasn\'t invoked before click');
  assert.strictEqual(latestEventObjects.uncheck, null, 'Component\'s \'uncheck\' action wasn\'t invoked before click');

  // Imitate first click on component.
  $component.click();

  assert.notStrictEqual(latestEventObjects.change, null, 'Component\'s \'change\' action was invoked after first click');
  assert.notStrictEqual(latestEventObjects.check, null, 'Component\'s \'check\' action was invoked after first click');
  assert.strictEqual(latestEventObjects.uncheck, null, 'Component\'s \'uncheck\' action wasn\'t invoked after first click');

  latestEventObjects.change = null;
  latestEventObjects.check = null;
  latestEventObjects.uncheck = null;

  // Imitate second click on component.
  $component.click();

  assert.notStrictEqual(latestEventObjects.change, null, 'Component\'s \'change\' action was invoked after second click');
  assert.strictEqual(latestEventObjects.check, null, 'Component\'s \'check\' action wasn\'t invoked after second click');
  assert.notStrictEqual(latestEventObjects.uncheck, null, 'Component\'s \'uncheck\' action was invoked after second click');
});

test('Component doesn\'t change binded value (without \'change\' action handler)', function(assert) {
  assert.expect(3);

  this.set('flag', false);
  this.render(hbs`{{flexberry-ddau-checkbox value=flag}}`);

  // Retrieve component & it's inner <input>.
  let $component = this.$().children();
  let $checkboxInput = $component.children('input');

  // Check component's initial state.
  assert.strictEqual($checkboxInput.prop('checked'), false, 'Component\'s inner checkbox <input> isn\'t checked before click');

  // Imitate click on component.
  $component.click();

  // Check component's state after click (it should be changed).
  assert.strictEqual(
    $checkboxInput.prop('checked'),
    true,
    'Component\'s inner checkbox <input> isn\'t checked after click (without \'change\' action handler)');

  // Check binded value state after click (it should be unchanged, because 'change' action handler is not defined).
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
    assert.strictEqual(e.originalEvent.target.id, this.$('input')[0].id);
    this.set('flag', e.newValue);
  });

  this.render(hbs`{{flexberry-ddau-checkbox value=flag change=(action \"onFlagChange\")}}`);

  // Retrieve component & it's inner <input>.
  let $component = this.$().children();
  let $checkboxInput = $component.children('input');

  // Check component's initial state.
  assert.strictEqual($checkboxInput.prop('checked'), false, 'Component\'s inner checkbox <input> isn\'t checked before click');  

  // Make component checked.
  $component.click();
  assert.strictEqual(
    $checkboxInput.prop('checked'),
    true,
    'Component\'s inner checkbox <input> is checked after click (with \'change\' action handler)');
  assert.strictEqual(
    this.get('flag'),
    true,
    'Component\'s binded value changed (with \'change\' action handler)');

  // Make component unchecked.
  $component.click();
  assert.strictEqual(
    $checkboxInput.prop('checked'),
    false,
    'Component\'s inner checkbox <input> is unchecked after second click (with \'change\' action handler)');
  assert.strictEqual(
    this.get('flag'),
    false,
    'Component\' binded value changed after second click (with \'change\' action handler)');
});

test('Component changes binded value (with \'check\' & \'uncheck\' action handlers)', function(assert) {
  assert.expect(7);

  this.set('flag', false);
  
  // Bind component's 'check' & 'uncheck' action handlers.
  this.set('actions.onFlagCheck', e => {
    assert.strictEqual(e.newValue, true, 'Property \'newValue\' is always true inside \'check\' action handler');

    this.set('flag', true);
  });
  this.set('actions.onFlagUncheck', e => {
    assert.strictEqual(e.newValue, false, 'Property \'newValue\' is always false inside \'uncheck\' action handler');

    this.set('flag', false);
  });

  this.render(hbs`{{flexberry-ddau-checkbox value=flag check=(action \"onFlagCheck\") uncheck=(action \"onFlagUncheck\")}}`);

  // Retrieve component & it's inner <input>.
  let $component = this.$().children();
  let $checkboxInput = $component.children('input');

  // Check component's initial state.
  assert.strictEqual($checkboxInput.prop('checked'), false, 'Component\'s inner checkbox <input> isn\'t checked before click');  

  // Make component checked.
  $component.click();
  assert.strictEqual(
    $checkboxInput.prop('checked'),
    true,
    'Component\'s inner checkbox <input> is checked after click (with \'check\' action handler)');
  assert.strictEqual(
    this.get('flag'),
    true,
    'Component\'s  binded value changed (with \'check\' action handler)');

  // Make component unchecked.
  $component.click();
  assert.strictEqual(
    $checkboxInput.prop('checked'),
    false,
    'Component\'s inner checkbox <input> is unchecked after second click (with \'uncheck\' action handler)');
  assert.strictEqual(
    this.get('flag'),
    false,
    'Component changed binded value after second click (with \'uncheck\' action handler)');
});

test('Component changes binded value (with \'change\' action handler from special mixin)', function(assert) {
  assert.expect(5);

  this.set('flag', false);

  // Bind component's 'change' action handler from specialized mixin.
  this.set('actions.onCheckboxChange', FlexberryDdauCheckboxActionsHandlerMixin.mixins[0].properties.actions.onCheckboxChange);

  this.render(hbs`{{flexberry-ddau-checkbox value=flag change=(action \"onCheckboxChange\" \"flag\")}}`);

  // Retrieve component & it's inner <input>.
  let $component = this.$().children();
  let $checkboxInput = $component.children('input');

  // Check component's initial state.
  assert.strictEqual($checkboxInput.prop('checked'), false, 'Component\'s inner checkbox <input> isn\'t checked before click');  

  // Make component checked.
  $component.click();
  assert.strictEqual(
    $checkboxInput.prop('checked'),
    true,
    'Component\'s inner checkbox <input> is checked after click (with \'change\' action handler from special mixin)');
  assert.strictEqual(
    this.get('flag'),
    true,
    'Component changed binded value (with \'change\' action handler from special mixin)');

  // Make component unchecked.
  $component.click();
  assert.strictEqual(
    $checkboxInput.prop('checked'),
    false,
    'Component\'s inner checkbox <input> is unchecked after second click (with \'change\' action handler from special mixin)');
  assert.strictEqual(
    this.get('flag'),
    false,
    'Component changed binded value after second click (with \'change\' action handler from special mixin)');
});

test('Component works properly in readonly mode', function(assert) {
  assert.expect(15);

 let latestEventObjects = {
    change: null,
    check: null,
    uncheck: null,
  };

  // Bind component's action handlers.
  this.set('actions.onFlagChange', e => {
    latestEventObjects.change = e;
  });
  this.set('actions.onFlagCheck', e => {
    latestEventObjects.check = e;
  });
  this.set('actions.onFlagUncheck', e => {
    latestEventObjects.uncheck = e;
  });

  // Render component in readonly mode.
  this.set('flag', false);
  this.set('readonly', true);
  this.render(hbs`{{flexberry-ddau-checkbox value=flag readonly=readonly change=(action \"onFlagChange\") check=(action \"onFlagCheck\") uncheck=(action \"onFlagUncheck\")}}`);

  // Retrieve component & it's inner <input>.
  let $component = this.$().children();
  let $checkboxInput = $component.children('input');

  // Check component's initial state.
  assert.strictEqual($checkboxInput.prop('checked'), false, 'Component\'s inner checkbox <input> isn\'t checked before click');

  // Imitate click on component.
  $component.click();

  // Check after click state.
  assert.strictEqual($checkboxInput.prop('checked'), false, 'Component\'s inner checkbox <input> isn\'t checked after click');
  assert.strictEqual(latestEventObjects.change, null, 'Component doesn\'t send \'change\' action in readonly mode');
  assert.strictEqual(latestEventObjects.check, null, 'Component doesn\'t send \'check\' action in readonly mode');
  assert.strictEqual(latestEventObjects.uncheck, null, 'Component doesn\'t send \'uncheck\' action in readonly mode');

  // Disable readonly mode.
  this.set('readonly', false);

  // Imitate click on component.
  $component.click();

  // Check after click state.
  assert.strictEqual($checkboxInput.prop('checked'), true, 'Component\'s inner checkbox <input> is checked after click');
  assert.notStrictEqual(latestEventObjects.change, null, 'Component send \'change\' action after readonly mode disabling');
  assert.notStrictEqual(latestEventObjects.check, null, 'Component send \'check\' action after readonly mode disabling');

  latestEventObjects.change = null;
  latestEventObjects.check = null;
  latestEventObjects.uncheck = null;

  // Imitate click on component.
  $component.click();

  // Check after click state.
  assert.strictEqual($checkboxInput.prop('checked'), false, 'Component\'s inner checkbox <input> is unchecked after click');
  assert.notStrictEqual(latestEventObjects.change, null, 'Component send \'change\' action after readonly mode disabling');
  assert.notStrictEqual(latestEventObjects.uncheck, null, 'Component send \'uncheck\' action after readonly mode disabling');

  latestEventObjects.change = null;
  latestEventObjects.check = null;
  latestEventObjects.uncheck = null;

  // Enable readonly mode again.
  this.set('readonly', true);

  // Imitate click on component.
  $component.click();

  // Check after click state.
  assert.strictEqual($checkboxInput.prop('checked'), false, 'Component\'s inner checkbox <input> isn\'t checked after click');
  assert.strictEqual(latestEventObjects.change, null, 'Component doesn\'t send \'change\' action in readonly mode');
  assert.strictEqual(latestEventObjects.check, null, 'Component doesn\'t send \'check\' action in readonly mode');
  assert.strictEqual(latestEventObjects.uncheck, null, 'Component doesn\'t send \'uncheck\' action in readonly mode');
});
