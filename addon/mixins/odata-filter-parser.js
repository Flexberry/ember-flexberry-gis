/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import { Query } from 'ember-flexberry-data';

/**
  Odata filter parser mixin.
  Contains methods for parsing odata filter.

  @class OdataFilterParserMixin
  @uses <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({
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
          return new Query.SimplePredicate(field, Query.FilterOperator.Eq, null);
        }

        return new Query.SimplePredicate(field, Query.FilterOperator.Eq, value);
      case '!=':
        if (Ember.isBlank(value)) {
          return new Query.SimplePredicate(field, Query.FilterOperator.Neq, null);
        }

        return new Query.ComplexPredicate(Query.Condition.Or, new Query.SimplePredicate(field, Query.FilterOperator.Neq, value),
          new Query.SimplePredicate(field, Query.FilterOperator.Eq, null));
      case '>':
        return new Query.SimplePredicate(field, Query.FilterOperator.Ge, value);
      case '<':
        return new Query.SimplePredicate(field, Query.FilterOperator.Le, value);
      case '>=':
        return new Query.SimplePredicate(field, Query.FilterOperator.Geq, value);
      case '<=':
        return new Query.SimplePredicate(field, Query.FilterOperator.Leq, value);
      case 'like':
        return new Query.StringPredicate(field).contains(value);
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
        return new Query.ComplexPredicate(Query.Condition.And, ...properties);
      case 'or':
        return new Query.ComplexPredicate(Query.Condition.Or, ...properties);
      case 'not':
        return new Query.NotPredicate(properties[0]);
    }
  }
});
