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
    Leaflet's wfs layer object.

    @property _leafletObject
    @type Object
    @default null
    @private
  */
  _leafletObject: null,

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

  init() {
    this._super(...arguments);

    this._updateFilterString();
    let fieldsDescription = this.get('_leafletObject.readFormat.featureType.fields') || {};
    let fields = Ember.A();

    for (let field in fieldsDescription) {
      fields.addObject(field);
    }

    this.set('fields', fields);
  },

  /**
    Updates filter string.

    @method _updateFilterString
    @private
  */
  _updateFilterString() {
    let filter = this.get('filter') || '';

    if (Ember.isBlank(filter)) {
      this.set('filterStringValue', '');
      return;
    }

    if (!(filter instanceof Element)) {
      filter = L.XmlUtil.parseXml(filter).firstChild;
    }

    this.set('filterStringValue', this._gmlFilterToString(filter));
  },

  /**
    Creates filter string from gml filter object.

    @method _gmlFilterToString
    @param {Object} filter Filter to parse into string
    @return {String} Returns filter string
    @private
  */
  _gmlFilterToString(filter) {
    switch (filter.nodeName) {
      case 'Or':
        if (filter.firstChild.nodeName === 'ogc:PropertyIsNotEqualTo' && filter.lastChild.nodeName === 'ogc:PropertyIsNull') {
          return `'${filter.firstChild.firstChild.textContent}' != '${filter.firstChild.childNodes[1].textContent}'`;
        }

        // JSHint requires break statement.
        /* falls through */
      case 'And':
        let expressionString = '';
        filter.childNodes.forEach((node) => {
          expressionString += this._gmlFilterToString(node) + ', ';
        }, this);
        expressionString = expressionString.slice(0, -2);
        return `${filter.nodeName.toUpperCase()} (${expressionString})`;
      case 'Not':
        if (filter.firstChild.nodeName === 'ogc:PropertyIsNull') {
          return `'${filter.firstChild.firstChild.textContent}' != NULL`;
        }

        return `NOT (${this._gmlFilterToString(filter.firstChild)})`;
      case 'ogc:PropertyIsNull':
        return `'${filter.firstChild.textContent}' = NULL`;
      case 'ogc:PropertyIsEqualTo':
        return `'${filter.firstChild.textContent}' = '${filter.childNodes[1].textContent}'`;
      case 'ogc:PropertyIsLessThan':
        return `'${filter.firstChild.textContent}' < '${filter.childNodes[1].textContent}'`;
      case 'ogc:PropertyIsGreaterThan':
        return `'${filter.firstChild.textContent}' > '${filter.childNodes[1].textContent}'`;
      case 'ogc:PropertyIsNotEqualTo':
        return `'${filter.firstChild.textContent}' != '${filter.childNodes[1].textContent}'`;
      case 'ogc:PropertyIsLessThanOrEqualTo':
        return `'${filter.firstChild.textContent}' <= '${filter.childNodes[1].textContent}'`;
      case 'ogc:PropertyIsGreaterThanOrEqualTo':
        return `'${filter.firstChild.textContent}' >= '${filter.childNodes[1].textContent}'`;
      case 'ogc:PropertyIsLike':
        if (filter.getAttribute('matchCase') === 'false') {
          return `'${filter.firstChild.textContent}' ILIKE '${filter.childNodes[1].textContent}'`;
        }

        return `'${filter.firstChild.textContent}' LIKE '${filter.childNodes[1].textContent}'`;
      default:
        return '';
    }
  },

  /**
    Creates filter object from string.

    @method _parseFilter
    @return {Object} Returns new created gml filter
    @private
  */
  _parseFilter() {
    let a = this.get('filterStringValue') || '';
    a = a.replace(/[\n\r]/g, '');
    this.set('_filterIsCorrect', true);
    if (Ember.isBlank(a)) {
      return null;
    }

    let filter =  this._parseExpression(a);

    return this.get('_filterIsCorrect') && filter.toGml ? filter.toGml() : null;
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
    const conditionExp = /^\s*('[^']+'|"[^"]+")\s*(=|<|>|<=|>=|!=|[Ii]?[Ll][Ii][Kk][Ee])\s*('[^']+'|"[^"]+"|[Nn][Uu][Ll][Ll])\s*$/;

    let exp = expression.trim();
    if (exp[0] === '(' && exp.slice(-1) === ')') {
      exp = exp.slice(1, exp.length - 1);
    }

    let conditionExpResult = conditionExp.exec(exp);
    if (conditionExpResult) {
      conditionExpResult[1] = conditionExpResult[1].slice(1, conditionExpResult[1].length - 1);
      if (conditionExpResult[3].toLowerCase() !== 'null') {
        conditionExpResult[3] = conditionExpResult[3].slice(1, conditionExpResult[3].length - 1);
      } else {
        conditionExpResult[3] = '';
      }

      let properties = Ember.A([conditionExpResult[1], conditionExpResult[3]]);
      switch (conditionExpResult[2].toLowerCase()) {
        case '=':
          if (Ember.isBlank(properties[1])) {
            return new L.Filter.IsNull(properties[0]);
          }

          return new L.Filter.EQ(...properties, true);
        case '!=':
          if (Ember.isBlank(properties[1])) {
            return new L.Filter.Not(new L.Filter.IsNull(properties[0]));
          }

          return new L.Filter.Or(new L.Filter.NotEQ(...properties, true), new L.Filter.IsNull(properties[0]));
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
            return new L.Filter.Not(properties[0]);
        }
      }
    }

    this.set('_filterIsCorrect', false);
    return null;
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
      let filter = this._parseFilter();
      if (this.get('_filterIsCorrect')) {
        this.set('filter', filter);
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
      let layers = this.get('_leafletObject._layers') || {};
      let values = Ember.A();
      let selectedField = this.get('_selectedField');

      for (let layer in layers) {
        let property = Ember.get(layers, `${layer}.feature.properties.${selectedField}`);
        values.addObject(property);

        if (values.length === count) {
          break;
        }
      }

      values.sort();
      if (values.indexOf(undefined) >= 0) {
        values.removeObject(undefined);
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
      let operandBefore = this.get('_selectedField') || '';
      let operandAfter = this.get('_selectedValue') || 'NULL';
      if (operandAfter !== 'NULL') {
        operandAfter = `'${operandAfter}'`;
      }

      let expressionString = `'${operandBefore}' ${condition} ${operandAfter}`;
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
      if (Ember.isNone(value)) {
        this._pasteIntoFilterString('NULL');
        return;
      }

      let newString = `'${value}'`;
      this._pasteIntoFilterString(newString);
    },
  }
});
