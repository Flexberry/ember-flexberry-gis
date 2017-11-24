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
    @param {Boolean} isInnerExpression Indicates it's inner expression or not
    @returns {Object} Filter object for layer
  */
  parseFilter(filter, isInnerExpression) {
    let result = this._super(...arguments);

    return Ember.isBlank(result) || isInnerExpression ? result : `function(feature) { return ${result}; }`;
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
    Parse filter bbox expression.
    ('IN', 'NOT IN').

    @method parseFilterBboxExpression
    @param {String} condition Filter condition
    @param {Object} coords Bbox coordinates
    @returns {Object} Filter object
  */
  parseFilterBboxExpression(condition, coords) {
    /*let bboxPolygon = `{type: 'Polygon', coordinates: [[[${coords.minLng}, ${coords.minLat}], [${coords.maxLng}, ` +
      `${coords.minLat}], [${coords.maxLng}, ${coords.maxLat}], [${coords.minLng}, ${coords.maxLat}], [${coords.minLng}, ${coords.minLat}]]] }`;
    let filter = `new Terraformer.Primitive(feature.geometry).within(${bboxPolygon})`;
    switch (condition) {
      case 'in':
        return filter;
      case 'not in':
        return `!${filter}`;
    }*/

    /*
      Geometry filters for geojson layers isn't implemented yet.
      Terraformer's within/intersects methods aren't working with all geometry types
      (for example with GeometryCollection).
    */
    return 'true';
  },
});
