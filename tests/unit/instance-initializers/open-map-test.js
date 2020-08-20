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

test('it works', function(assert) {
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
