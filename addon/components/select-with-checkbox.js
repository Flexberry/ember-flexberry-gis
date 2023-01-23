import Ember from 'ember';
import layout from '../templates/components/select-with-checkbox';
import FlexberryDropdown from 'ember-flexberry/components/flexberry-dropdown';
import { translationMacro as t } from 'ember-i18n';

const {
  observer,
  A,
  on
} = Ember;

export default FlexberryDropdown.extend({
  /**
    Reference to component's template.
  */
  layout,

  selectAllText: t('components.flexberry-layers-intersections-panel.selectAllText'),

  /**
    Search for occurrences in the entire text (SemanticUI settings).
  */
  fullTextSearch: true,

  /**
    When using search selection specifies how to match values.
    <both> matches against text and value
    <value> matches against value only
    <text> matches against text only
    @type String
    @default 'text'
  */
  match: 'text',

  /**
    flag indicates to add "selection" subclass to "multi-dropdown"
    that forces element selection on opening, scroll goes down to first menu element.
    @type Boolean
    @default true
  */
  selection: true,

  isAllSelected: false,

  /**
    Minimum number of characters to search

    @property minCharacters
    @type Number
    @default 0
  */
  minCharacters:0,

  isClearAllVisible: true,

  isSearchVisible: true,

  isSelectAllVisible: true,

  noResults:  t('components.flexberry-layers-intersections-panel.notResult'),

  message: { noResults:  '' },

  /**
   * Storage for the items state.
   * @example
   * ```javascript
   * [
   *   {
   *     key: '2e46cce0-b9fa-4b34-b417-4bd600a89c5d',
   *     value: 'Подтверждена',
   *     isVisible: false
   *   },
   *   ...
   * ]
   * ```
   */
  state: null,

  /**
    Flag indicates whether is array consists of objects or not.

    @property isObject
    @type Bool
    @default 'false'
  */
  isObject: false,

  /**
    Array with selected dropdown items.

    @property selectedItems
    @type Object
    @default Ember.A()
  */
  selectedItems: Ember.A(),

  /**
    Count selected items.

    @property countChoose
    @type Number
    @default 0
  */
  countChoose: 0,

  /**
    Classname.

    @property selectorName
    @type String
    @default 'fb-selector'
  */
  class: 'fb-selector',

  init() {
    this._super(...arguments);
    this.set('state', new A());
    let noRes = this.get('noResults').toString();
    this.set('message', { noResults:  noRes });
  },

  stateObserver: observer('state.@each.isVisible', function () {
    let filteredState = this.get('state').filterBy('isVisible');
    const value = filteredState.map((item)=>item.key);
    this.set('selectedItems', value);
    this.set('countChoose', value.length);
  }),

  itemsObserver: on('init', observer('items', function () {
    const state = Object.entries(this.get('items'))
      .filter(([key, value]) => !Ember.isNone(value))
      .map(([i, val]) => {
        let value = val;
        let key = i;
        if (this.get('isObject')) {
          value = Ember.get(val, 'name');
          key = val.id;
        }

        return Ember.Object.create({ key, value, isVisible: false });
      });

    this.get('state').addObjects(state);
  })),

  actions: {
    selectAll() {
      const state = this.get('state');

      if (this.get('isAllSelected')) {
        this.send('clearAll');
      } else {
        state.setEach('isVisible', true);
      }

      this.toggleProperty('isAllSelected');
    },

    clearAll(event) {
      //click action is defined as a DOM event to cancel the semantic dropdown action
      event.stopPropagation();
      this.get('state').setEach('isVisible', false);
      this.sendAction('clearAll');
    },

  }
});
