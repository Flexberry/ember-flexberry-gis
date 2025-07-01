/**
  @module ember-flexberry-3.6.1
  (Частичное обновление версии) Данный компонент был обновлен из за не работоспосбности в текущей версии ember-flexberry -3.4.0
*/
import Ember from 'ember';
import layout from '../templates/components/flexberry-dropdown-search';
import {
  translationMacro as t
} from 'ember-i18n';

/**
  Dropdown component based on Semantic UI Dropdown module.

  @example
    templates/my-form.hbs
    ```handlebars
    {{flexberry-dropdown
      items=items
      value=value
      settings=(hash
        duration=500
        direction="upward"
      )
    }}
    ```

  @class FlexberryDropdownComponent
  @extends FlexberryBaseComponent
*/
export default Ember.Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  placeholderSearch: '',

  searchValue: '',

  noResults:  t('components.flexberry-edit-layer-feature.dropdown.message'),

  message: { noResults: '' },

  /**
    @private
    @property _initialized
    @type Boolean
    @default false
  */
  _initialized: false,

  /**
    @private
    @property _items
    @type Object
  */
  _items: undefined,

  /**
    @private
    @property _value
    @type String
  */
  _value: undefined,

  /**
    See [EmberJS API](https://emberjs.com/api/).

    @property classNameBindings
  */
  classNameBindings: ['readonly:disabled'],

  /**
    See [EmberJS API](https://emberjs.com/api/).

    @property classNames
  */
  classNames: ['ui', 'dropdown', 'flexberry-dropdown', 'selection'],

  /**
    See [Semantic UI API](https://semantic-ui.com/modules/dropdown.html#/settings).

    @property settings
    @type Object
  */
  settings: undefined,

  /**
    Path to component's settings in application configuration (JSON from ./config/environment.js).

    @property appConfigSettingsPath
    @type String
    @default APP.components.flexberryDropdown
  */
  appConfigSettingsPath: 'APP.components.flexberryDropdown',

  /**
    Placeholder or default text (will be displayed if there is no selected item).

    @property placeholder
    @type String
    @default t('components.flexberry-dropdown.placeholder')
  */
  placeholder: '',

  /**
    Flag indicates whether to display captions for dropdown items.
    To make it work, "items" property should have following structure:
    {
      item1: 'caption for item1',
      item2: 'caption for item2'
    }
    For example, user will see 'caption for item1', but on choose, item1 is set to 'value' property.

    @property displayCaptions
    @type Boolean
    @default false
  */
  displayCaptions: false,

  /**
    Flag indicates whether to make checks on selected value or not.
    It has `false` value when component loads data by request by semantic processes.
    It is not recommended to change its value out of addon.

    @property needChecksOnValue
    @type Boolean
    @default true
  */
  needChecksOnValue: true,

  /**
    Flag indicates whether to show input with search class.

    @property isSearch
    @type Boolean
    @default false
  */
  isSearch: false,

  correctHeight: 42,

  /**
    Available items.

    @property items
    @type Object
  */
  items: Ember.computed('_items', {
    get() {
      return this.get('_items');
    },
    set(key, value) {
      let items = value;
      if (Ember.isArray(value)) {
        items = {};
        for (let i = 0; i < value.length; i++) {
          items[i] = value[i];
        }
      }

      return this.set('_items', items);
    },
  }),

  /**
    Selected item.

    Edit:
    тут поменял логику выдачи value, потому, что для некоторых случаев у него в _value хранится не индекс, а текстовое значение
    добавил volatile чтобы бралось не из hash

    @property value
    @type Any
  */
  value: Ember.computed('items', '_value', 'displayCaptions', {
    get() {
      const valueKey = this.get('_value');

      if (this.get('displayCaptions')) {
        return valueKey;
      }

      return valueKey ? (Ember.isNone(this.get(`items.${valueKey}`)) ? valueKey : this.get(`items.${valueKey}`)) : undefined;
    },
    set(k, value, oldValue) {
      const items = this.get('items');
      if (items && value && value !== oldValue) {
        let valueKey;
        for (let key in items) {
          if (items.hasOwnProperty(key) && (items[key] === value || key === value.toString())) {
            valueKey = key;
          }
        }

        if (valueKey) {
          return this.get(`items.${this.set('_value', valueKey)}`);
        } else if (this.get('needChecksOnValue')) {
          throw new Error(`Wrong value of flexberry-dropdown 'value' property: '${value}'.`);
        }
      }

      if (!value && this.get('_initialized')) {
        this.$().dropdown('clear');
      }

      if (this.get('displayCaptions') || Ember.isNone(this.get('_value'))) {
        this.set('_value', value);
      }

      return value;
    },
  }),

  /**
    Selected item or placeholder.

    @property text
    @type Any
    @readOnly
  */
  text: Ember.computed('_value', 'value', 'items', 'placeholder', 'displayCaptions', function () {
    if (this.get('displayCaptions')) {
      const items = this.get('items');
      const value = this.get('_value');

      return !Ember.isNone(value) ? items[value] : this.get('placeholder');
    }

    return this.get('value') || this.get('placeholder');
  }).readOnly(),

  /**
    Number of displayed dropdown's items

    @property numberOfDisplayedItems
    @type Number
    @default 6
  */
  numberOfDisplayedItems: 6,

  /**
    @method onShowHide
   */
  onShowHide() {
    //this.showFixedElement({ top: -2, left: 1 });
  },

  /**
    See [EmberJS API](https://emberjs.com/api/).

    @method didInsertElement
  */
  didInsertElement() {
    this._super(...arguments);
    let noRes = this.get('noResults').toString();

    let settings = Ember.$.extend({
      action: 'select',
      message: { noResults:  noRes },
      fullTextSearch: true,
      match: 'text',
      onChange: (newValue) => {
        Ember.run.schedule('afterRender', () => {
          const currentValue = this.get('_value');
          if (currentValue !== newValue) {
            const oldValue = this.get('displayCaptions') ? currentValue : this.get('value');

            this.set('_value', newValue);
            this.set('searchValue', null);
            const onChange = this.get('onChange');
            if (typeof onChange === 'function') {
              onChange(this.get('value'), oldValue, newValue);
            }
          }
        });
      },
      onShow: () => {
        // Высота выпадающего меню
        let numberOfDisplayedItems = this.get('numberOfDisplayedItems');
        if (numberOfDisplayedItems) {
          let items = this.get('items');
          let correctHeight = this.get('correctHeight') / 16;
          let itemsLength = Object.keys(items).length;
          let menuHeight = numberOfDisplayedItems > itemsLength ? itemsLength * correctHeight : numberOfDisplayedItems * correctHeight;
          this.$('.menu').css('height', menuHeight + 'rem');
        }

        Ember.run.next(() => {
          this.onShowHide();
        });
      },
      onHide: () => {
        Ember.run.next(() => {
          this.onShowHide();
        });
      },
    }, this.get('settings'));

    this.$().dropdown(settings);
    this.set('_initialized', true);
  },

  /**
    See [EmberJS API](https://emberjs.com/api/).

    @method willDestroyElement
  */
  willDestroyElement() {
    this._super(...arguments);

    if (this.get('_initialized')) {
      this.set('_initialized', false);
      this.$().dropdown('destroy');
    }
  },

  actions: {
    onClear(event) {
      //click action is defined as a DOM event to cancel the semantic dropdown action
      if (event) {
        event.stopPropagation();
      }

      this.set('searchValue', null);
      Ember.run.next(() => {
        let input = this.$('input.search');
        if (input) {
          let evt = new Event('input', { bubbles: true });
          input[0].dispatchEvent(evt);
        }
      });
      this.sendAction('clearAll');
    },

    onChangeSearchValue(event) {
      this.set('searchValue', event.target.value);
    },
  }
});
