import Ember from 'ember';
import layout from '../templates/components/flexberry-search-panel';

export default Ember.Component.extend({
  classNames: ['flexberry-search-panel'],

  actions: {
    querySearch(selected, feature) {
      this.sendAction('querySearch', this.get('queryString'), selected, feature);
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
