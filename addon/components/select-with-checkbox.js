import Ember from 'ember';
import layout from '../templates/components/select-with-checkbox';
import { translationMacro as t } from 'ember-i18n';

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

  expanded: false,

  chooseCaption: t('components.flexberry-layers-intersections-panel.select-with-checkmbox.chooseCaption'),

  countChoose: 0,

  autocompleteStr: '',

  actions: {
    showCheckboxes() {
      let checkboxes = this.$('.fb-selector .checkboxes');
      if (!this.get('expanded')) {
        checkboxes.css('display', "block");
        this.set('expanded', true);
      } else {
        checkboxes.css('display',"none");
        this.set('expanded', false);
      }
    },

    clear() {
      this.set('selectedItems', Ember.A());
      this.$('.fb-selector .checkboxes').each((l, list) => {
        let checkboxes = this.$(list).find("input:checkbox");
        checkboxes.each((i, item) => {
          let checkbox = this.$(item);
          if (checkbox[0].checked) {
            checkbox[0].checked = false;
          }
        });
      });
      this.set('countChoose', 0);
    },

    changeCheckbox(e) {
      let itemArray = this.get('selectedItems');
      this.$(e).each(() => {
        let checkboxes = this.$(e.currentTarget).find("input:checkbox");
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
      });
      if (this.get('countChoose') !== itemArray.length) {
        this.set('countChoose', itemArray.length);
      }
    },

    autoComplete(e) {
      let elem = this.$('.fb-selector .search')
      let search = elem.val().toLowerCase();
      if (!Ember.isEmpty(search)) {
        this.$('.fb-selector .checkboxes label.hidden').each((i, item) => {
          this.$(item).removeClass("hidden");
        });
        this.$('.fb-selector .checkboxes label').each((i, item) => {
          //let labels = this.$(list).find("label");
          //labels.each((i, item) => {
            let label = this.$(item);
            let val = label.text().toLowerCase();
            if (val.indexOf(search) === -1) {
              //if (!label.hasClass("hidden")) {
                label.addClass("hidden");
              //} else {
              //  label.removeClass("hidden");
              //}
            }
         //});
        });
      } else {
        this.$('.fb-selector .checkboxes label.hidden').each((i, item) => {
          this.$(item).removeClass("hidden");
        });
      }

      /*let autocomlpItems = Ember.A();
      let isObj = this.get('isObject');
      let items = this.get('items');
      if (!Ember.isEmpty(search)) {
        items.forEach(item => {
          let whereSearch = item[0];
          if (isObj) {
            whereSearch = Ember.get(item, 'name').toLowerCase();
          }

          if (whereSearch.indexOf(search) !== -1) {
            autocomlpItems.push(item);
          }
        });
        if (autocomlpItems.length > 0) {
          this.set('_usedItems', autocomlpItems);
          let checkboxes = this.$('.fb-selector .checkboxes');
          if (!this.get('expanded')) {
            checkboxes.css('display', "block");
            this.set('expanded', true);
          }
        }
      } else {
        this.set('_usedItems', items);
      }*/
    }
  }
});
