import Ember from 'ember';
import layout from '../templates/components/flexberry-wfs-filter';

export default Ember.Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    String value of filter.

    @property filterStringValue
    @type String
    @default undefined
  */
  filterStringValue: undefined,

  /**
    Flag indicates whether filterStringValue is correct or not.

    @property _filterIsCorrect
    @type Boolean
    @default true
    @private
  */
  _filterIsCorrect: true,

  filter: undefined,

  /**
    Class for operator buttons.

    @property operatorButtonClass
    @type String
    @default 'filter-operator-button'
  */
  operatorButtonClass: 'filter-operator-button',

  /**
    Classes for Example and All buttons.

    @property fieldValuesLoadButtonClass
    @type String
  */
  fieldValuesLoadButtonClass: Ember.computed('_selectedField', function() {
    let field = this.get('_selectedField');

    return Ember.isBlank(field) ? 'filter-operator-button disabled' : 'filter-operator-button';
  }),

  _leafletObject: null,

  /**
    Array contains Fields in current leaflet object.

    @property fields
    @type Array
    @default []
  */
  fields: [],

  /**
    Array contains shown values of current field.

    @property values
    @type Array
    @default []
  */
  values: [],

  currentStatus: 'OK',

  statusClass: 'ui green label',

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

  init() {
    this._super(...arguments);

    let _leafletObject = this.get('_leafletObject') || {};
    let fields = [];

    for (let layer in _leafletObject._layers) {
      let properties = Ember.get(_leafletObject._layers[layer], 'feature.properties') || {};
      for (let property in properties) {
        if (fields.indexOf(property) < 0) {
          fields.push(property);
        }
      }
    }

    this.set('fields', fields);
  },

  parseFilter() {
    let a = this.get('filterStringValue');
    a = a.replace(/[\n\r]/g, '');
    this.set('_filterIsCorrect', true);
    if (Ember.isBlank(a)) {
      return null;
    }

    let filter =  this._parseExpression(a);

    return this.get('_filterIsCorrect') ? filter : null;
  },

  /**
    Creates filter object from string.

    @method _parseExpression
    @param {String} expression String to parse into filter
    @return {L.Filter} Returns new created filter
    @private
  */
  _parseExpression(expression) {
    const logicalExp = /^\s*([Aa][Nn][Dd]|[Oo][Rr]|[Nn][Oo][Tt])\s*\((.+)\)\s*$/;
    const conditionExp = /^\s*('[^']+'|"[^"]+")\s*(=|<|>|<=|>=|!=|[Ii]?[Ll][Ii][Kk][Ee])\s*('[^']+'|"[^"]+")\s*$/;

    let exp = expression.trim();
    if (exp[0] === '(' && exp.slice(-1) === ')') {
      exp = exp.slice(1, exp.length - 1);
    }

    let conditionExpResult = conditionExp.exec(exp);
    if (conditionExpResult) {
      conditionExpResult[1] = conditionExpResult[1].slice(1, conditionExpResult[1].length - 1);
      conditionExpResult[3] = conditionExpResult[3].slice(1, conditionExpResult[3].length - 1);
      let properties = Ember.A([conditionExpResult[1], conditionExpResult[3]]);
      switch (conditionExpResult[2].toLowerCase()) {
        case '=':
          return new L.Filter.EQ(...properties, true);
        case '!=':
          return new L.Filter.NotEQ(...properties, true);
        case '>':
          return new L.Filter.GT(...properties, true);
        case '<':
          return new L.Filter.LT(...properties, true);
        case '>=':
          return new L.Filter.GEQ(...properties, true);
        case '<=':
          return new L.Filter.LEQ(...properties, true);
        case 'like':
          return new L.Filter.Like(...properties, { matchCase: true });
        case 'ilike':
          return new L.Filter.Like(...properties, { matchCase: false });
      }
    }

    let logicalExpResult = logicalExp.exec(exp);
    if (logicalExpResult) {
      let properties = Ember.A();
      let propertiesString = logicalExpResult[2];
      let index = 0;
      while (propertiesString.length > 0) {
        index = propertiesString.indexOf(',', index);
        if (index >= 0) {
          let condition = propertiesString.slice(0, index).trim();
          if (condition[0] === '(' && condition.slice(-1) === ')') {
            condition = condition.slice(1, condition.length - 1);
          }

          if (logicalExp.test(condition) || conditionExp.test(condition)) {
            properties.addObject(this._parseExpression(condition));
            propertiesString = propertiesString.slice(index + 1);
            index = 0;
          }
        } else {
          propertiesString = propertiesString.trim();
          if (propertiesString[0] === '(' && propertiesString.slice(-1) === ')') {
            propertiesString = propertiesString.slice(1, propertiesString.length - 1);
            index--;
          }

          if (logicalExp.test(propertiesString) || conditionExp.test(propertiesString)) {
            properties.addObject(this._parseExpression(propertiesString));
          } else {
            this.set('_filterIsCorrect', false);
          }

          propertiesString = '';
        }

        index++;
      }

      if (this.get('_filterIsCorrect') && properties.length > 0) {
        switch (logicalExpResult[1].toLowerCase()) {
          case 'and':
            return new L.Filter.And(...properties);
          case 'or':
            return new L.Filter.Or(...properties);
          case 'not':
            return new L.Filter.Not(...properties);
        }
      }
    }

    this.set('_filterIsCorrect', false);
    return null;
  },

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

    applyFilter() {
      let filter = this.parseFilter();
      if (Ember.isNone(filter)) {
        Ember.set(this, 'value', filter);
      } else {
        if (Ember.get(this, '_filterIsCorrect')) {
          Ember.set(this, 'value', undefined);
        }
      }
    },

    checkFilter() {
      this.parseFilter();
      if (Ember.get(this, '_filterIsCorrect')) {
        Ember.set(this, 'currentStatus', 'OK');
        Ember.set(this, 'statusClass', 'ui green label');
      } else {
        Ember.set(this, 'currentStatus', 'Error');
        Ember.set(this, 'statusClass', 'ui red label');
      }
    },

    clearFilter() {
      Ember.set(this, 'filter', undefined);
      Ember.set(this, 'filterStringValue', undefined);
    },

    /**
      This action is called when an item in Fields list is pressed.

      @method actions.fieldClick
    */
    fieldClick(text) {
      this.set('values', []);
      this.set('_selectedValue', undefined);
      this.set('_selectedField', text);
    },

    /**
      This action is called when an item in Values list is pressed.

      @method actions.valueClick
    */
    valueClick(text) {
      this.set('_selectedValue', text);
    },

    /**
      This action is called when "Examples" button is pressed.

      @method actions.showExample
    */
    showExample() {
      let _leafletObject = this.get('_leafletObject');
      let values = [];
      let selectedField = this.get('_selectedField');

      for (let layer in _leafletObject._layers) {
        let property = _leafletObject._layers[layer].feature.properties[selectedField];
        if (values.indexOf(property) < 0) {
          values.push(property);
        }

        if (values.length === 10) {
          break;
        }
      }

      values.sort();
      if (Ember.isNone(values[values.length - 1])) {
        values.pop();
        values.unshift('NULL');
      }

      this.set('values', values);
    },

    /**
      This action is called when "Show all" button is pressed.

      @method actions.ShowAll
    */
    showAll() {
      let _leafletObject = this.get('_leafletObject');
      let values = [];
      let selectedField = this.get('_selectedField');

      for (let layer in _leafletObject._layers) {
        let property = _leafletObject._layers[layer].feature.properties[selectedField];
        if (values.indexOf(property) < 0) {
          values.push(property);
        }
      }

      values.sort();
      if (Ember.isNone(values[values.length - 1])) {
        values.pop();
        values.unshift('NULL');
      }

      this.set('values', values);
    },

    /**
      Paste expression with condition into fiter string.

      @method pasteConditionExpression
      @param {String} condition
    */
    pasteConditionExpression(condition) {
      let operandBefore = this.get('_selectedField') || '';
      let operandAfter = this.get('_selectedValue') || '';

      let expressionString = `'${operandBefore}' ${condition} '${operandAfter}'`;
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
      if (value === 'NULL') {
        this._pasteIntoFilterString(value);
        return;
      }

      let newString = `'${value || ''}'`;
      this._pasteIntoFilterString(newString);
    },
  } });
