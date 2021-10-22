import { helper as buildHelper } from '@ember/component/helper';

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

export default buildHelper(flexberrySearchPropertiesOsmRu);
