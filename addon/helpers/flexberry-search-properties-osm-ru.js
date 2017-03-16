import Ember from 'ember';

export function flexberrySearchPropertiesOsmRu([url]) {
  return {
    apiSettings: {
      url: url
    },
    fields: {
      results: 'matches',
      title: 'display_name'
    },
    minCharacters: 3,
    onResults(results) {
      if (!results.matches) {
        results.matches = [];
      }
    }
  };
}

export default Ember.Helper.helper(flexberrySearchPropertiesOsmRu);
