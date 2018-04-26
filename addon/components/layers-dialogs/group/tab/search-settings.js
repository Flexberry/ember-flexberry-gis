import Ember from 'ember';
import layout from '../../../../templates/components/layers-dialogs/group/tab/search-settings';

/**
  Component for identification settings tab in layer settings.

  @class FlexberryIdentificationSettingsComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend({

  /**
    Reference to component's template.
  */
  layout,

  /**
    "Can be searched" checkbox label locale key.

    @property _canBeSearchedCheckBoxLabel
    @type String
    @default 'components.layers-dialogs.settings.group.tab.search-settings.can-be-searched-label'
  */
  _canBeSearchedCheckBoxLabel: 'components.layers-dialogs.settings.group.tab.search-settings.can-be-searched-label',

  /**
    "Can be context-searched" checkbox label locale key.

    @property _canBeContextSearchedCheckBoxLabel
    @type String
    @default 'components.layers-dialogs.settings.group.tab.search-settings.can-be-context-searched-label'
  */
  _canBeContextSearchedCheckBoxLabel: 'components.layers-dialogs.settings.group.tab.search-settings.can-be-context-searched-label',

  _contextSearchFieldsSelectorLabel: 'components.layers-dialogs.settings.group.tab.search-settings.context-search-fields-selector',

  _searchFieldsSelectorLabel: 'components.layers-dialogs.settings.group.tab.search-settings.search-fields-selector',

  /**
    Style class for checkbox component.

    @property checkboxClass
    @type String
    @default 'toggle'
  */
  checkboxClass: 'toggle',

  /**
    Current object with search settings.

    @property value
    @type Object
    @default Object
  */
  value: {
    'canBeSearched': undefined,
    'canBeContextSearched': undefined,
    'contextSearchFields': undefined,
    'searchFields': undefined
  }
});
