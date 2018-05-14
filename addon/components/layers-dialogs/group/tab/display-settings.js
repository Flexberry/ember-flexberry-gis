import Ember from 'ember';
import layout from '../../../../templates/components/layers-dialogs/group/tab/display-settings';

/**
  Component for display settings tab in layer settings.

  @class FlexberryDisplaySettingsComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend({
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
    Selected locale (from locales lists).

    @property _selectedLocale
    @type String
    @default undefined
  */
  _selectedLocale: undefined,

  _showableItems: {},

  _defaultLocale: Ember.computed(function() {
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
    Gets all layers's properties

    @method getAllProperties
  */
  getAllProperties() {
    let _this = this;
    let leafletObject = _this.get('_leafletObject');
    if (Ember.isNone(leafletObject)) {
      let type = _this.get('layerType');
      let leafletObjectMethod = _this.get('leafletObjectMethod');
      if (!(Ember.isBlank(leafletObjectMethod) || Ember.isBlank(type))) {
        _this.set('_leafletObjectIsLoading', true);
        leafletObjectMethod().then(leafletObject => {
          _this.set('_leafletObject', leafletObject);
          _this.set('_leafletObjectIsLoading', false);
          let layerClass = Ember.getOwner(_this).knownForType('layer', type);
          if (!Ember.isBlank(layerClass)) {
            let allProperties = Ember.A(layerClass.getLayerProperties(leafletObject));
            _this.set('allProperties', allProperties);

            let _showableItems = _this.get('_showableItems');
            for (var prop in allProperties) {
              _showableItems[prop] = true;
            }

            for (var item in _showableItems) {
              if (value.featuresPropertiesSettings.excludedProperties.indexOf(item) !== -1) {
                _showableItems[item] = false;
              }
            }

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
    let value = this.get('value');

    let obj = {};
    let arr = Ember.get(this, 'i18n.locales');
    Ember.set(this, '_selectedLocale', arr[0]);

    for (var i = 0; i < arr.length; i++) {
      var key = arr[i];
      obj[key] = true;
    }

    this.set('allLocales', Object.keys(obj));
  },

  actions: {

    isCallbackCheckboxDidChange() {
      this.set('value.featuresPropertiesSettings.displayProperty', '');
    },

    showCheckboxDidChange() {
      let _showableItems = this.get('_showableItems');
      let excluded = [];
      for (var prop in _showableItems) {
        if (!_showableItems[prop]) {
          excluded.push(prop);
        }
      }

      this.set('value.featuresPropertiesSettings.excludedProperties', excluded);
    }
  }
});
