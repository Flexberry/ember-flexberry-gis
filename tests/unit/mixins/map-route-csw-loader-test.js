import Ember from 'ember';
import MapRouteCswLoaderMixin from 'ember-flexberry-gis/mixins/map-route-csw-loader';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Mixin | map route csw loader');

test('it should call _loadCswConnection on model hook', function(assert) {
  let _loadCswConnections = sinon.spy();
  let MapRouteCswLoaderObject = Ember.Object.extend(MapRouteCswLoaderMixin);
  let subject = MapRouteCswLoaderObject.create({ _loadCswConnections });

  subject.model();

  assert.ok(_loadCswConnections.called);
});

test('it should pass cswConnections to controller on setupController hook', function(assert) {
  let MapRouteCswLoaderObject = Ember.Object.extend(MapRouteCswLoaderMixin);
  let cswConnections = {};
  let subject = MapRouteCswLoaderObject.create({ cswConnections });
  let controller = Ember.Object.create();

  subject.setupController(controller);

  assert.equal(controller.get('cswConnections'), cswConnections);
});
