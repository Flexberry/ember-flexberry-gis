import Ember from 'ember';
import layout from '../templates/components/select-with-checkbox';

export default Ember.Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    Array with all dropdown items.

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
    Classname.

    @property selectorName
    @type String
    @default 'fb-selector'
  */
  selectorName: 'fb-selector',

  /**
    Flag indicates whether is array consists of objects or not.

    @property isObject
    @type Bool
    @default 'false'
  */
  isObject: false,

  /**
    Flag indicates whether dropdown expanded or not.

    @property expanded
    @type Boolean
    @default false
  */
  expanded: false,

  /**
    Count selected items.

    @property countChoose
    @type Number
    @default 0
  */
  countChoose: 0,

  /**
    Height div.

    @property heightDiv
    @type Number
    @default 0
  */
  heightDiv: null,

  /**
    Hook, working after element insertion
  */
  didInsertElement() {
    let maxHeight = this.$('.fb-selector .checkboxes').css('max-height');
    let itemsCount = this.get('items').length;
    if (itemsCount > 8) {
      this.set('heightDiv', maxHeight);
    } else {
      let chHeight = this.$('.fb-selector .checkboxes label').height();
      this.set('heightDiv', chHeight * itemsCount);
    }
  },

  actions: {
    /**
      Handles click on a dropdown button.

      @method actions.showCheckboxes
    */
    showCheckboxes() {
      let checkboxes = this.$('.fb-selector .checkboxes');
      if (!this.get('expanded')) {
        checkboxes.css('display', 'block');
        this.set('expanded', true);
      } else {
        checkboxes.css('display','none');
        this.set('expanded', false);
      }
    },

    /**
      Handles click on a clear button.

      @method actions.clear
    */
    clear() {
      this.set('selectedItems', Ember.A());
      let checkboxes = this.$('.fb-selector .checkboxes input:checkbox');
      checkboxes.each((i, item) => {
        let checkbox = this.$(item);
        if (checkbox[0].checked) {
          checkbox[0].checked = false;
        }
      });
      this.set('countChoose', 0);
    },

    /**
      Handles click on a checkbox.

      @method actions.changeCheckbox
    */
    changeCheckbox() {
      let itemArray = this.get('selectedItems');
      let checkboxes = this.$('.fb-selector .checkboxes input:checkbox');
      checkboxes.each((i, item) => {
        let checkbox = this.$(item);
        let val = checkbox.val();
        let elem = itemArray.indexOf(val);
        if (checkbox[0].checked && elem === -1) {
          itemArray.push(val);
          this.set('selectedItems', itemArray);
        } else if (!checkbox[0].checked  && elem !== -1) {
          itemArray.splice(elem, 1);
          this.set('selectedItems', itemArray);
        }
      });
      if (this.get('countChoose') !== itemArray.length) {
        this.set('countChoose', itemArray.length);
      }
    },

    /**
      Handles changes search field.

      @method actions.autoComplete
    */
    autoComplete(e) {
      let elem = this.$('.fb-selector .search');
      let search = elem.val().toLowerCase();
      if (!Ember.isEmpty(search)) {
        this.$('.fb-selector .checkboxes label.hidden').each((i, item) => {
          this.$(item).removeClass('hidden');
        });
        let count = this.get('items').length;
        let pHidden = this.$('.fb-selector .checkboxes p');
        if (!pHidden.hasClass('hidden')) {
          pHidden.addClass('hidden');
        }

        this.$('.fb-selector .checkboxes label').each((i, item) => {
            let label = this.$(item);
            let val = label.text().toLowerCase();
            if (val.indexOf(search) === -1) {
              label.addClass('hidden');
              count--;
            }
        });
        if (count === 0) {
          pHidden.removeClass('hidden');
        }

        let visibleCount = count === 0 ? 1 : count;
        if (visibleCount <= 8) {
          let chHeight = this.$('.fb-selector .checkboxes label').height();
          this.set('heightDiv', chHeight * visibleCount);
        }

        let checkboxes = this.$('.fb-selector .checkboxes');
        if (!this.get('expanded')) {
          checkboxes.css('display', 'block');
          this.set('expanded', true);
        }
      } else {
        this.$('.fb-selector .checkboxes label.hidden').each((i, item) => {
          this.$(item).removeClass('hidden');
        });
      }
    }
  }
});
