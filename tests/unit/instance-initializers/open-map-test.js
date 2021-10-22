import { resolve, Promise } from 'rsvp';
import Service from '@ember/service';
import Application from '@ember/application';
import { run } from '@ember/runloop';
import { initialize } from 'dummy/instance-initializers/open-map';
import { module, test } from 'qunit';
import destroyApp from '../../helpers/destroy-app';
import MapApi  from 'ember-flexberry-gis/services/map-api';
import MapStore  from 'ember-flexberry-gis/services/map-store';
import sinon from 'sinon';

module('Unit | Instance Initializer | open map', function(hooks) {
  hooks.beforeEach(function() {
    run(() => {
      this.application = Application.create();
      this.application.register('service:map-api', MapApi);
      let objStore = Service.extend({
        createRecord() {
          return {
            get() {
              return { pushObject() {} };
            }
          };
        }
      });
      this.application.register('service:store', objStore);
      this.application.register('service:map-store', MapStore);
      this.appInstance = this.application.buildInstance();
    });
  });

  hooks.afterEach(function() {
    run(this.appInstance, 'destroy');
    destroyApp(this.application);
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
    let openMap = this.appInstance.lookup('service:map-api').getFromApi('openMap');

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
    let openMap = this.appInstance.lookup('service:map-api').getFromApi('openMap');
    let mapStoreStub = sinon.stub(this.appInstance.lookup('service:map-store'), 'getMapById');
    let routerStub = sinon.stub(this.appInstance.lookup('router:main'), 'transitionTo');
    mapStoreStub.returns(resolve({}));
    routerStub.returns(true);

    //Action
    let res = openMap('d3434', { test: true });

    //Assert
    assert.ok(res instanceof Promise);
    res.then(()=> {
      assert.equal(mapStoreStub.callCount, 1);
      assert.equal(routerStub.callCount, 1);
      assert.equal(mapStoreStub.args[0][0], 'd3434');
      assert.deepEqual(routerStub.args[0][2], { queryParams: { test: true } });
      done();
      mapStoreStub.restore();
      routerStub.restore();
    });
    configStub.restore();
  });
});
