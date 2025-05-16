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
  },

  /**
    <OdataFilterParserMixin> Parse filter condition expression.

    @method parseFilterConditionExpression
    @param {String} field Field name
    @param {String} condition Condition name
    @param {String} value Field value
    @returns {Object} Filter object
  */
  parseFilterConditionExpressionAG(field, condition, value) {
    const filterType = value.filterType;

    if (condition === "inRange") {
      let firstValue = value.dateFrom || value.filter;
      let secondValue = value.dateTo || value.filterTo;
      value = [firstValue, secondValue];
    } else {
      value = value.dateFrom || value.filter;
    }


    if ((filterType === 'date' || filterType === 'dateTime') && value) {
      if (Ember.isArray(value)) {
        value = value.map(e => new Date(e).toISOString())
      } else {
        value = new Date(value).toISOString()
      }
    }

    switch (condition) {
      case "equals":
        if (filterType === 'date') {
          return new Query.DatePredicate(field, Query.FilterOperator.Eq, value, true);
        }

        return new Query.SimplePredicate(field, Query.FilterOperator.Eq, value);
      case "notEqual":
        if (filterType === 'date') {
          return new Query.DatePredicate(field, Query.FilterOperator.Neq, value, true);
        }

        return new Query.SimplePredicate(
          field,
          Query.FilterOperator.Neq,
          value
        );
      case "contains":
        return new Query.StringPredicate(field).contains(value);
      case "notContains":
        return new Query.NotPredicate(
          new Query.StringPredicate(field).contains(value)
        );
      case "startsWith":
        return new Query.StringPredicate(field).startsWith(value);
      case "endsWith":
        return new Query.StringPredicate(field).endsWith(value);
      case "blank":
        if (filterType === "date" || filterType === "dateTime")
          return new Query.SimplePredicate(
            field,
            Query.FilterOperator.Eq,
            null
          );

        return new Query.ComplexPredicate(
          Query.Condition.Or,
          new Query.SimplePredicate(field, Query.FilterOperator.Eq, null),
          new Query.SimplePredicate(field, Query.FilterOperator.Eq, "")
        );

      case "notBlank" || "all":
        if (filterType === "date" || filterType === "dateTime")
          return new Query.NotPredicate(
            new Query.SimplePredicate(field, Query.FilterOperator.Eq, null)
          );

        return new Query.NotPredicate(
          new Query.ComplexPredicate(
            Query.Condition.Or,
            new Query.SimplePredicate(field, Query.FilterOperator.Eq, null),
            new Query.SimplePredicate(field, Query.FilterOperator.Eq, "")
          )
        );

      case "true":
        return new Query.SimplePredicate(field, Query.FilterOperator.Eq, true);
      case "false":
        return new Query.SimplePredicate(field, Query.FilterOperator.Eq, false);

      case "greaterThan":
        if (filterType === 'date') {
          return new Query.DatePredicate(field, Query.FilterOperator.Ge, value, true);
        }

        return new Query.SimplePredicate(field, Query.FilterOperator.Ge, value);
      case "lessThan":
        if (filterType === 'date') {
          return new Query.DatePredicate(field, Query.FilterOperator.Le, value, true);
        }

        return new Query.SimplePredicate(field, Query.FilterOperator.Le, value);
      case "greaterThanOrEqual":
        if (filterType === 'date') {
          return new Query.DatePredicate(field, Query.FilterOperator.Geq, value, true);
        }

        return new Query.SimplePredicate(
          field,
          Query.FilterOperator.Geq,
          value
        );
      case "lessThanOrEqual":
        if (filterType === 'date') {
          return new Query.DatePredicate(field, Query.FilterOperator.Leq, value, true);
        }

        return new Query.SimplePredicate(
          field,
          Query.FilterOperator.Leq,
          value
        );
      case "inRange":
        if (filterType === 'date') {

          return new Query.ComplexPredicate(
            Query.Condition.And,
            new Query.DatePredicate(field, Query.FilterOperator.Geq, value[0], true),
            new Query.DatePredicate(field, Query.FilterOperator.Leq, value[1], true),
          );

        }

        return new Query.ComplexPredicate(
          Query.Condition.And,
          new Query.SimplePredicate(field, Query.FilterOperator.Geq, value[0]),
          new Query.SimplePredicate(field, Query.FilterOperator.Leq, value[1])
        );

      default:
        new Query.SimplePredicate(field, Query.FilterOperator.Eq, value);
    }
  },
});
