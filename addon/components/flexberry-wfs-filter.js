import Ember from 'ember';
import layout from '../templates/components/flexberry-wfs-filter';

export default Ember.Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    Current layer filter.

    @property filter
    @type Element
    @default undefined
  */
  filter: undefined,

  /**
    String value of filter.

    @property filterStringValue
    @type String
    @default undefined
  */
  filterStringValue: undefined,

  /**
    Class for operator buttons.

    @property operatorButtonClass
    @type String
    @default 'filter-operator-button'
  */
  operatorButtonClass: 'filter-operator-button',

  /**
    Array contains Fields in current leaflet object.

    @property fields
    @type Array
    @default Ember.A()
  */
  fields: Ember.A(),

  /**
    Array contains shown values of current field.

    @property values
    @type Array
    @default Ember.A()
  */
  values: Ember.A(),

  /**
    Values count for 'Example' button.

    @property valuesCount
    @type Integer
    @default 10
  */
  valuesCount: 10,

  /**
    Map object for flexberry-bounding box component.

    @property boundingBoxComponentMap
    @type Object
    @default null
  */
  boundingBoxComponentMap: null,

  /**
    Properties settings.

    @property featuresPropertiesSettings
    @type Object
    @default null
  */
  featuresPropertiesSettings: null,

  /**
    Method to create leaflet's layer object.

    @property _leafletObjectMethod
    @type Function
    @default null
    @private
  */
  _leafletObjectMethod: null,

  /**
    Leaflet's layer object.

    @property _leafletObject
    @type Object
    @default null
    @private
  */
  _leafletObject: null,

  /**
    Indicates when leaflet's layer object is loading.

    @property _leafletObjectIsLoading
    @type Boolean
    @default false
    @private
  */
  _leafletObjectIsLoading: false,

  /**
    Contains selected field.

    @property _selectedField
    @type String
    @default undefined
    @private
  */
  _selectedField: undefined,

  /**
    Contains selected value.

    @property _selectedValue
    @type String
    @default undefined
    @private
  */
  _selectedValue: undefined,

  /**
    Flag indicates whether filterStringValue is correct or not.

    @property _filterIsCorrect
    @type Boolean
    @default true
    @private
  */
  _filterIsCorrect: true,

  /**
    Bbox, selected with flexberry-boundingbox component.

    @property _currentSelectedBbox
    @type String
    @default undefined
    @private
  */
  _currentSelectedBbox: undefined,

  /**
    Minimal latitude value.

    @property _minLat
    @type number
    @default -90
    @private
  */
  _minLat: -90,

  /**
    Minimal longitude value.

    @property _minLng
    @type number
    @default -180
    @private
  */
  _minLng: -180,

  /**
    Maximal latitude value.

    @property _maxLat
    @type number
    @default 90
    @private
  */
  _maxLat: 90,

  /**
    Maximal longitude value.

    @property maxLng
    @type number
    @default 180
    @private
  */
  _maxLng: 180,

  /**
    Hash containing available layer's properties and their captions related to current locale an display settings.
    @property _availableLayerProperties
    @type Object
    @private
    @readOnly
  */
  _availableLayerProperties: Ember.computed('fields.[]', 'featuresPropertiesSettings', 'i18n.locale', function() {
    let availableLayerProperties = {};

    let layerProperties = this.get('fields');
    let localizedProperties = this.get(`featuresPropertiesSettings.localizedProperties.${this.get('i18n.locale')}`) || {};
    let excludedProperties = this.get(`featuresPropertiesSettings.excludedProperties`);
    excludedProperties = Ember.isArray(excludedProperties) ? Ember.A(excludedProperties) : Ember.A();

    for (let i = 0, len = layerProperties.length; i < len; i++) {
      let propertyName = layerProperties[i];
      if (excludedProperties.contains(propertyName)) {
        continue;
      }

      let propertyCaption = Ember.get(localizedProperties, propertyName);
      availableLayerProperties[propertyName] = !Ember.isBlank(propertyCaption) ? propertyCaption : propertyName;
    }

    return availableLayerProperties;
  }),

  init() {
    this._super(...arguments);

    this.set('filterStringValue', this.get('filter'));
  },

  /**
    Initializes page's DOM-related properties.
  */
  didInsertElement() {
    this._super(...arguments);

    // Initialize Semantic UI accordion.
    this.$('.ui.accordion.bbox-selector').accordion();

    let _this = this;
    this.$('.ui.accordion.attribute-selector').accordion({
      onOpening: () => {
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
                _this.set('fields', Ember.A(layerClass.getLayerProperties(leafletObject)));
              }
            }).catch(() => {
              _this.set('_leafletObjectIsLoading', false);
            });
          }
        }
      }
    });
  },

  /**
    Creates filter object from string.

    @method _parseFilter
    @return {Object} Returns new created gml filter
    @private
  */
  _parseFilter() {
    let filterStringValue = this.get('filterStringValue') || '';
    filterStringValue = filterStringValue.replace(/[\n\r]/g, '');
    let type = this.get('_layerType');
    this.set('_filterIsCorrect', false);
    let layerClass = Ember.getOwner(this).knownForType('layer', type);
    let filter;
    if (!Ember.isNone(layerClass)) {
      filter =  layerClass.parseFilter(filterStringValue, this.get('geometryField'));
    }

    if (!Ember.isNone(filter)) {
      this.set('_filterIsCorrect', true);
    }

    return filter;
  },

  /**
    Paste specified string into filter string.

    @method _pasteIntoFilterString
    @param {String} pasteString String for pasting
    @param {Integer} caretShift Caret shift after string is pasted
    @private
  */
  _pasteIntoFilterString(pasteString, caretShift) {
    let textarea = this.$('.edit-filter-textarea')[0];
    let filterString = this.get('filterStringValue') || '';
    let newFilterString = '';
    let caretPosition = 0;
    if (filterString.length > 0) {
      newFilterString = `${filterString.slice(0, textarea.selectionStart)}${pasteString}${filterString.slice(textarea.selectionEnd)}`;
      caretPosition = textarea.selectionStart + pasteString.length;
    } else {
      newFilterString = pasteString;
      caretPosition = pasteString.length;
    }

    caretPosition = caretPosition + (caretShift || 0);
    this.set('filterStringValue', newFilterString);
    Ember.run.scheduleOnce('afterRender', this, function () {
      textarea.focus();
      textarea.setSelectionRange(caretPosition, caretPosition);
    });
  },

  actions: {
    /**
      This action is called when Apply button is pressed.

      @method actions.applyFilter
    */
    applyFilter() {
      this._parseFilter();
      if (this.get('_filterIsCorrect')) {
        this.set('filter', this.get('filterStringValue'));
      }
    },

    /**
      This action is called when Check button is pressed.

      @method actions.checkFilter
    */
    checkFilter() {
      this._parseFilter();
    },

    /**
      This action is called when Clear button is pressed.

      @method actions.clearFilter
    */
    clearFilter() {
      this.set('_filterIsCorrect', true);
      this.set('filter', undefined);
      this.set('filterStringValue', undefined);
    },

    /**
      This action is called when an item in Fields list is pressed.

      @method actions.fieldClick
      @param {String} text Selected field
    */
    fieldClick(text) {
      if (this.get('_selectedField') !== text) {
        this.set('values', Ember.A());
        this.set('_selectedValue', undefined);
        this.set('_selectedField', text);
      }
    },

    /**
      This action is called when an item in Values list is pressed.

      @method actions.valueClick
      @param {String} text Selected value
    */
    valueClick(text) {
      this.set('_selectedValue', text);
    },

    /**
      This action is called when "Show all" or "Show example" button is pressed.

      @method actions.showFieldValues
      @param {Integer} count Values count to show
    */
    showFieldValues(count) {
      let type = this.get('_layerType');
      let leafletObject = this.get('_leafletObject');
      let selectedField = this.get('_selectedField');
      let layerClass = Ember.getOwner(this).knownForType('layer', type);
      let values = Ember.A();
      if (!Ember.isNone(layerClass)) {
        values = Ember.A(layerClass.getLayerPropertyValues(leafletObject, selectedField, count));
      }

      values.sort();
      if (values.indexOf(undefined) >= 0 || values.indexOf(null) >= 0) {
        values.removeObject(undefined);
        values.removeObject(null);
        values.unshiftObject(undefined);
      }

      this.set('values', values);
    },

    /**
      Paste expression with condition into fiter string.

      @method pasteConditionExpression
      @param {String} condition
    */
    pasteConditionExpression(condition) {
      let expressionString = ` ${condition} `;
      this._pasteIntoFilterString(expressionString);
    },

    /**
      Paste logical expression into fiter string.

      @method pasteLogicalExpression
      @param {String} condition
    */
    pasteLogicalExpression(condition) {
      let expressionString = `${condition} ()`;
      this._pasteIntoFilterString(expressionString, -1);
    },

    /**
      Paste bbox expression into fiter string.

      @method pasteBboxExpression
      @param {String} condition
    */
    pasteBboxExpression(condition) {
      let bboxString = this.get('_currentSelectedBbox');
      if (!Ember.isBlank(bboxString)) {
        let expressionString = `${condition} (${bboxString})`;
        this._pasteIntoFilterString(expressionString);
      }
    },

    /**
      Paste symbol into fiter string.

      @method pasteSymbol
      @param {String} symbol
    */
    pasteSymbol(symbol) {
      let expressionString = `${symbol}`;
      this._pasteIntoFilterString(expressionString);
    },

    /**
      Paste selected field or field value into filter string.

      @method actions.pasteFieldValue
      @param {String} value
    */
    pasteFieldValue(value) {
      if (Ember.isNone(value)) {
        this._pasteIntoFilterString('NULL');
        return;
      }

      let newString = `'${value}'`;
      this._pasteIntoFilterString(newString);
    },

    /**
      Handles bounding box changes.

      @method actions.onBoundingBoxChange
    */
    onBoundingBoxChange(e) {
      this.set('_currentSelectedBbox', JSON.stringify(e.bboxGeoJSON));
    },
  }
});
