import Ember from 'ember';
import layout from '../../../templates/components/layers-dialogs/tabs/labels-settings';

export default Ember.Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    "signMapObjectsLabel" checkbox label locale key.

    @property signMapObjectsLabel
    @type String
    @default 'components.layers-dialogs.settings.group.tab.labels-settings.sign-map-objects-label'
  */
  _signMapObjectsLabel: 'components.layers-dialogs.settings.group.tab.labels-settings.sign-map-objects-label',

  /**
    displayPropertyIsCallback textbox css class.

    @property displayPropertyIsCallbackClass
    @type String
    @default 'toggle'
  */
  _signMapObjectsClass: 'toggle',

  /**
    Indicates when leaflet's layer object is loading.

    @property _leafletObjectIsLoading
    @type Boolean
    @default false
    @private
  */
  _leafletObjectIsLoading: false,

  /**
    Leaflet's layer object.

    @property _leafletObject
    @type Object
    @default undefined
    @private
  */
  _leafletObject: undefined,

  /**
    Fields caption

    @property _fieldsCaption
    @type String
    @default 'components.layers-dialogs.settings.group.tab.labels-settings.field-caption'
  */
  _fieldsCaption: 'components.layers-dialogs.settings.group.tab.labels-settings.field-caption',

  /**
    Placeholder when fields isn't loaded

    @property _noFields
    @type String
    @default 'components.layers-dialogs.settings.group.tab.labels-settings.no-fields'
  */
  _noFields: 'components.layers-dialogs.settings.group.tab.labels-settings.no-fields',

  /**
    Available layer's properties.

    @property _availableLayerProperties
    @type Object
    @default undefined
  */
  _availableLayerProperties: undefined,

  /**
    Contains selected field.

    @property _selectedField
    @type String
    @default undefined
    @private
  */
  _selectedField: undefined,

  /**
    Label

    @property _label
    @type String
    @default 'components.layers-dialogs.settings.group.tab.labels-settings.field-caption'
  */
  _label: 'components.layers-dialogs.settings.group.tab.labels-settings.label',

  /**
    Class for operator buttons.

    @property operatorButtonClass
    @type String
    @default 'filter-operator-button'
  */
  _operatorButtonClass: 'filter-operator-button',

  /**
    Class for operator buttons.

    @property _fontCaption
    @type String
    @default 'components.layers-dialogs.settings.group.tab.labels-settings.font-caption
  */
  _fontCaption: 'components.layers-dialogs.settings.group.tab.labels-settings.font-caption',

  /**
    Available font families.

    @property _availableFontFamilies
    @type String[]
    @default null
    @private
  */
  _availableFontFamilies: null,

  /**
    Available font sizes.

    @property _availableFontSizes
    @type String[]
    @default null
    @private
  */
  _availableFontSizes: null,

  /**
    Hash containing location label.

    @property _locationCaption
    @type String
    @default 'components.layers-dialogs.settings.group.tab.labels-settings.location-caption'
    @private
  */
  _locationCaption: 'components.layers-dialogs.settings.group.tab.labels-settings.location-caption',

  /**
    Hash containing location label.

    @property _scaleRangeCaption
    @type String
    @default null
    @private
  */
  _scaleRangeCaption: 'components.layers-dialogs.settings.group.tab.labels-settings.scale-range-caption',

  /**
    Containing available location of the line layer.

    @property _itemsLineLocation
    @type Object[]
    @default null
    @private
  */
  _itemsLineLocation: null,

  /**
    Containing available location of the line layer.

    @property _availableLineLocation
    @type String[]
    @default null
    @private
  */
  _availableLineLocation: Ember.computed('i18n.locale', function() {
    let result = [];
    let i18n = this.get('i18n');
    let over = i18n.t(`components.layers-dialogs.settings.group.tab.labels-settings.availableLineLocation.over`).toString();
    let along = i18n.t(`components.layers-dialogs.settings.group.tab.labels-settings.availableLineLocation.along`).toString();
    let under = i18n.t(`components.layers-dialogs.settings.group.tab.labels-settings.availableLineLocation.under`).toString();
    result = Ember.A([over, along, under]);
    let itemLineLocation = {
      over: over,
      along: along,
      under: under
    };
    this.set('_itemsLineLocation', itemLineLocation);
    return result;
  }),

  /**
    Location of the line layer.

    @property _lineLocationSelect
    @type String
    @default null
    @private
  */
  _lineLocationSelect: Ember.computed('value.location.lineLocationSelect', '_itemsLineLocation', function() {
    let location = this.get('value.location.lineLocationSelect');
    let items = this.get('_itemsLineLocation');
    let result = items.over;
    let setting = 'over';
    if (!Ember.isNone(items)) {
      for (var key in items) {
        if (key === location) {
          result = items[key];
          setting = key;
          break;
        }
      }
    }

    if (Ember.isNone(location)) {
      this.set('value.location.lineLocationSelect', setting);
    }

    return result;
  }),

  /**
    Containing array of strings and feature properies.

    @property _arrLabelString
    @type Object[]
    @default null
    @private
  */
  _arrLabelString: null,

  _error: Ember.computed('_leafletObject', 'leafletMap', function() {
    let leafletObject = this.get('_leafletObject');
    let leafletMap = this.get('leafletMap');
    return leafletMap && !leafletMap.hasLayer(leafletObject);
  }),

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    // There is no easy way to programmatically get list of all available system fonts (in JavaScript),
    // so we can only list some web-safe fonts statically (see https://www.w3schools.com/csSref/css_websafe_fonts.asp).
    this.set('_availableFontFamilies', Ember.A([
      'Georgia',
      'Palatino Linotype',
      'Times New Roman',
      'Arial',
      'Arial Black',
      'Comic Sans MS',
      'Impact',
      'Lucida Sans Unicode',
      'Tahoma',
      'Trebuchet MS',
      'Verdana',
      'Courier New',
      'Lucida Console'
    ]));

    // Same situation with available font sizes.
    this.set('_availableFontSizes', Ember.A(['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '26', '28', '36', '48', '72']));
  },

  /**
    Gets all layers's properties, makes some initializations.

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

            let localizedProperties = this.get(`value.featuresPropertiesSettings.localizedProperties.${this.get('i18n.locale')}`) || {};
            let excludedProperties = this.get(`value.featuresPropertiesSettings.excludedProperties`);
            excludedProperties = Ember.isArray(excludedProperties) ? Ember.A(excludedProperties) : Ember.A();
            let availableLayerProperties = {};
            for (var propertyName of allProperties) {
              if (excludedProperties.contains(propertyName)) {
                continue;
              }

              let propertyCaption = Ember.get(localizedProperties, propertyName);
              availableLayerProperties[propertyName] = !Ember.isBlank(propertyCaption) ? propertyCaption : propertyName;
            }

            _this.set('_availableLayerProperties', availableLayerProperties);
          }
        }).catch(() => {
          _this.set('_leafletObjectIsLoading', false);
        });
      }
    }
  },

  /**
    Paste specified string into label string.

    @method _pasteIntoLabelString
    @param {String} pasteString String for pasting
    @param {Integer} caretShift Caret shift after string is pasted
    @private
  */
  _pasteIntoLabelString(pasteString, caretShift) {
    let textarea = this.$('.edit-label-textarea')[0];
    let labelString = this.get('value.labelSettingsString') || '';
    let newLabelString = '';
    let caretPosition = 0;
    if (labelString.length > 0) {
      newLabelString = `${labelString.slice(0, textarea.selectionStart)}${pasteString}${labelString.slice(textarea.selectionEnd)}`;
      caretPosition = textarea.selectionStart + pasteString.length;
    } else {
      newLabelString = pasteString;
      caretPosition = pasteString.length;
    }

    caretPosition = caretPosition + (caretShift || 0);
    this.set('value.labelSettingsString', newLabelString);
    Ember.run.scheduleOnce('afterRender', this, function () {
      textarea.focus();
      textarea.setSelectionRange(caretPosition, caretPosition);
    });
  },

  /**
    Hook, working after element was inserted.

    @method didInsertElement
  */
  didInsertElement() {
    this.getAllProperties();
    if (this.get('value.signMapObjects')) {
      this.$('textarea').removeAttr('readonly');
    } else {
      this.$('textarea').attr('readonly', true);
    }
  },

  actions: {
    /**
      Handles onLineLocationSelect - dropdown change.
      @method actions.onLineLocationSelect
    */
    onLineLocationSelect(location) {
      let items = this.get('_itemsLineLocation');
      let result = 'over';
      if (!Ember.isNone(items)) {
        for (var key in items) {
          if (items[key] === location) {
            result = key;
            break;
          }
        }
      }

      this.set('value.location.lineLocationSelect', result);
    },

    /**
      Handles signMapObjects-checkbox change.
      @method actions.signMapObjectsCheckboxDidChange
    */
    signMapObjectsCheckboxDidChange() {
      if (!this.get('value.signMapObjects')) {
        this.$('textarea').removeAttr('readonly');
      } else {
        this.$('textarea').attr('readonly', true);
      }
    },

    /**
      This action is called when an item in Fields list is pressed.

      @method actions.fieldClick
      @param {String} text Selected field
    */
    fieldClick(text) {
      if (this.get('_selectedField') !== text && this.get('value.signMapObjects')) {
        this.set('values', Ember.A());
        this.set('_selectedField', text);
      }
    },

    /**
      Paste selected field or field value into filter string.

      @method actions.pasteFieldValue
      @param {String} value
    */
    pasteFieldValue(value) {
      if (this.get('value.signMapObjects')) {
        if (Ember.isNone(value)) {
          this._pasteIntoLabelString('NULL');
          return;
        }

        let newString = `'${value}'`;
        this._pasteIntoLabelString(newString);
      }
    },

    /**
      This action is called when Clear button is pressed.

      @method actions.clearLabel
    */
    clearLabel() {
      this.set('value.labelSettingsString', undefined);
    },

    /**
      Handler for bold font button's 'click' action.

      @method actions.onBoldFontButtonClick
    */
    onBoldFontButtonClick() {
      let previousFontWeight = this.get('value.options.captionFontWeight');
      this.set('value.options.captionFontWeight', previousFontWeight !== 'bold' ? 'bold' : 'normal');
    },

    /**
      Handler for italic font button's 'click' action.

      @method actions.onItalicFontButtonClick
    */
    onItalicFontButtonClick() {
      let previousFontWeight = this.get('value.options.captionFontStyle');
      this.set('value.options.captionFontStyle', previousFontWeight !== 'italic' ? 'italic' : 'normal');
    },

    /**
      Handler for underline font button's 'click' action.

      @method actions.onUnderlineFontButtonClick
    */
    onUnderlineFontButtonClick() {
      let previousFontWeight = this.get('value.options.captionFontDecoration');
      this.set('value.options.captionFontDecoration', previousFontWeight !== 'underline' ? 'underline' : 'none');
    },

    /**
      Handler for left font button's 'click' action.

      @method actions.onLeftFontButtonClick
    */
    onLeftFontButtonClick() {
      let previousFontWeight = this.get('value.options.captionFontAlign');
      this.set('value.options.captionFontAlign', previousFontWeight !== 'left' ? 'left' : 'auto');
    },

    /**
      Handler for center font button's 'click' action.

      @method actions.onCenterFontButtonClick
    */
    onCenterFontButtonClick() {
      let previousFontWeight = this.get('value.options.captionFontAlign');
      this.set('value.options.captionFontAlign', previousFontWeight !== 'center' ? 'center' : 'auto');
    },

    /**
      Handler for right font button's 'click' action.

      @method actions.onRightFontButtonClick
    */
    onRightFontButtonClick() {
      let previousFontWeight = this.get('value.options.captionFontAlign');
      this.set('value.options.captionFontAlign', previousFontWeight !== 'right' ? 'right' : 'auto');
    },

    /**
      Handler for font colorpicker's 'change' action.

      @method actions.onCaptionFontColorChange
    */
    onCaptionFontColorChange(e) {
      this.set('value.options.captionFontColor', e.newValue);
    },

    /**
      Handler for font colorpicker's 'change' action.

      @method actions.onCaptionFontColorChange
    */
    onLocationPointButtonClick(num) {
      this.set('value.location.locationPoint', num);
    }
  }
});
