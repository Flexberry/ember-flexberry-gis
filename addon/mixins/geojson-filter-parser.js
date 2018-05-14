/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Geojson filter parser mixin.
  Contains methods for parsing geojson filter.

  @class GeoJsonFilterParserMixin
  @uses <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({
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

    let geojson = leafletObject.toGeoJSON() || {};
    let features = geojson.features || [];
    let fields = Ember.A();

    for (let property in Ember.get(features, '0.properties') || {}) {
      fields.addObject(property);
    }

    return fields;
  },

  /**
    Used for parsing filter string to layer's filter.

    @method parseFilterExpression
    @param {String} expression Filter string
    @param {String} geometryField Name of the layer's geometry field
    @param {Boolean} isInnerExpression Indicates it's inner expression or not
    @returns {Object} Filter object for layer
  */
  parseFilter(filter, geometryField, isInnerExpression) {
    let result = this._super(...arguments);

    if (!(Ember.isBlank(result) || isInnerExpression)) {
      let intersectFunction = `\nvar intersectCheck = function(condition, geoJSON) {` +
        `var intersects = true;\n` +
        `var bounds = new Terraformer.Polygon(geoJSON);\n` +
        `var primitive = new Terraformer.Primitive(feature.geometry);\n` +
        `if (typeof primitive.forEach === 'function') {\n` +
        `  primitive.forEach(function(geometry, index) {\n` +
        `    var primitive = this.get(index);\n` +
        `    intersects = intersects || primitive.within(bounds) || primitive.intersects(bounds);\n` +
        `  });\n` +
        `} else {\n` +
        `  intersects = primitive.within(bounds) || primitive.intersects(bounds);\n` +
        `}\n` +
        `return condition === 'not in' ? !intersects : intersects;\n` +
        `};\n`;
      return `function(feature) {${intersectFunction} return ${result}}`;
    }

    return result;
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
    switch (condition) {
      case '=':
        if (Ember.isBlank(value)) {
          return `feature.properties.${field} == null`;
        }

        return `feature.properties.${field} === '${value}'`;
      case '!=':
        if (Ember.isBlank(value)) {
          return `feature.properties.${field} != null`;
        }

        return `feature.properties.${field} !== '${value}'`;
      case '>':
        return `feature.properties.${field} > '${value}'`;
      case '<':
        return `feature.properties.${field} < '${value}'`;
      case '>=':
        if (Ember.isBlank(value)) {
          return `feature.properties.${field} >= null`;
        }

        return `feature.properties.${field} >== '${value}'`;
      case '<=':
        if (Ember.isBlank(value)) {
          return `feature.properties.${field} <= null`;
        }

        return `feature.properties.${field} <== '${value}'`;
      case 'like':
        return `(feature.properties.${field} || '').toString().indexOf('${value}') >= 0`;
      case 'ilike':
        return `(feature.properties.${field} || '').toString().toLowerCase().indexOf('${value}'.toLowerCase()) >= 0`;
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
        return `(${properties.join('&&')})`;
      case 'or':
        return `(${properties.join('||')})`;
      case 'not':
        return `!(${properties[0]})`;
    }
  },

  /**
    Parse filter geometry expression.
    ('IN', 'NOT IN').

    @method parseFilterGeometryExpression
    @param {String} condition Filter condition
    @param {Object} geoJSON Geometry
    @return {String} Body of filter function.
  */
  parseFilterGeometryExpression(condition, geoJSON) {
    return `intersectCheck('${condition}', ${JSON.stringify(geoJSON)})`;
  },
});
