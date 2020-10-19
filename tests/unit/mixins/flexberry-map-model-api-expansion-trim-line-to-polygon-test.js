import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api-expansion';

module('Unit | Mixin | test method trimLineToPolygon');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);

let aGeoJson = {
  "type": "Feature",
  "properties": {},
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [[56.184253, 58.071975],
        [56.210689,58.071975],
        [56.2106895, 58.079873],
        [56.184253, 58.079873],
        [56.184253,58.071975]]
    ]
  },
  "crs": {
    "type": "name",
    "properties": {
      "name": "EPSG:4326"
    }
  }
};
let bGeoJson = {
  "type": "Feature",
  "properties": {},
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [56.17, 58.071975],
      [56.22, 58.071975]
    ]
  },
  "crs": {
    "type": "name",
    "properties": {
      "name": "EPSG:4326"
    }
  }
};

test('test method trimLineToPolygon with EPSG:4326', function(assert) {
  assert.expect(2);
  let done = assert.async(1);
  let subject = mapApiMixinObject.create({});

  let promise = subject.trimLineToPolygon(aGeoJson, bGeoJson);

  assert.ok(promise instanceof Ember.RSVP.Promise);
  promise.then((result) => {
    assert.deepEqual(result.geometry.coordinates, [[56.184253, 58.071975], [56.210689, 58.071975]]);
    done();
  });
});

test('test method trimLineToPolygon. Error different crs', function(assert) {
  assert.expect(2);
  let done = assert.async(1);
  bGeoJson.geometry.coordinates = [[56.17, 56], [56.22, 56]];
  let subject = mapApiMixinObject.create({});

  let promise = subject.trimLineToPolygon(aGeoJson, bGeoJson);

  assert.ok(promise instanceof Ember.RSVP.Promise);
  promise.then().catch((result) => {
    assert.equal(result, 'objects doesn\' not intersertc');
    bGeoJson.geometry.coordinates = [[56.17, 58.071975], [56.22, 58.071975]];
    done();
  });
});

test('test method trimLineToPolygon. Error different crs', function(assert) {
  assert.expect(2);
  let done = assert.async(1);
  aGeoJson.crs.properties.name = "EPSG:3395";
  let subject = mapApiMixinObject.create({});

  let promise = subject.trimLineToPolygon(aGeoJson, bGeoJson);

  assert.ok(promise instanceof Ember.RSVP.Promise);
  promise.then().catch((result) => {
    assert.equal(result, 'CRS mismatch. Objects must have the same crs');
    aGeoJson.crs.properties.name = "EPSG:4326";
    done();
  });
});
