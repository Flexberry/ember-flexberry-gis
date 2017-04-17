import Ember from 'ember';
import layout from '../templates/components/flexberry-tab-bar';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-tab-bar').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-tab-bar').
  @property {String} flexberryClassNames.tab Component's inner <input type="checkbox"> CSS-class name ('flexberry-tab-bar-tab').
  @property {String} flexberryClassNames.tabIcon Component's inner <label> CSS-class name ('flexberry-tab-bar-tab-icon').
  @readonly
  @static

  @for FlexberryTabBarComponent
*/
const flexberryClassNamesPrefix = 'flexberry-tab-bar';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix,
  tab: flexberryClassNamesPrefix + '-tab',
  tabIcon: flexberryClassNamesPrefix + '-tab-icon'
};

/**
 * FlexberryTabBarComponent
 * Component to display semantic ui tabs
 * @extends Ember.Component
 */
export default Ember.Component.extend({
  classNames: ['flexberry-tab-bar'],

  layout,

  /**
    Reference to component's CSS-classes names.
    Must be also a component's instance property to be available from component's .hbs template.
  */
  flexberryClassNames,

  /**
   * Contains items to display in tab bar
   * @property items
   * @type {Array}
   * @default []
   * @example items: [{selector: 'tab1', caption: 'Tab one', active: true }, {selector: 'tab2', caption: 'Tab two'}]
   * @desc the first item with active=true will be set as active, others ignored
   */
  items: [],

  /**
   * @property tabs
   * @type {Array}
   */
  tabs: Ember.computed('items', 'items.[]', function () {
    let active = false;
    let items = this.get('items') || [];
    let result = [];

    items.forEach((item) => {
      let itemIsActive = Ember.get(item, 'active');

      if (itemIsActive && itemIsActive === true) {
        if (active) {
          Ember.set(item, 'active', false);
        } else {
          let itemClass = Ember.get(item, 'class') || '';

          active = true;
          itemClass += itemClass + 'active';
          Ember.set(item, 'class', itemClass);
        }
      }

      result.push(item);
    });

    return result;
  }),

  /**
   * Contains name of previous data-tab
   * @property prevTab
   */
  prevTab: undefined,

  actions: {
    onTabClick(currentTab) {
      let prevTab = this.get('prevTab');
      let changed = false;

      if (prevTab !== currentTab) {
        this.set('prevTab', currentTab);
        changed = true;
      }

      // if data-tab stays the same
      if (!changed) {
        this.set('prevTab', undefined);
        this.$('.tabular.menu .item.active').removeClass('active');
        this.sendAction('onTabClick');
      }

      //if data-tab changed but there was not prev one
      else if (changed && !prevTab) {
        this.sendAction('onTabClick');
      }
    }
  },
  /**
      Initializes component's DOM-related properties.
    */
  didInsertElement() {
    this._super(...arguments);

    // initialize semantic ui tabs
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

    // destroy semantic ui tabs
    this.$('.tabular.menu .item').tab('destroy');
  }
});
