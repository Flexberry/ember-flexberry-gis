import Ember from 'ember';
import OdataFilterParserMixin from 'ember-flexberry-gis/mixins/odata-filter-parser';
import { module, test } from 'qunit';
import { Query } from 'ember-flexberry-data';

module('Unit | Mixin | odata filter parser');

let OdataFilterParserObject = Ember.Object.extend(OdataFilterParserMixin);

test('it works', function(assert) {
  let subject = OdataFilterParserObject.create();
  assert.ok(subject);
});

test('parseFilterConditionExpression should return filter SimplePredicate eq with value null', function (assert) {
  assert.expect(4);
  let subject = OdataFilterParserObject.create({});

  let filter = subject.parseFilterConditionExpression('field', '=', '');

  assert.ok(filter instanceof Query.SimplePredicate);
  assert.equal(filter._attributePath, 'field');
  assert.equal(filter._operator, 'eq');
  assert.equal(filter._value, null);
});

test('parseFilterConditionExpression should return filter SimplePredicate eq with value', function (assert) {
  assert.expect(4);
  let subject = OdataFilterParserObject.create({});

  let filter = subject.parseFilterConditionExpression('field', '=', 'test');

  assert.ok(filter instanceof Query.SimplePredicate);
  assert.equal(filter._attributePath, 'field');
  assert.equal(filter._operator, 'eq');
  assert.equal(filter._value, 'test');
});

test('parseFilterConditionExpression should return filter SimplePredicate neq with value null', function (assert) {
  assert.expect(4);
  let subject = OdataFilterParserObject.create({});

  let filter = subject.parseFilterConditionExpression('field', '!=', null);

  assert.ok(filter instanceof Query.SimplePredicate);
  assert.equal(filter._attributePath, 'field');
  assert.equal(filter._operator, 'neq');
  assert.equal(filter._value, null);
});

test('parseFilterConditionExpression should return filter SimplePredicate neq with value', function (assert) {
  assert.expect(9);
  let subject = OdataFilterParserObject.create({});

  let filter = subject.parseFilterConditionExpression('field', '!=', 'test');

  assert.ok(filter instanceof Query.ComplexPredicate);
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
  let subject = OdataFilterParserObject.create({});

  let filter = subject.parseFilterConditionExpression('field', '>', 10);

  assert.ok(filter instanceof Query.SimplePredicate);
  assert.equal(filter._attributePath, 'field');
  assert.equal(filter._operator, 'ge');
  assert.equal(filter._value, 10);
});

test('parseFilterConditionExpression should return filter SimplePredicate le', function (assert) {
  assert.expect(4);
  let subject = OdataFilterParserObject.create({});

  let filter = subject.parseFilterConditionExpression('field', '<', 10);

  assert.ok(filter instanceof Query.SimplePredicate);
  assert.equal(filter._attributePath, 'field');
  assert.equal(filter._operator, 'le');
  assert.equal(filter._value, 10);
});

test('parseFilterConditionExpression should return filter SimplePredicate geq', function (assert) {
  assert.expect(4);
  let subject = OdataFilterParserObject.create({});

  let filter = subject.parseFilterConditionExpression('field', '>=', 10);

  assert.ok(filter instanceof Query.SimplePredicate);
  assert.equal(filter._attributePath, 'field');
  assert.equal(filter._operator, 'geq');
  assert.equal(filter._value, 10);
});

test('parseFilterConditionExpression should return filter SimplePredicate leq', function (assert) {
  assert.expect(4);
  let subject = OdataFilterParserObject.create({});

  let filter = subject.parseFilterConditionExpression('field', '<=', 10);

  assert.ok(filter instanceof Query.SimplePredicate);
  assert.equal(filter._attributePath, 'field');
  assert.equal(filter._operator, 'leq');
  assert.equal(filter._value, 10);
});

test('parseFilterConditionExpression should return filter SimplePredicate like', function (assert) {
  assert.expect(3);
  let subject = OdataFilterParserObject.create({});

  let filter = subject.parseFilterConditionExpression('field', 'like', 10);

  assert.ok(filter instanceof Query.StringPredicate);
  assert.equal(filter._attributePath, 'field');
  assert.equal(filter._containsValue, 10);
});

test('parseFilterLogicalExpression should return filter ComplexPredicate AND', function (assert) {
  assert.expect(3);
  let subject = OdataFilterParserObject.create({});

  let predicates = [new Query.SimplePredicate('field', Query.FilterOperator.Eq, 'test1'),
    new Query.SimplePredicate('field', Query.FilterOperator.Eq, 'test2')];
  let filter = subject.parseFilterLogicalExpression('and', predicates);

  assert.ok(filter instanceof Query.ComplexPredicate);
  assert.equal(filter._condition, 'and');
  assert.equal(filter._predicates.length, 2);
});

test('parseFilterLogicalExpression should return filter ComplexPredicate OR', function (assert) {
  assert.expect(3);
  let subject = OdataFilterParserObject.create({});

  let predicates = [new Query.SimplePredicate('field', Query.FilterOperator.Eq, 'test1'),
    new Query.SimplePredicate('field', Query.FilterOperator.Eq, 'test2')];
  let filter = subject.parseFilterLogicalExpression('or', predicates);

  assert.ok(filter instanceof Query.ComplexPredicate);
  assert.equal(filter._condition, 'or');
  assert.equal(filter._predicates.length, 2);
});

test('parseFilterLogicalExpression should return filter ComplexPredicate NOT', function (assert) {
  assert.expect(2);
  let subject = OdataFilterParserObject.create({});

  let predicates = [new Query.SimplePredicate('field', Query.FilterOperator.Eq, 'test1'),
    new Query.SimplePredicate('field', Query.FilterOperator.Eq, 'test2')];
  let filter = subject.parseFilterLogicalExpression('not', predicates);

  assert.ok(filter instanceof Query.NotPredicate);
  assert.ok(filter._predicate instanceof Query.SimplePredicate);
});
