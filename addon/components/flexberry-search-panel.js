import Ember from 'ember';
import layout from '../templates/components/flexberry-search-panel';

export default Ember.Component.extend({
  actions: {
    querySearch() {
      this.sendAction('querySearch', this.get('queryString'));
    },

    clearSearch() {
      this.set('queryString', null);
      this.sendAction('clearSearch');
    }
  },

  layout,

  queryString: null,

  searchPlaceholder: 'enter text to search',

  searchSettings: null
});
