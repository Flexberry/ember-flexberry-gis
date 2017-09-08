import Ember from 'ember';

export default Ember.Component.extend({
  /**
    Initializes page's DOM-related properties.
  */
  didInsertElement() {
    this._super(...arguments);

    // Initialize Semantic UI tabs.
    this.$('.tabular.menu .item').tab();
  }
});
