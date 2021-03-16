import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import sinon from 'sinon';

module('Unit | Mixin | flexberry map model api test');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);

// Replace this with your real tests.
test('it works FlexberryMapModelApiMixin', function (assert) {
  let subject = mapApiMixinObject.create();
  assert.ok(subject);
});

test('uploadFile should send post request with fileName and data to backend and return Ember.RSVP.Promise', function (assert) {
  assert.expect(4);
  let done = assert.async(1);
  let server = sinon.fakeServer.create();
  server.respondWith('uploadfileresponse');
  let configStub = sinon.stub(Ember, 'getOwner');
  configStub.returns({
    resolveRegistration() {
      return {
        'APP': {
          'backendUrl': 'stubbackend'
        }
      };
    }
  });

  let subject = mapApiMixinObject.create();
  let payload = { 'name': 'testFile' };

  let result = subject.uploadFile(payload);
  server.respond();

  assert.ok(result instanceof Ember.RSVP.Promise);
  assert.ok(server.requests[0].requestBody.has('testFile'));
  assert.equal(server.requests[0].url, 'stubbackend/controls/FileUploaderHandler.ashx?FileName=testFile');
  result.then((e) => {
    assert.equal(e, 'uploadfileresponse');
    done();
  });

  configStub.restore();
  server.restore();
});
