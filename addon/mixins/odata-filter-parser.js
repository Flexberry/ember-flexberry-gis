/**
  @module ember-flexberry-gis
*/

import { isBlank } from '@ember/utils';

import Mixin from '@ember/object/mixin';
import Condition from 'ember-flexberry-data/query/condition';
import FilterOperator from 'ember-flexberry-data/query/filter-operator';
import {
  SimplePredicate, ComplexPredicate, StringPredicate, NotPredicate
} from 'ember-flexberry-data/query/predicate';

/**
  Odata filter parser mixin.
  Contains methods for parsing odata filter.

  @class OdataFilterParserMixin
  @uses <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Mixin.create({
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
        if (isBlank(value)) {
          return new SimplePredicate(field, FilterOperator.Eq, null);
        }

        return new SimplePredicate(field, FilterOperator.Eq, value);
      case '!=':
        if (isBlank(value)) {
          return new SimplePredicate(field, FilterOperator.Neq, null);
        }

        return new ComplexPredicate(Condition.Or, new SimplePredicate(field, FilterOperator.Neq, value),
          new SimplePredicate(field, FilterOperator.Eq, null));
      case '>':
        return new SimplePredicate(field, FilterOperator.Ge, value);
      case '<':
        return new SimplePredicate(field, FilterOperator.Le, value);
      case '>=':
        return new SimplePredicate(field, FilterOperator.Geq, value);
      case '<=':
        return new SimplePredicate(field, FilterOperator.Leq, value);
      case 'like':
        return new StringPredicate(field).contains(value);
      default:
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
        return new ComplexPredicate(Condition.And, ...properties);
      case 'or':
        return new ComplexPredicate(Condition.Or, ...properties);
      case 'not':
        return new NotPredicate(properties[0]);
      default:
    }
  },
});
