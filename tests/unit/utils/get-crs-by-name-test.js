import Ember from 'ember';
import { getCrsByName } from 'ember-flexberry-gis/utils/get-crs-by-name';
import { module, test } from 'qunit';
import crsFactory4326 from 'ember-flexberry-gis/coordinate-reference-systems/epsg-4326';
import sinon from 'sinon';

module('Unit | Utility | get crs by name');

let crsFactory32640 = {
  code: 'EPSG:32640',
  definition: '+proj=utm +zone=40 +datum=WGS84 +units=m +no_defs',
  create() {
    let crs = L.extend({}, new L.Proj.CRS(this.code, this.definition), {
      scale: function (zoom) {
        return 256 * Math.pow(2, zoom);
      },
      zoom: function (scale) {
        return Math.log(scale / 256) / Math.LN2;
      }
    });
    return crs;
  }
};

test('test method getCrsByName for EPSG:32640', function(assert) {
  let crsName = 'EPSG:32640';
  let that = {};
  let ownerStub = sinon.stub(Ember, 'getOwner');
  ownerStub.returns({
    knownForType() {
      return {
        'epsg4326': crsFactory4326,
        'epsg32640': crsFactory32640
      };
    }
  });

  let crsResult = getCrsByName(crsName, that);

  assert.ok(crsResult.crs);
  assert.ok(crsResult.definition);
  assert.equal(crsResult.crs.code, 'EPSG:32640');
  assert.equal(crsResult.definition, '+proj=utm +zone=40 +datum=WGS84 +units=m +no_defs');
  ownerStub.restore();
});

test('test method getCrsByName for EPSG:4326', function(assert) {
  let crsName = 'EPSG:4326';
  let that = {};
  let ownerStub = sinon.stub(Ember, 'getOwner');
  ownerStub.returns({
    knownForType() {
      return {
        'epsg4326': crsFactory4326,
        'epsg32640': crsFactory32640
      };
    }
  });

  let crsResult = getCrsByName(crsName, that);

  assert.ok(crsResult.crs);
  assert.ok(crsResult.definition);
  assert.equal(crsResult.crs.code, 'EPSG:4326');
  assert.equal(crsResult.definition, '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees');
  ownerStub.restore();
});
