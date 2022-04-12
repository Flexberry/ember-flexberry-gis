import Ember from 'ember';
import { Promise } from 'rsvp';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import sinon from 'sinon';

module('Unit | Mixin | flexberry map model api test', function () {
  const mapApiMixinObject = EmberObject.extend(FlexberryMapModelApiMixin);

  // Replace this with your real tests.
  test('it works FlexberryMapModelApiMixin', function (assert) {
    const subject = mapApiMixinObject.create();
    assert.ok(subject);
  });

  test('uploadFile should send post request with fileName and data to backend and return Ember.RSVP.Promise', function (assert) {
    assert.expect(4);
    const done = assert.async(1);
    const server = sinon.fakeServer.create();
    server.respondWith('uploadfileresponse');
    const configStub = sinon.stub(Ember, 'getOwner');
    configStub.returns({
      resolveRegistration() {
        return {
          APP: {
            backendUrl: 'stubbackend',
          },
        };
      },
    });

    const subject = mapApiMixinObject.create();
    const payload = { name: 'testFile', };

    const result = subject.uploadFile(payload);
    server.respond();

    assert.ok(result instanceof Promise);
    assert.ok(server.requests[0].requestBody.has('testFile'));
    assert.equal(server.requests[0].url, 'stubbackend/controls/FileUploaderHandler.ashx?FileName=testFile');
    result.then((e) => {
      assert.equal(e, 'uploadfileresponse');
      done();
    });

    configStub.restore();
    server.restore();
  });
});
