import Ember from 'ember';
import FlexberryMapModelApiMixin  from 'ember-flexberry-gis/mixins/flexberry-map-model-api';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Mixin | map model api comparelayers', {
  beforeEach: function () {
    app = startApp();

    /*options = {
      geometryField: 'shape',
      showExisting: false,
      withCredentials: false,
      crs: L.CRS.EPSG3857,
      continueLoading: false
    };

    let leafletOptions = [
      'geometryField',
      'crs',
      'maxFeatures',
      'showExisting',
      'style',
      'forceMulti',
      'withCredentials',
      'continueLoading'
    ];

    param = {
      format: 'GeoJSON',
      leafletOptions: leafletOptions
    };
    param = Ember.$.extend(param, options);*/

    odataServerFake = sinon.fakeServer.create();
    odataServerFake.autoRespond = true;

    odataServerFake.respondWith('POST', 'http://134.209.30.115:1818/odata/$batch',
      function (request) {
        request.respond(200, { 'Content-Type': 'multipart/mixed; boundary=batchresponse_3942662d-07b6-4e24-b466-fba5d37ca181' },
        '--batchresponse_3942662d-07b6-4e24-b466-fba5d37ca181\r\n' +
        'Content-Type: application/http\r\n' +
        'Content-Transfer-Encoding: binary\r\n' +
        '\r\n' +
        'HTTP/1.1 200 OK\r\n' +
        'Content-Type: application/json; charset=utf-8; odata.metadata=minimal\r\n' +
        'OData-Version: 4.0\r\n' +
        '\r\n' +
        '{\r\n' +
        '  "@odata.context":"http://134.209.30.115:1818/odata/$metadata#ModelTest(__PrimaryKey)","value":[\r\n' +
        '\r\n' +
        '  ]\r\n' +
        '}\r\n' +
        '--batchresponse_3942662d-07b6-4e24-b466-fba5d37ca181--');
      }
    );
  },
  afterEach: function () {
    Ember.run(app, 'destroy');
    odataServerFake.restore();
  }
});

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);
let app;
let odataServerFake;

let fcForLayer1 = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'MultiPolygon', coordinates: [[[[5, 5], [5, 6], [6, 6], [6, 5]]]] } },
    { type: 'Feature', geometry: { type: 'MultiPolygon', coordinates: [[[[7, 1], [8, 1], [8, 2]]], [[[6, 2], [6, 3], [7, 3]]]] } },
  ],
};

let fcForLayer2 = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'MultiPolygon', coordinates: [[[[5, 5], [5, 6], [6, 6], [6, 5]]]] } },
    { type: 'Feature', geometry: { type: 'MultiPolygon', coordinates: [[[[7, 1], [8, 1], [8, 2]]], [[[6, 2], [6, 3], [7, 3]]]] } },
  ],
};

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
    [514059.321485393, 6507392.17766284], [513865.509562311, 6507418.6567982],
    [513839.790201802, 6507279.05179395], [514059.321485393, 6507392.17766284]
  ]]]
};

test('_coordsToPoints should return array of points to the power of 8', function(assert) {
  assert.expect(1);

  let featureLayer = L.geoJSON(geoJson32640).getLayers()[0].getLatLngs();

  let result = subject._coordsToPoints(featureLayer);

  assert.equal(result, [[[
    [51405932148539, 650739217766284], [51386550956231, 650741865679820],
    [51383979020180, 650727905179395], [51405932148539, 650739217766284]
  ]]]);
});

test('_pointsToCoords should return array of coordinates', function(assert) {
  assert.expect(1);

  let arr =  [[[
    [51405932148539, 650739217766284], [51386550956231, 650741865679820],
    [51383979020180, 650727905179395], [51405932148539, 650739217766284]
  ]]]

  let result = subject._coordsToPoints(arr);

  assert.equal(result, [[[
    [514059.32148539, 6507392.17766284], [513865.50956231, 6507418.65679820],
    [513839.79020180, 6507279.05179395], [514059.32148539, 6507392.17766284]
  ]]]);
});

test('_addToArrayPointsAndFeature should return points and features', function(assert) {
  assert.expect(2);
  let done = assert.async(1);

  let featureLayer = L.geoJSON(geoJson32640).getLayers()[0];

  let subject = mapApiMixinObject.create({
    _getPromisesLoadFeatures() {
      return Ember.RSVP.resolve([
        null,
        { options: { crs: crs32640 } },
        [featureLayer]]);
    }
  });

  let result = subject._addToArrayPointsAndFeature();

  result.then((arrayPointsAndFeature) => {
    assert.equal(arrayPointsAndFeature[0].arrPoints,
      [[[
        [51405932148539, 650739217766284], [51386550956231, 650741865679820],
        [51383979020180, 650727905179395], [51405932148539, 650739217766284]
      ]]]
    );
    assert.ok(arrayPointsAndFeature[0].features);
    done();
  });
});

test('differenceLayers should return the difference of layers', function(assert) {
  assert.expect(2);
  let done = assert.async(1);

  let featureLayer1 = L.geoJSON(fcForLayer1).getLayers();
  let featureLayer2 = L.geoJSON(fcForLayer2).getLayers();

  let subject = mapApiMixinObject.create({
    _getPromisesLoadFeatures(layer) {
      if (layer === '1') {
        return Ember.RSVP.resolve([
          null,
          { options: { crs: crs32640 } },
          [featureLayer1]]);
      } else {
        return Ember.RSVP.resolve([
          null,
          { options: { crs: crs32640 } },
          [featureLayer2]]);
      }
    }
  });

  let result = subject.differenceLayers('1', '2');

  result.then((diff) => {
    assert.equal(diff[0].diffFeatures.feature,
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [],
        }
      }
    );
    assert.equal(diff[0].area.toFixed(5), );
    assert.ok(diff.layerA);
    assert.ok(diff.layerB);
    done();
  });
});


