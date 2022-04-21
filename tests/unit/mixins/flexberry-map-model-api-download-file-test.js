import Ember from 'ember';
import { Promise } from 'rsvp';
import $ from 'jquery';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import sinon from 'sinon';
import crsFactory4326 from 'ember-flexberry-gis/coordinate-reference-systems/epsg-4326';

module('Unit | Mixin | flexberry map model api download file');

const mapApiMixinObject = EmberObject.extend(FlexberryMapModelApiMixin);

test('test api method downloadFile', function (assert) {
  assert.expect(4);
  const done = assert.async(1);
  const ownerStub = sinon.stub(Ember, 'getOwner');
  ownerStub.returns({
    knownForType() {
      return {
        epsg4326: crsFactory4326,
      };
    },
    resolveRegistration() {
      return {
        APP: {
          backendUrls: {
            featureExportApi: 'featureExportApi',
          },
        },
      };
    },
  });

  const layer = EmberObject.create({
    id: '1',
    type: 'wfs',
    settingsAsObject: {
      url: 'geoserverUrl',
      typeNS: 'testTypeNS',
      typeName: 'layerWfs',
      geometryField: 'geometryField',
    },
    name: 'layerWfsName',
    headers: {},
    crs: {
      code: 'EPSG:4326',
    },
  });
  const maplayers = [layer];
  const subject = mapApiMixinObject.create({
    mapLayer: maplayers,
  });

  const findByStub = sinon.stub(subject.mapLayer, 'findBy');
  findByStub.returns(layer);
  const stubAjax = sinon.stub($, 'ajax');
  stubAjax.yieldsTo('success', 'blob');

  const result = subject.downloadFile('1', ['111'], 'JSON', 'EPSG:4326', false);
  assert.ok(result instanceof Promise);
  result.then((res) => {
    assert.equal(res.fileName, 'layerWfsName.json');
    assert.equal(res.blob, 'blob');
    assert.equal(stubAjax.callCount, 1);
    done();
    ownerStub.restore();
    stubAjax.restore();
    findByStub.restore();
  });
});
