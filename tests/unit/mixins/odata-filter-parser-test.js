import EmberObject from '@ember/object';
import OdataFilterParserMixin from 'ember-flexberry-gis/mixins/odata-filter-parser';
import { module, test } from 'qunit';
import FilterOperator from 'ember-flexberry-data/query/filter-operator';
import {
  SimplePredicate, ComplexPredicate, StringPredicate, NotPredicate
} from 'ember-flexberry-data/query/predicate';

module('Unit | Mixin | odata filter parser', function () {
  const OdataFilterParserObject = EmberObject.extend(OdataFilterParserMixin);

  test('it works', function (assert) {
    const subject = OdataFilterParserObject.create();
    assert.ok(subject);
  });

  test('parseFilterConditionExpression should return filter SimplePredicate eq with value null', function (assert) {
    assert.expect(4);
    const subject = OdataFilterParserObject.create({});

    const filter = subject.parseFilterConditionExpression('field', '=', '');

    assert.ok(filter instanceof SimplePredicate);
    assert.equal(filter._attributePath, 'field');
    assert.equal(filter._operator, 'eq');
    assert.equal(filter._value, null);
  });

  test('parseFilterConditionExpression should return filter SimplePredicate eq with value', function (assert) {
    assert.expect(4);
    const subject = OdataFilterParserObject.create({});

    const filter = subject.parseFilterConditionExpression('field', '=', 'test');

    assert.ok(filter instanceof SimplePredicate);
    assert.equal(filter._attributePath, 'field');
    assert.equal(filter._operator, 'eq');
    assert.equal(filter._value, 'test');
  });

  test('parseFilterConditionExpression should return filter SimplePredicate neq with value null', function (assert) {
    assert.expect(4);
    const subject = OdataFilterParserObject.create({});

    const filter = subject.parseFilterConditionExpression('field', '!=', null);

    assert.ok(filter instanceof SimplePredicate);
    assert.equal(filter._attributePath, 'field');
    assert.equal(filter._operator, 'neq');
    assert.equal(filter._value, null);
  });

  test('parseFilterConditionExpression should return filter SimplePredicate neq with value', function (assert) {
    assert.expect(9);
    const subject = OdataFilterParserObject.create({});

    const filter = subject.parseFilterConditionExpression('field', '!=', 'test');

    assert.ok(filter instanceof ComplexPredicate);
    assert.equal(filter._condition, 'or');
    assert.equal(filter._predicates.length, 2);
    assert.equal(filter._predicates[0]._attributePath, 'field');
    assert.equal(filter._predicates[0]._operator, 'neq');
    assert.equal(filter._predicates[0]._value, 'test');
    assert.equal(filter._predicates[1]._attributePath, 'field');
    assert.equal(filter._predicates[1]._operator, 'eq');
    assert.equal(filter._predicates[1]._value, null);
  });

  test('parseFilterConditionExpression should return filter SimplePredicate ge', function (assert) {
    assert.expect(4);
    const subject = OdataFilterParserObject.create({});

    const filter = subject.parseFilterConditionExpression('field', '>', 10);

    assert.ok(filter instanceof SimplePredicate);
    assert.equal(filter._attributePath, 'field');
    assert.equal(filter._operator, 'ge');
    assert.equal(filter._value, 10);
  });

  test('parseFilterConditionExpression should return filter SimplePredicate le', function (assert) {
    assert.expect(4);
    const subject = OdataFilterParserObject.create({});

    const filter = subject.parseFilterConditionExpression('field', '<', 10);

    assert.ok(filter instanceof SimplePredicate);
    assert.equal(filter._attributePath, 'field');
    assert.equal(filter._operator, 'le');
    assert.equal(filter._value, 10);
  });

  test('parseFilterConditionExpression should return filter SimplePredicate geq', function (assert) {
    assert.expect(4);
    const subject = OdataFilterParserObject.create({});

    const filter = subject.parseFilterConditionExpression('field', '>=', 10);

    assert.ok(filter instanceof SimplePredicate);
    assert.equal(filter._attributePath, 'field');
    assert.equal(filter._operator, 'geq');
    assert.equal(filter._value, 10);
  });

  test('parseFilterConditionExpression should return filter SimplePredicate leq', function (assert) {
    assert.expect(4);
    const subject = OdataFilterParserObject.create({});

    const filter = subject.parseFilterConditionExpression('field', '<=', 10);

    assert.ok(filter instanceof SimplePredicate);
    assert.equal(filter._attributePath, 'field');
    assert.equal(filter._operator, 'leq');
    assert.equal(filter._value, 10);
  });

  test('parseFilterConditionExpression should return filter SimplePredicate like', function (assert) {
    assert.expect(3);
    const subject = OdataFilterParserObject.create({});

    const filter = subject.parseFilterConditionExpression('field', 'like', 10);

    assert.ok(filter instanceof StringPredicate);
    assert.equal(filter._attributePath, 'field');
    assert.equal(filter._containsValue, 10);
  });

  test('parseFilterLogicalExpression should return filter ComplexPredicate AND', function (assert) {
    assert.expect(3);
    const subject = OdataFilterParserObject.create({});

    const predicates = [new SimplePredicate('field', FilterOperator.Eq, 'test1'),
      new SimplePredicate('field', FilterOperator.Eq, 'test2')];
    const filter = subject.parseFilterLogicalExpression('and', predicates);

    assert.ok(filter instanceof ComplexPredicate);
    assert.equal(filter._condition, 'and');
    assert.equal(filter._predicates.length, 2);
  });

  test('parseFilterLogicalExpression should return filter ComplexPredicate OR', function (assert) {
    assert.expect(3);
    const subject = OdataFilterParserObject.create({});

    const predicates = [new SimplePredicate('field', FilterOperator.Eq, 'test1'),
      new SimplePredicate('field', FilterOperator.Eq, 'test2')];
    const filter = subject.parseFilterLogicalExpression('or', predicates);

    assert.ok(filter instanceof ComplexPredicate);
    assert.equal(filter._condition, 'or');
    assert.equal(filter._predicates.length, 2);
  });

  test('parseFilterLogicalExpression should return filter ComplexPredicate NOT', function (assert) {
    assert.expect(2);
    const subject = OdataFilterParserObject.create({});

    const predicates = [new SimplePredicate('field', FilterOperator.Eq, 'test1'),
      new SimplePredicate('field', FilterOperator.Eq, 'test2')];
    const filter = subject.parseFilterLogicalExpression('not', predicates);

    assert.ok(filter instanceof NotPredicate);
    assert.ok(filter._predicate instanceof SimplePredicate);
  });
});
