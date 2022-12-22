import Ember from 'ember';
export default Ember.Component.extend({
  isOpen: false,

  selectIcon: Ember.computed('value', function () {
    let button = this.get('items').find(b => {
      return b.layerMode === this.get('value');
    });
    return button ? button.iconClass : '';
  }),

  actions: {
    dropdownOpen() {
      this.set('isOpen', !this.get('isOpen'));
    },
    click(str) {
      this.set('isOpen', false);
      this.clickButton(str);
    },
  },

  didInsertElement() {
    this._super(...arguments);
    Ember.$('body').click((e) => {
      if (this.$() && !this.$().find(e.target).length) {
        this.set('isOpen', false);
      }
    });
  },
});
