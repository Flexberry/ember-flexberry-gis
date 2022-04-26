import { getOwner } from '@ember/application';
import { isNone, isBlank } from '@ember/utils';
import { A } from '@ember/array';
import Component from '@ember/component';
import layout from '../../../templates/components/layers-dialogs/tabs/search-settings';

/**
  Component for identification settings tab in layer settings.

  @class FlexberryIdentificationSettingsComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Component.extend({

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

  /**
    Label for context-searched fields selector.

    @property _contextSearchFieldsSelectorLabel
    @type String
    @default 'components.layers-dialogs.settings.group.tab.search-settings.context-search-fields-selector'
  */
  _contextSearchFieldsSelectorLabel: 'components.layers-dialogs.settings.group.tab.search-settings.context-search-fields-selector',

  /**
    Label for searched fields selector.

    @property _searchFieldsSelectorLabel
    @type String
    @default 'components.layers-dialogs.settings.group.tab.search-settings.search-fields-selector'
  */
  _searchFieldsSelectorLabel: 'components.layers-dialogs.settings.group.tab.search-settings.search-fields-selector',

  /**
  Leaflet's layer type.
  @property layerType
  @type Object
  @default undefined
  @private
*/
  layerType: undefined,

  /**
    Leaflet's layer object.

    @property _leafletObject
    @type Object
    @default undefined
    @private
  */
  _leafletObject: undefined,

  /**
    Method to create leaflet's layer object.

    @property leafletObjectMethod
    @type Function
    @default undefined
    @private
  */
  _leafletObjectMethod: undefined,

  /**
    Indicates when leaflet's layer object is loading.

    @property _leafletObjectIsLoading
    @type Boolean
    @default false
    @private
  */
  _leafletObjectIsLoading: false,

  /**
    Array containing Fields in current leaflet object.

    @property fields
    @type Array
    @default Ember.A()
  */
  fields: A(),

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
  value: Object.freeze({
    canBeSearched: undefined,
    canBeContextSearched: undefined,
    contextSearchFields: undefined,
    searchFields: undefined,
  }),

  /**
    Initializes page's DOM-related properties.
  */
  didInsertElement() {
    const _this = this;
    const leafletObject = _this.get('_leafletObject');
    if (isNone(leafletObject)) {
      const type = _this.get('layerType');
      const leafletObjectMethod = _this.get('_leafletObjectMethod');
      if (!(isBlank(leafletObjectMethod) || isBlank(type))) {
        _this.set('_leafletObjectIsLoading', true);
        leafletObjectMethod().then(() => {
          _this.set('_leafletObject', leafletObject);
          _this.set('_leafletObjectIsLoading', false);
          const layerClass = getOwner(_this).knownForType('layer', type);
          if (!isBlank(layerClass)) {
            _this.set('fields', A(layerClass.getLayerProperties(leafletObject)));
          }
        }).catch(() => {
          _this.set('_leafletObjectIsLoading', false);
        });
      }
    }
  },
});
