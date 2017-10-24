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
          }
        } else {
          propertiesString = propertiesString.trim();
          if (propertiesString[0] === '(' && propertiesString.slice(-1) === ')') {
            propertiesString = propertiesString.slice(1, propertiesString.length - 1);
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

  actions: {
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
      Paste expression with condition into fiter string.

      @method pasteConditionExpression
      @param {String} condition
    */
    pasteConditionExpression(condition) {
      this.set('filterStringValue', `${this.get('filterStringValue') || ''}'example' ${condition} 'ex'`);
    },

    /**
      Paste logical expression into fiter string.

      @method pasteLogicalExpression
      @param {String} condition
    */
    pasteLogicalExpression(condition) {
      this.set('filterStringValue', `${this.get('filterStringValue') || ''}${condition} ()`);
    },

    /**
      Paste symbol into fiter string.

      @method pasteSymbol
      @param {String} symbol
    */
    pasteSymbol(symbol) {
      this.set('filterStringValue', `${this.get('filterStringValue') || ''}${symbol}`);
    }
  }
});
