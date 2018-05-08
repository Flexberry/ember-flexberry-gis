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
  @property _layerType
  @type Object
  @default undefined
  @private
  */
  _layerType: undefined,

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

    @property _leafletObjectMethod
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
    Locks/unlocks interface when there is or there is no selection.

    @property isNotSelected
    @type Boolean
    @default true
    @readonly
  */
  isNotSelected: Ember.computed('_selectedLocale', '_selectedProperty', function() {
    return Ember.isEmpty(this.get('_selectedLocale')) || Ember.isEmpty(this.get('_selectedProperty'));
  }),

  /**
    Sets translation string for current locale-property combination.

    @method onKeyAndLocaleSelected
  */
  onKeyAndLocaleSelected: Ember.observer('_selectedLocale', '_selectedProperty', function() {
    let _selectedLocale = this.get('_selectedLocale');
    let _selectedProperty = this.get('_selectedProperty');
    if (Ember.isBlank(_selectedLocale) || Ember.isBlank(_selectedProperty)) {
      this.set('_translationString', '');
      return;
    }

    this.set(
      '_translationString',
      this.get(`value.featuresPropertiesSettings.localizedProperties.${this.get('_selectedLocale')}.${this.get('_selectedProperty')}`)
    );
  }),
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

  /**
    Localization setting of a selected property

    @property _selectedProperty
    @type Object
    @default Object
  */
  _selectedProperty: undefined,

  _translationString: '',

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
      let type = _this.get('_layerType');
      let leafletObjectMethod = _this.get('_leafletObjectMethod');
      if (!(Ember.isBlank(leafletObjectMethod) || Ember.isBlank(type))) {
        _this.set('_leafletObjectIsLoading', true);
        leafletObjectMethod().then(leafletObject => {
          _this.set('_leafletObject', leafletObject);
          _this.set('_leafletObjectIsLoading', false);
          let layerClass = Ember.getOwner(_this).knownForType('layer', type);
          if (!Ember.isBlank(layerClass)) {
            _this.set('allProperties', Ember.A(layerClass.getLayerProperties(leafletObject)));
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
    Ember.set(this, '_selectedProperty', '');
    Ember.set(this, '_selectedLocale', '');
    Ember.set(this, '_translationString', '');

    let obj = {};
    let arr = Ember.get(this, 'i18n.locales');
    for (var i = 0; i < arr.length; i++) {
      var key = arr[i];
      obj[key] = true;
    }

    this.set('allLocales', Object.keys(obj));
  },

  actions: {
    /**
      Action, triggered by selection of a property.

      @method actions.onPropertySelected
    */
    onPropertySelected(e) {
      Ember.set(this, '_selectedProperty', e);
    },

    /**
      Action, triggered by selection of a locale.

      @method actions.onLocaleSelected
    */
    onLocaleSelected(e) {
      this.set('_selectedLocale', e);
    },

    /**
      Action, triggered by `apply` button click.

      @method actions.onButtonClick
    */
    onButtonClick() {
      let _selectedProperty = this.get('_selectedProperty');
      let _selectedLocale = this.get('_selectedLocale');
      let _translationString = this.get('_translationString');
      Ember.set(this, `value.featuresPropertiesSettings.localizedProperties.${_selectedLocale}.${_selectedProperty}`, _translationString);
    }
  }
});
