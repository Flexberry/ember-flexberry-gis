import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import crsFactory4326 from 'ember-flexberry-gis/coordinate-reference-systems/epsg-4326';
import sinon from 'sinon';

module('Unit | Mixin | flexberry-map-model-api getLayerObjectOptions');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);

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

let crs32640 = crsFactory32640.create();

let geoJson32640 = {
  type: 'MultiPolygon',
  properties: {},
  coordinates: [[[
    [514059.321485393, 6507392.17766284], [513865.509562311, 6507418.6567982], [513839.790201802, 6507279.05179395],
    [513740.187971532, 6507317.79141744], [513721.727135932, 6507264.36084561], [513663.282762761, 6507443.48435832],
    [513802.186924293, 6507539.53170715], [514050.141524955, 6507525.35628219], [514059.321485393, 6507392.17766284]
  ]]]
};

let geoJson4326 = {
  type: 'MultiPolygon',
  properties: {},
  coordinates: [[[
    [57.24265119051584, 58.706458371940684], [57.23930783675451, 58.70670243628802], [57.23885536193849, 58.705449470295804],
    [57.23713874882379, 58.705800565222816], [57.23681688374202, 58.705321292241], [57.23581910198846, 58.706931847023135],
    [57.23822236061096, 58.70779003629061], [57.24250106747296, 58.70765474411314], [57.24265119051584, 58.706458371940684]
  ]]]
};

test('getLayerObjectOptions should return properties of feature, projected geometry, and correct area', function (assert) {
  assert.expect(3);
  let done = assert.async(1);

  let featureLayer = L.geoJSON(geoJson32640).getLayers()[0];
  featureLayer.feature.properties.foo = 'bar';

  let subject = mapApiMixinObject.create({
    _getModelLayerFeature() {
      return Ember.RSVP.resolve([
        null,
        { options: { crs: crs32640 } },
        [featureLayer]]);
    }
  });

  let result = subject.getLayerObjectOptions();

  result.then((options) => {
    assert.equal(options.foo, 'bar');
    assert.equal(options.area.toFixed(2), 61177.16);
    assert.deepEqual(options.geometry, geoJson32640.coordinates);
    done();
  });
});

test('getLayerObjectOptions return projected geometry if specified crsName', function (assert) {
  assert.expect(2);
  let done = assert.async(1);
  let ownerStub = sinon.stub(Ember, 'getOwner');
  ownerStub.returns({
    knownForType() {
      return {
        'epsg4326': crsFactory4326,
        'epsg32640': crsFactory32640
      };
    }
  });

  let featureLayer = L.geoJSON(geoJson32640).getLayers()[0];
  let subject = mapApiMixinObject.create({
    _getModelLayerFeature() {
      return Ember.RSVP.resolve([
        null,
        { options: { crs: crs32640 } },
        [featureLayer]]);
    }
  });

  let result = subject.getLayerObjectOptions(null, null, 'EPSG:4326');
  result.then((options) => {
    assert.equal(options.area.toFixed(2), 61177.16);
    assert.deepEqual(options.geometry, geoJson4326.coordinates);
    done();
    ownerStub.restore();
  });
});
