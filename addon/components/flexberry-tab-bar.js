import Ember from 'ember';
import layout from '../templates/components/flexberry-tab-bar';

/**
 * FlexberryTabBarComponent
 * Component to display semantic ui tabs
 * @extends Ember.Component
 */
export default Ember.Component.extend({
  classNames: ['flexberry-tab-bar'],

  layout,

  /**
   * Contains items to display in tab bar 
   * @property items
   * @type {Array}
   * @default []
   * @example items: [{selector: 'tab1', caption: 'Tab one', active: true }, {selector: 'tab2', caption: 'Tab two'}]
   * @desc the first item with active=true will be set as active
   * @desc if no active items provided, the first one will be active by default
   */
  items: [],

  tabs: Ember.computed('items', 'items.[]', function () {
    let active = false;
    let items = this.get('items') || [];
    let result = [];
    items.forEach((item) => {
      if (Ember.get(item, 'active') && Ember.get(item, 'active') === true) {
        if (active) {
          Ember.set(item, 'active', false);
        } else {
          Ember.set(item, 'class', 'active');
          active = true;
        }
      }
      result.push(item);
    });

    if (!active && result.length > 0) {
      Ember.set(result[0], 'active', true);
    }

    return result;
  }),

  /**
   * @property prevTab
   */
  prevTab: undefined,

  target: undefined,

  uicontext: undefined,

  actions: {
    onTabClick(currentTab) {
      let prevTab = this.get('prevTab');
      let changed = false;
      if (prevTab !== currentTab) {
        this.set('prevTab', currentTab);
        changed = true;
      }
      if (changed) {
        this.sendAction('onTabClick', this.get('target'), this.get('uicontext'));
      }
    }
  },
  /**
      Initializes component's DOM-related properties.
    */
  didInsertElement() {
    this._super(...arguments);

    this.$('.tabular.menu .item').tab();
  },

  /**
    Handles DOM-related component's properties after each render.
  */
  didRender() {
    this._super(...arguments);
    // Initialize possibly added new tabs.
    this.$('.tabular.menu .item').tab();
  },

  /**
    Deinitializes component's DOM-related properties.
  */
  willDestroyElement() {
    this._super(...arguments);
    this.$('.tabular.menu .item').tab('destroy');
  }
});
