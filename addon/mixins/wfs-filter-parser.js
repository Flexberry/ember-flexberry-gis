/**
  @module ember-flexberry-gis
*/

import { get } from '@ember/object';

import { A } from '@ember/array';
import { isNone, isBlank } from '@ember/utils';
import Mixin from '@ember/object/mixin';

/**
  WFS filter parser mixin.
  Contains methods for parsing WFS filter.

  @class WfsFilterParserMixin
  @uses <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Mixin.create({
  /**
    Get properties names from leaflet layer object.

    @method getLayerProperties
    @param {Object} leafletObject Leaflet layer object
    @returns {Array} Array with properties names
  */
  getLayerProperties(leafletObject) {
    if (isNone(leafletObject)) {
      return A();
    }

    const fields = A();
    const fieldsDescription = get(leafletObject, 'readFormat.featureType.fields') || {};
    for (const field in fieldsDescription) {
      fields.addObject(field);
    }

    return fields;
  },

  /**
    Parse filter condition expression ('=', '!=', '<', '<=', '>', '>=', 'LIKE', 'ILIKE').

    @method parseFilterConditionExpression
    @param {String} field Field name
    @param {String} condition Condition name
    @param {String} value Field value
    @returns {Object} Filter object
  */
  parseFilterConditionExpression(field, condition, value) {
    const properties = A([field, value]);
    switch (condition) {
      case '=':
        if (isBlank(value)) {
          return new L.Filter.IsNull(field);
        }

        return new L.Filter.EQ(...properties, true);
      case '!=':
        if (isBlank(value)) {
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
        return new L.Filter.Like(...properties, { matchCase: true, });
      case 'ilike':
        return new L.Filter.Like(...properties, { matchCase: false, });
    }
  },

  /**
    Parse filter logical expression ('AND', 'OR', 'NOT').

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

  /**
    Parse filter geometry expression.
    ('IN', 'NOT IN').

    @method parseFilterGeometryExpression
    @param {String} condition Filter condition
    @param {Object} geoJSON Geometry
    @param {String} geometryField Layer's geometry field
    @returns {Object} Filter object
  */
  parseFilterGeometryExpression(condition, geoJSON, geometryField) {
    switch (condition) {
      case 'in':
      case 'not in':
        const bounds = new Terraformer.Primitive(geoJSON).bbox();
        const filter = new L.Filter.BBox(
          geometryField,
          L.latLngBounds(L.latLng(bounds[1], bounds[0]), L.latLng(bounds[3], bounds[2])),
          L.CRS.EPSG4326
        );
        return condition === 'in' ? filter : new L.Filter.Not(filter);
    }
  },
});
