import Ember from 'ember';
import { initialize } from 'dummy/instance-initializers/open-map';
import { module, test } from 'qunit';
import destroyApp from '../../helpers/destroy-app';
import MapApi  from 'ember-flexberry-gis/services/map-api';
import sinon from 'sinon';

module('Unit | Instance Initializer | open map', {
  beforeEach: function() {
    Ember.run(() => {
      this.application = Ember.Application.create();
      this.application.register('service:map-api', MapApi);
      this.appInstance = this.application.buildInstance();
    });
  },
  afterEach: function() {
    Ember.run(this.appInstance, 'destroy');
    destroyApp(this.application);
  }
});

test('map api added function Open Map', function(assert) {
  //Arrange
  let configStub = sinon.stub(Ember, 'getOwner');
  configStub.returns({
    _lookupFactory() {
      return {
        'APP': {
          'mapApiService': true
        }
      };
    }
  });

  //Action
  initialize(this.appInstance);
  let openMap = this.appInstance.lookup('service:map-api').getFromApi('open-map');

  //Assert
  assert.ok((typeof openMap) === 'function');
  assert.ok(true);
  configStub.restore();
});

test('Test for function Open Map', function(assert) {
  //Arrange
  let done = assert.async(1);
  let configStub = sinon.stub(Ember, 'getOwner');
  configStub.returns({
    _lookupFactory() {
      return {
        'APP': {
          'mapApiService': true
        }
      };
    }
  });
  initialize(this.appInstance);
  let openMap = this.appInstance.lookup('service:map-api').getFromApi('open-map');
  let testObj = { transitionTo() { return true; } };
  let spyTransitionTo = sinon.spy(testObj, 'transitionTo');
  let stubLookup = sinon.stub(this.appInstance, 'lookup');
  stubLookup.withArgs('service:map-store').returns({
    getMapById() { return Ember.RSVP.resolve({}); }
  });
  stubLookup.withArgs('router:main').returns(testObj);

  //Action
  let res = openMap('d3434', { test: true });

  //Assert
  assert.ok(res instanceof Ember.RSVP.Promise);
  res.then(()=> {
    assert.equal(spyTransitionTo.callCount, 1);
    assert.equal(stubLookup.withArgs('service:map-store').callCount, 1);
    assert.equal(stubLookup.withArgs('router:main').callCount, 1);
    assert.deepEqual(spyTransitionTo.args[0][2], { queryParams: { test: true } });
    done();
    stubLookup.restore();
    spyTransitionTo.restore();
  });
  configStub.restore();
});
