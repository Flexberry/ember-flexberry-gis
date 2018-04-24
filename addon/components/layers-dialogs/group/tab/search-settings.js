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

  _contextSearchFieldsSelectorLabel: 'contextSearchLabel',

  _searchFieldsSelectorLabel: 'searchLabel',

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
  },

  /**
    Current can be searched checkbox value.

    @property _canBeSearchedCheckBox
    @type Boolean
    @default undefined
    @private
  */
  _canBeSearchedCheckBox: undefined,

  /**
    Current can be context-searched checkbox value.

    @property _canBeContextSearchedCheckBox
    @type Boolean
    @default undefined
    @private
  */
  _canBeContextSearchedCheckBox: undefined,

  /**
    Modifies `value` when `_canBeSearchedCheckBox` or `_canBeContextSearchedCheckBox` changes.

    @method _checkboxDidChange
  */
  _checkboxDidChange: Ember.observer('_canBeSearchedCheckBox', '_canBeContextSearchedCheckBox', 'value', function() {
    let val = this.get('value');
    val.canBeSearched = this.get('_canBeSearchedCheckBox');
    val.canBeContextSearched = this.get('_canBeContextSearchedCheckBox');
    this.set('value', val);
  }),

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    let value = this.get('value');
    this.set('_canBeSearchedCheckBox', value.canBeSearched);
    this.set('_canBeContextSearchedCheckBox', value.canBeContextSearched);
  },

  actions: {
    test(e) {
      console.log(e);
    }
  }
});
