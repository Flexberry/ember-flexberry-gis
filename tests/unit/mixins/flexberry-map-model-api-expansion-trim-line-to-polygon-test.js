import { Promise } from 'rsvp';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api-expansion';

module('Unit | Mixin | test method trimLineToPolygon', function () {
  const mapApiMixinObject = EmberObject.extend(FlexberryMapModelApiMixin);

  const aGeoJson = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        [[56.2, 58.1],
          [56.3, 58.1],
          [56.3, 58.2],
          [56.2, 58.2],
          [56.2, 58.1]]
      ],
    },
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:4326',
      },
    },
  };
  const bGeoJson = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: [
        [56.1, 58.1],
        [56.4, 58.1]
      ],
    },
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:4326',
      },
    },
  };

  test('test method trimLineToPolygon with EPSG:4326', function (assert) {
    assert.expect(2);
    const done = assert.async(1);
    const subject = mapApiMixinObject.create({});

    const promise = subject.trimLineToPolygon(aGeoJson, bGeoJson);

    assert.ok(promise instanceof Promise);
    promise.then((result) => {
      assert.deepEqual(result.geometry.coordinates, [[56.2, 58.1], [56.3, 58.1]]);
      done();
    });
  });

  test('test method trimLineToPolygon. Error objects does\' not intersect', function (assert) {
    assert.expect(2);
    const done = assert.async(1);
    bGeoJson.geometry.coordinates = [[56.1, 56], [56.4, 56]];
    const subject = mapApiMixinObject.create({});

    const promise = subject.trimLineToPolygon(aGeoJson, bGeoJson);

    assert.ok(promise instanceof Promise);
    promise.then().catch((result) => {
      assert.equal(result.message, 'objects does\' not intersect');
      bGeoJson.geometry.coordinates = [[56.1, 58.1], [56.4, 58.1]];
      done();
    });
  });

  test('test method trimLineToPolygon. Error different crs', function (assert) {
    assert.expect(2);
    const done = assert.async(1);
    aGeoJson.crs.properties.name = 'EPSG:3395';
    const subject = mapApiMixinObject.create({});

    const promise = subject.trimLineToPolygon(aGeoJson, bGeoJson);

    assert.ok(promise instanceof Promise);
    promise.then().catch((result) => {
      assert.equal(result.message, 'CRS mismatch. Objects must have the same crs');
      aGeoJson.crs.properties.name = 'EPSG:4326';
      done();
    });
  });
});
