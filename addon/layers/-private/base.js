/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

const {
  assert
} = Ember;

const createFeaturesPropertiesSettings = function () {
  return {
    displayPropertyIsCallback: false,
    displayProperty: null,
    excludedProperties: [],
    localizedProperties: {
      ru: {},
      en: {}
    }
  };
};

const createDisplaySettings = function () {
  return {
    dateFormat: 'DD.MM.YYYY',
    featuresPropertiesSettings: createFeaturesPropertiesSettings()
  };
};

const createCommonSearchSettings = function () {
  return {
    canBeSearched: false,
    canBeContextSearched: false,
    contextSearchFields: null,
    searchFields: null,
  };
};

const createCommonIdentifySettings = function () {
  return {
    canBeIdentified: true
  };
};

const createCommonLegendSettings = function () {
  return {
    legendCanBeDisplayed: true
  };
};

/**
  Class describing base layer metadata.

  @class BaseLayer
*/
export default Ember.Object.extend({
  /**
    Icon class related to layer type.

    @property iconClass
    @type String
    @default null
  */
  iconClass: null,

  /**
    Permitted operations related to layer type.
    Possible values are 'add', 'edit', 'remove', 'search', 'identify', 'legend'.

    @property operations
    @type String[]
    @default null
  */
  operations: null,

  /**
    Creates new settings object (with settings related to layer-type).

    @method createSettings
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSettings() {
    let settings = {
      opacity: 1
    };

    // Inject search & identify settings.
    let availableOperations = Ember.A(this.get('operations') || []);

    if (availableOperations.contains('search')) {
      Ember.set(settings, 'searchSettings', createCommonSearchSettings());
    }

    if (availableOperations.contains('identify')) {
      Ember.set(settings, 'identifySettings', createCommonIdentifySettings());
    }

    Ember.set(settings, 'displaySettings', createDisplaySettings());

    if (availableOperations.contains('legend')) {
      Ember.set(settings, 'legendSettings', createCommonLegendSettings());
    }

    return settings;
  },

  /**
    Creates new settings object (with settings related to layer-type) from the specified CSW record.

    @method createSetingsFromCsw
    @param {Object} Specified CSW record.
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSetingsFromCsw(record) {
    return this.createSettings();
  },

  /**
    Creates new search settings object (with search settings related to layer-type).

    @method createSearchSettings
    @returns {Object} New search settings object (with search settings related to layer-type).
  */
  createSearchSettings() {
    return {};
  },

  /**
    Get properties names from leaflet layer object.

    @method getLayerProperties
    @param {Object} leafletObject Leaflet layer object
    @returns {Array} Array with properties names
  */
  getLayerProperties(leafletObject) {
    assert('BaseLayer\'s \'getLayerProperties\' should be overridden.');
  },

  /**
    Get property values from leaflet layer object.

    @method getLayerPropertyValues
    @param {Object} leafletObject Leaflet layer object
    @param {String} selectedField Selected field name
    @param {Integer} count Amount of values to return (for all values must be 0)
    @returns {Array} Array with selected property values
  */
  getLayerPropertyValues(leafletObject, selectedField, count) {
    assert('BaseLayer\'s \'getLayerPropertyValues\' should be overridden.');
  },

  /**
    Used for parsing filter string to layer's filter.

    @method parseFilterExpression
    @param {String} expression Filter string
    @param {Boolean} isInnerExpression Indicates it's inner expression or not
    @returns {Object} Filter object for layer
  */
  parseFilter(expression, isInnerExpression) {
    const logicalExp = /^\s*([Aa][Nn][Dd]|[Oo][Rr]|[Nn][Oo][Tt])\s*\((.+)\)\s*$/;
    const conditionExp = /^\s*('[^']+'|"[^"]+")\s*(=|<|>|<=|>=|!=|[Ii]?[Ll][Ii][Kk][Ee])\s*('[^']+'|"[^"]+"|[Nn][Uu][Ll][Ll])\s*$/;

    if (Ember.isBlank(expression)) {
      return '';
    }

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

      return this.parseFilterConditionExpression(conditionExpResult[1], conditionExpResult[2].toLowerCase(), conditionExpResult[3]);
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
            properties.addObject(this.parseFilter(condition, true));
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
            properties.addObject(this.parseFilter(propertiesString, true));
          } else {
            return null;
          }

          propertiesString = '';
        }

        index++;
      }

      if (properties.length > 0) {
        return this.parseFilterLogicalExpression(logicalExpResult[1].toLowerCase(), properties);
      }
    }

    return null;
  },

  /**
    Parse filter condition expression.
    ('=', '!=', '<', '<=', '>', '>=', 'LIKE', 'ILIKE').

    @method parseFilterConditionExpression
    @param {String} field Field name
    @param {String} condition Condition name
    @param {String} value Field value
    @returns {Object} Filter object
  */
  parseFilterConditionExpression(field, condition, value) {
    assert('BaseLayer\'s \'parseFilterConditionExpression\' should be overridden.');
  },

  /**
    Parse filter logical expression.
    ('AND', 'OR', 'NOT').

    @method parseFilterLogicalExpression
    @param {String} condition Filter condition
    @param {String} properties Filter properties
    @returns {Object} Filter object
  */
  parseFilterLogicalExpression(condition, properties) {
    assert('BaseLayer\'s \'parseFilterLogicalExpression\' should be overridden.');
  },
});
