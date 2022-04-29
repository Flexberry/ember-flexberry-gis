import { A } from '@ember/array';
import { getOwner } from '@ember/application';
import { isNone, isBlank } from '@ember/utils';
import { computed, get, set } from '@ember/object';
import Component from '@ember/component';
import layout from '../../../templates/components/layers-dialogs/tabs/display-settings';

/**
  Component for display settings tab in layer settings.

  @class FlexberryDisplaySettingsComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Component.extend({
  /**
    Reference to component's template.
  */
  layout,

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
  leafletObjectMethod: undefined,

  /**
    Indicates when leaflet's layer object is loading.

    @property _leafletObjectIsLoading
    @type Boolean
    @default false
    @private
  */
  _leafletObjectIsLoading: false,

  /**
    Current object with display settings.

    @property value
    @type Object
    @default Object
  */
  value: undefined,

  /**
    "Date format" textbox label locale key.

    @property dateFormatLabel
    @type String
    @default 'components.layers-dialogs.settings.group.tab.display-settings.date-format-label'
  */
  dateFormatLabel: 'components.layers-dialogs.settings.group.tab.display-settings.date-format-label',

  /**
    "Date format" placeholder locale key.

    @property dateFormatPlaceholder
    @type String
    @default 'components.layers-dialogs.settings.group.tab.display-settings.date-format-ph'
  */
  dateFormatPlaceholder: 'components.layers-dialogs.settings.group.tab.display-settings.date-format-ph',

  /**
    DateFormat textbox css class.

    @property dateFormatClass
    @type String
    @default 'fluid input'
  */
  dateFormatClass: 'fluid input',

  /**
    "displayPropertyIsCallback" checkbox label locale key.

    @property displayPropertyIsCallbackLabel
    @type String
    @default 'components.layers-dialogs.settings.group.tab.display-settings.display-property-is-callback-label'
  */
  displayPropertyIsCallbackLabel: 'components.layers-dialogs.settings.group.tab.display-settings.display-property-is-callback-label',

  /**
    displayPropertyIsCallback textbox css class.

    @property displayPropertyIsCallbackClass
    @type String
    @default 'toggle'
  */
  displayPropertyIsCallbackClass: 'toggle',

  /**
    "displayProperty" textbox label locale key.

    @property displayPropertyLabel
    @type String
    @default 'components.layers-dialogs.settings.group.tab.display-settings.display-property-label'
  */
  displayPropertyLabel: 'components.layers-dialogs.settings.group.tab.display-settings.display-property-label',

  /**
    "Display property" placeholder locale key.

    @property displayPropertyPlaceholder
    @type String
    @default 'displayPropertyPlaceholder'
  */
  displayPropertyPlaceholder: 'components.layers-dialogs.settings.group.tab.display-settings.display-property-ph',

  /**
    displayProperty textbox css class.

    @property displayPropertyClass
    @type String
    @default 'fluid input'
  */
  displayPropertyClass: 'fluid input',

  /**
    excludedProperties multiple-select label locale key.

    @property excludedPropertiesLabel
    @type String
    @default 'components.layers-dialogs.settings.group.tab.display-settings.excluded-properties-label'
  */
  excludedPropertiesLabel: 'components.layers-dialogs.settings.group.tab.display-settings.excluded-properties-label',

  /**
    `Apply` button label locale key.

    @property applyButtonLabel
    @type String
    @default 'components.layers-dialogs.settings.group.tab.display-settings.apply-button-label'
  */
  applyButtonLabel: 'components.layers-dialogs.settings.group.tab.display-settings.apply-button-label',

  /**
    "English translation" textbox label locale key.

    @property enTranslationLabel
    @type String
    @default 'components.layers-dialogs.settings.group.tab.display-settings.en-translation-label'
  */
  translationLabel: 'components.layers-dialogs.settings.group.tab.display-settings.translation-label',

  /**
    "Ru string" placeholder locale key.

    @property ruTranslationPlaceholder
    @type String
    @default 'components.layers-dialogs.settings.group.tab.display-settings.en-translation-ph'
  */
  translationPlaceholder: 'components.layers-dialogs.settings.group.tab.display-settings.translation-ph',

  /**
    Properties list header locale key.

    @property propertiesListHeading
    @type String
    @default 'components.layers-dialogs.settings.group.tab.display-settings.properties-list-heading'
  */
  propertiesListHeading: 'components.layers-dialogs.settings.group.tab.display-settings.properties-list-heading',

  /**
    Show property column header.

    @property showPropertyHeading
    @type String
    @default 'components.layers-dialogs.settings.group.tab.display-settings.show-prop-heading''
  */
  showPropertyHeading: 'components.layers-dialogs.settings.group.tab.display-settings.show-prop-heading',

  /**
    Locales list header locale key.

    @property localesListHeading
    @type String
    @default 'components.layers-dialogs.settings.group.tab.display-settings.locales-list-heading'
  */
  localesListHeading: 'components.layers-dialogs.settings.group.tab.display-settings.locales-list-heading',

  /**
    Locale key of a message shown when there are no properties in a layer.

    @property noItemsAvaliableLabel
    @type String
    @default 'components.layers-dialogs.settings.group.tab.display-settings.no-items-label'
  */
  noItemsAvaliableLabel: 'components.layers-dialogs.settings.group.tab.display-settings.no-items-label',

  /**
    All items to select from in multiple-select.
    All layer's properties.

    @property allProperties
    @type Object
    @default undefined
  */
  allProperties: undefined,

  /**
    All app's locales.

    @property allLocales
    @type Object
    @default undefined
  */
  allLocales: undefined,

  /**
    Flag showing if there is more than one locale available.

    @property isMoreThanOne
    @type Boolean
    @default false
  */
  isMoreThanOne: false,
  /**
    Selected locale (from locales lists).

    @property _selectedLocale
    @type String
    @default undefined
  */
  _selectedLocale: undefined,

  /**
    Contains properties with flag showing whether they are showable.

    @property _showableItems
    @type Object
    @default {}
  */
  _showableItems: Object.freeze({}),

  /**
    Returns default locale.

    @property _defaultLocale
    @type String
    @default 'en'
  */
  _defaultLocale: computed(function () {
    return this.get('i18n.locale');
  }),

  /**
    Allows/disallows manually add items to multiple-select.

    @property excludedPropertiesAllowAdditions
    @type Boolean
    @default true
  */
  excludedPropertiesAllowAdditions: true,

  /**
    Gets all layers's properties, makes some initializations.

    @method getAllProperties
  */
  getAllProperties() {
    const _this = this;
    const leafletObject = _this.get('_leafletObject');
    if (isNone(leafletObject)) {
      const type = _this.get('layerType');
      const leafletObjectMethod = _this.get('leafletObjectMethod');
      if (!(isBlank(leafletObjectMethod) || isBlank(type))) {
        _this.set('_leafletObjectIsLoading', true);
        leafletObjectMethod().then((leaflet) => {
          _this.set('_leafletObject', leaflet);
          _this.set('_leafletObjectIsLoading', false);
          const layerClass = getOwner(_this).knownForType('layer', type);
          if (!isBlank(layerClass)) {
            const allProperties = A(layerClass.getLayerProperties(leaflet));
            _this.set('allProperties', allProperties);

            const value = _this.get('value');

            const _showableItems = {};
            allProperties.forEach(function (item) {
              _showableItems[item] = true;
            });

            _showableItems.forEach((item) => {
              if (value.featuresPropertiesSettings.excludedProperties.indexOf(item) !== -1) {
                _showableItems[item] = false;
              }
            });

            this.set('_showableItems', _showableItems);
          }
        }).catch(() => {
          _this.set('_leafletObjectIsLoading', false);
        });
      }
    }
  },

  /**
    Hook, working after element was inserted.

    @method didInsertElement
  */
  didInsertElement() {
    this.getAllProperties();

    const localesObj = {};
    const allLocales = get(this, 'i18n.locales');

    for (let i = 0; i < allLocales.length; i++) {
      const key = allLocales[i];
      localesObj[key] = true;
    }

    const allLocalesObj = Object.keys(localesObj);
    this.set('allLocales', allLocalesObj);

    if (allLocalesObj.length > 1) {
      for (let i = 0; i < allLocales.length; i++) {
        if (allLocales[i] !== this.get('_defaultLocale')) {
          set(this, '_selectedLocale', allLocales[i]);
          break;
        }
      }

      this.set('isMoreThanOne', true);
    } else {
      set(this, '_selectedLocale', allLocales[0]);
      this.set('isMoreThanOne', false);
    }
  },

  actions: {
    /**
      Handles callback-checkbox change.
      @method actions.isCallbackCheckboxDidChange
    */
    isCallbackCheckboxDidChange() {
      this.set('value.featuresPropertiesSettings.displayProperty', '');
    },

    /**
      Handles show checkbox change
      @method actions.showCheckboxDidChange
      @param {Object} e Click event object.
    */
    showCheckboxDidChange(property, e) {
      const _showableItems = this.get('_showableItems');
      set(this, `_showableItems.${property}`, e.checked);

      const excluded = [];
      _showableItems.forEach((prop) => {
        if (!_showableItems[prop]) {
          excluded.push(prop);
        }
      });

      this.set('value.featuresPropertiesSettings.excludedProperties', excluded);
    },
  },
});
