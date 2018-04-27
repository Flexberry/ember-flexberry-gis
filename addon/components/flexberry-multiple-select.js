import Ember from 'ember';
import layout from '../templates/components/flexberry-multiple-select';

/**
  Flexberry multiple select component.
  Usage example:

  templates/my-form.hbs

  ```handlebars
  {{flexberry-multiple-select
    items=fields
    selectedItems=value.searchFields
    heading=('t' _searchFieldsSelectorLabel)
    allowAdditions=true
  }}
  ```
  @class FlexberryMultipleSelectComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    Array with dropdown items.

    @property items
    @type Object
    @default Ember.A()
  */
  items: Ember.A(),

  /**
    Array with selected dropdown items.

    @property selectedItems
    @type Object
    @default Ember.A()
  */
  selectedItems: Ember.A(),

  /**
    Dropdown title.

    @property title
    @type String
    @default undefined
  */
  title: undefined,

  /**
    Flag, allows or forbids manual addition.

    @property allowAdditions
    @type Boolean
    @default false
  */
  allowAdditions: false,

  selectorName: 'fb-selector',

  _usedItems: Ember.computed('items', 'selectedItems', function() {
    let items = this.get('items');
    let selectedItems = this.get('selectedItems');
    if (Ember.isEmpty(items) || Ember.isEmpty(selectedItems)) {
      return items;
    }

    return items.removeObjects(selectedItems);
  }),
  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

  },

  /**
    Hook, working after element insertion
  */
  didInsertElement() {
    let selName = this.get('selectorName');
    let allowAdditions = this.get('allowAdditions');

    this.$('.' + selName)
    .dropdown({
      allowAdditions: allowAdditions,
      onChange: (e) => {
        let itemArray = e.split(',');
        if (e === '') {
          itemArray = null;
        }

        Ember.run(() => {
          this.set('selectedItems', itemArray);
          this.sendAction('onChange', itemArray);
        });
      }
    });
  }
});
