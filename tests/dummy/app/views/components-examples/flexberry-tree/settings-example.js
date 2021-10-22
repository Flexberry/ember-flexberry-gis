import Component from '@ember/component';

export default Component.extend({
  /**
    Initializes page's DOM-related properties.
  */
  didInsertElement() {
    this._super(...arguments);

    // Initialize Semantic UI tabs.
    this.$('.tabular.menu .item').tab();
  },
});
