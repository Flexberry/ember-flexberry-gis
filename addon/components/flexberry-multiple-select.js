import Ember from 'ember';
import layout from '../templates/components/flexberry-multiple-select';

export default Ember.Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    Array with dropdown items.

    @property items
    @type Object
    @default []
  */
  items: [],

  /**
    Array with selected dropdown items.

    @property selectedItems
    @type Object
    @default []
  */
  selectedItems: [],

  /**
    Dropdown title.

    @property heading
    @type String
    @default undefined
  */
  heading: undefined,

  /**
    Flag, allows or forbids manual addition.

    @property allowAdditions
    @type Boolean
    @default false
  */
  allowAdditions: false,

  selectorName: 'fb-selector',

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

        this.set('selectedItems', itemArray);
        this.sendAction('onChange', itemArray);
      }
    });
  }
});
