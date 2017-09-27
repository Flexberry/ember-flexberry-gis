import Ember from 'ember';
import layout from '../templates/components/flexberry-dropdown-input';

export default Ember.Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    Array of dropdown items.

    @property items
    @type Array
    @default Ember.A()
  */
  items: Ember.A(),

  /**
    Dropdown value.

    @property value
    @type String
    @default undefined
  */
  value: undefined,

  /**
    Dropdown input value.

    @property inputValue
    @type String
    @default undefined
  */
  inputValue: undefined,

  /**
    Dropdown input placeholder.

    @property inputPlaceholder
    @type String
    @default ''
  */
  inputPlaceholder: '',

  /**
    Dropdown input title.

    @property inputTitle
    @type String
    @default ''
  */
  inputTitle: '',

  actions: {
    /**
      Handles dropdown input keyDown action.

      @method actions.inputKeyDown
    */
    inputKeyDown(e) {
      if (e.which === 13) {
        let inputValue = this.get('inputValue') || 0;
        this.$('.flexberry-dropdown').dropdown('hide');
        this.$('.flexberry-dropdown').dropdown('set value', inputValue);
        this.$('.flexberry-dropdown .text.default').removeClass('default');
        this.$('.flexberry-dropdown').dropdown('set text', inputValue);
        this.set('value', inputValue);
        this.set('inputValue', undefined);
      }

      return this.onKeyDown.call(this, e);
    }
  }
});
