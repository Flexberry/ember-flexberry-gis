import ODataQueryAdapter from 'ember-flexberry-data/query/odata-adapter';
import {
  SimplePredicate,
  StringPredicate,
  DatePredicate,
} from 'ember-flexberry-data/query/predicate';

export default class CustomODataQueryAdapter extends ODataQueryAdapter {
  _convertPredicateToODataFilterClause(predicate, modelName, prefix, level) {
    if (predicate instanceof SimplePredicate || predicate instanceof DatePredicate) {
      return this._buildODataSimplePredicate(predicate, modelName, prefix);
    }

    if (predicate instanceof StringPredicate) {
      let attribute = this._getODataAttributeName(
        modelName,
        predicate.attributePath
      );
      if (prefix) {
        attribute = `${prefix}/${attribute}`;
      }

      // Добавляем поддержку startsWith и endsWith
      if (predicate.condition === 'startswith') {
        return `startswith(${attribute},'${String(
          predicate.containsValue
        ).replace(/'/g, "''")}')`;
      }

      if (predicate.condition === 'endswith') {
        return `endswith(${attribute},'${String(
          predicate.containsValue
        ).replace(/'/g, "''")}')`;
      }

      // Стандартная обработка contains
      return `contains(${attribute},'${String(predicate.containsValue).replace(
        /'/g,
        `''`
      )}')`;
    }

    return super._convertPredicateToODataFilterClause(
      predicate,
      modelName,
      prefix,
      level
    );
  }
}
