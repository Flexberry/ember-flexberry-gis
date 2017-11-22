/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseLayer from './-private/base';

/**
  Class describing WFS layer metadata.

  @class WfsLayer
  @extends BaseLayer
*/
export default BaseLayer.extend({
  /**
    Permitted operations related to layer type.

    @property operations
    @type String[]
    @default ['edit', 'remove', 'identify', 'search', 'legend', 'filter', 'attributes']
  */
  operations: ['edit', 'remove', 'identify', 'search', 'legend', 'filter', 'attributes'],

  /**
    Creates new settings object (with settings related to layer-type).

    @method createSettings
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSettings() {
    let settings = this._super(...arguments);
    Ember.$.extend(true, settings, {
      crs: undefined,
      showExisting: undefined,
      geometryField: undefined,
      url: undefined,
      version: undefined,
      typeNS: undefined,
      typeName: undefined,
      typeNSName: undefined,
      maxFeatures: undefined,
      format: undefined,
      style: {
        color: undefined,
        weight: undefined
      },
      namespaceUri: undefined,
      filter: '',
      clusterize: false,
      clusterOptions: undefined
    });

    return settings;
  },

  /**
    Creates new search settings object (with search settings related to layer-type).

    @method createSearchSettings
    @returns {Object} New search settings object (with search settings related to layer-type).
  */
  createSearchSettings() {
    let settings = this._super(...arguments);
    Ember.$.extend(true, settings, {
      queryString: '',
      maxResultsCount: 10
    });

    return settings;
  },

  /**
    Get properties names from leaflet layer object.

    @method getLayerProperties
    @param {Object} leafletObject Leaflet layer object
    @returns {Array} Array with properties names
  */
  getLayerProperties(leafletObject) {
    if (Ember.isNone(leafletObject)) {
      return Ember.A();
    }

    let fields = Ember.A();
    let fieldsDescription = Ember.get(leafletObject, 'readFormat.featureType.fields') || {};
    for (let field in fieldsDescription) {
      fields.addObject(field);
    }

    return fields;
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
    let properties = Ember.A([field, value]);
    switch (condition) {
      case '=':
        if (Ember.isBlank(value)) {
          return new L.Filter.IsNull(field);
        }

        return new L.Filter.EQ(...properties, true);
      case '!=':
        if (Ember.isBlank(value)) {
          return new L.Filter.Not(new L.Filter.IsNull(field));
        }

        return new L.Filter.Or(new L.Filter.NotEQ(...properties, true), new L.Filter.IsNull(field));
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
    switch (condition) {
      case 'and':
        return new L.Filter.And(...properties);
      case 'or':
        return new L.Filter.Or(...properties);
      case 'not':
        return new L.Filter.Not(properties[0]);
    }
  },
});
