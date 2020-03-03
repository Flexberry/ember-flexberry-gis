import { moduleForModel, test } from 'ember-qunit';
import sinon from 'sinon';
import Ember from 'ember';

moduleForModel('new-platform-flexberry-g-i-s-map', 'Unit | Model | new-platform-flexberry-g-i-s-map', {
  // Specify the other units that are required for this test.
  needs: [
    'model:custom-inflector-rules',
    'model:new-platform-flexberry-g-i-s-layer-link',
    'model:new-platform-flexberry-g-i-s-layer-metadata',
    'model:new-platform-flexberry-g-i-s-link-metadata',
    'model:new-platform-flexberry-g-i-s-link-parameter',
    'model:new-platform-flexberry-g-i-s-map-layer',
    'model:new-platform-flexberry-g-i-s-map-object-setting',
    'model:new-platform-flexberry-g-i-s-map',
    'model:new-platform-flexberry-g-i-s-parameter-metadata',
    'service:map-api',
    'config:environment',
    'component:flexberry-map'
  ]
});

let crsName = 'EPSG:4326';
let objA = [{
  options: {
    crs: {
      code: crsName
    }
  },
  feature: {
    type: 'Feature',
    id: 'vydel_utverzhdeno_polygon.0017782c-6f34-46b5-ac77-c0a65366c452',
    geometry_name: 'shape',
    properties:{
      id: '141-17',
      lesnichestvo: 'Закамское',
      uchastkovoelesnichestvo: 'Чермозское(Чермозское)',
      nomerkvartala: '141',
      primarykey: '0017782c-6f34-46b5-ac77-c0a65366c452',
      area: 10
    },
    geometry:{
      type: 'MultiPolygon',
      coordinates: [[[[55.78205, 58.73614], [55.85209, 58.73935],  [55.85690, 58.71903], [55.78205, 58.71476], [55.78205, 58.73614]]]]
    }
  }
}];

let objB = [{
  options: {
    crs: {
      code: crsName
    }
  },
  feature: {
    type: 'Feature',
    id: 'kvartal_utverzhdeno_polygon.45df35c7-f292-44f8-b328-5fd4be739233',
    geometry_name: 'shape',
    properties:{
      nomer: '41',
      lesnichestvo: 'Закамское',
      uchastkovoelesnichestvo: 'Чермозское(Чермозское)',
      primarykey: '45df35c7-f292-44f8-b328-5fd4be739233',
      area: 20
    },
    geometry:{
      type: 'MultiPolygon',
      coordinates: [[[[55.80677, 58.72884], [55.83286, 58.73846],  [55.83836, 58.72991], [55.80677, 58.72884]]]]
    }
  },
  _latlngs: [[[L.latLng(58.72884, 55.80677), L.latLng(58.73846, 55.83286), L.latLng(58.72991, 55.83836)]]]
},
{
  options: {
    crs: {
      code: crsName
    }
  },
  feature: {
    type: 'Feature',
    id: 'kvartal_utverzhdeno_polygon.d633ea1d-eb32-423f-8663-a38abc7ba094',
    geometry_name: 'shape',
    properties:{
      nomer: '42',
      lesnichestvo: 'Закамское',
      uchastkovoelesnichestvo: 'Чермозское(Чермозское)',
      primarykey: 'd633ea1d-eb32-423f-8663-a38abc7ba094',
      area: 30
    },
    geometry:{
      type: 'MultiPolygon',
      coordinates: [[[[55.97843, 58.73810], [55.01448, 58.73329],  [55.98461, 58.72420], [55.97843, 58.73810]]]]
    }
  }
},
{
  options: {
    crs: {
      code: crsName
    }
  },
  feature: {
    type: 'Feature',
    id: 'kvartal_utverzhdeno_polygon.79fd98d0-52ae-44ae-b616-971768196ad8',
    geometry_name: 'shape',
    properties:{
      nomer: '43',
      lesnichestvo: 'Закамское',
      uchastkovoelesnichestvo: 'Чермозское(Чермозское)',
      primarykey: '79fd98d0-52ae-44ae-b616-971768196ad8',
      area: 30
    },
    geometry:{
      type: 'MultiPolygon',
      coordinates: [[[[55.85072, 58.68176], [55.88848, 58.67194],  [55.84316, 58.65391], [55.85072, 58.68176]]]]
    }
  }
}];

test('it exists', function(assert) {
  let model = this.subject();

  // let store = this.store();
  assert.ok(!!model);
});

test('substitution _getModelLayerFeature', function (assert) {
  let map = this.subject();
  let _getModelLayerFeatureStub = sinon.stub(map, '_getModelLayerFeature');
  _getModelLayerFeatureStub.withArgs(1).returns(objA);
  assert.ok(_getModelLayerFeatureStub(1));
});

test('isContainsObject', function(assert) {
  let map = this.subject();
  let _getModelLayerFeatureStub = sinon.stub(map, '_getModelLayerFeature');
  _getModelLayerFeatureStub.withArgs('f34ea73d-9f00-4f02-b02d-675d459c972b', '0017782c-6f34-46b5-ac77-c0a65366c452').returns(
    new Ember.RSVP.Promise((resolve, reject) => {
      resolve([null, null, objA[0]]);
    })
  );
  _getModelLayerFeatureStub.withArgs('63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', '45df35c7-f292-44f8-b328-5fd4be739233').returns(
    new Ember.RSVP.Promise((resolve, reject) => {
      resolve([null, null, objB[0]]);
    })
  );

  map.isContainsObject('f34ea73d-9f00-4f02-b02d-675d459c972b', '0017782c-6f34-46b5-ac77-c0a65366c452',
  '63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', '45df35c7-f292-44f8-b328-5fd4be739233').then((e) => {
    assert.ok(e, 'Contains');
  });

  map.isContainsObject('63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', '45df35c7-f292-44f8-b328-5fd4be739233',
  'f34ea73d-9f00-4f02-b02d-675d459c972b', '0017782c-6f34-46b5-ac77-c0a65366c452').then((e) => {
    assert.notOk(e, 'Not contains');
  });
});

test('getAreaExtends', function(assert) {
  let map = this.subject();
  let _getModelLayerFeatureStub = sinon.stub(map, '_getModelLayerFeature');
  _getModelLayerFeatureStub.withArgs('f34ea73d-9f00-4f02-b02d-675d459c972b', '0017782c-6f34-46b5-ac77-c0a65366c452').returns(
    new Ember.RSVP.Promise((resolve, reject) => {
      resolve([null, null, objA[0]]);
    })
  );
  _getModelLayerFeatureStub.withArgs('63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', '45df35c7-f292-44f8-b328-5fd4be739233').returns(
    new Ember.RSVP.Promise((resolve, reject) => {
      resolve([null, null, objB[0]]);
    })
  );
  _getModelLayerFeatureStub.withArgs('63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', 'd633ea1d-eb32-423f-8663-a38abc7ba094').returns(
    new Ember.RSVP.Promise((resolve, reject) => {
      resolve([null, null, objB[1]]);
    })
  );
  _getModelLayerFeatureStub.withArgs('63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', '79fd98d0-52ae-44ae-b616-971768196ad8').returns(
    new Ember.RSVP.Promise((resolve, reject) => {
      resolve([null, null, objB[2]]);
    })
  );

  map.getAreaExtends('f34ea73d-9f00-4f02-b02d-675d459c972b', '0017782c-6f34-46b5-ac77-c0a65366c452',
  '63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', '45df35c7-f292-44f8-b328-5fd4be739233').then((e) => {
    assert.equal(e, 0, 'B<A and intersect');
  });

  map.getAreaExtends('63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', '45df35c7-f292-44f8-b328-5fd4be739233',
  'f34ea73d-9f00-4f02-b02d-675d459c972b', '0017782c-6f34-46b5-ac77-c0a65366c452').then((e) => {
    assert.equal(e, 8887057.32835752, 'B>A and intesect');
  });

  map.getAreaExtends('63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', '79fd98d0-52ae-44ae-b616-971768196ad8',
  '63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', 'd633ea1d-eb32-423f-8663-a38abc7ba094').then((e) => {
    assert.equal(e, 43187392.82526295, 'Not intersect');
  });
});

test('getIntersectionArea', function(assert) {
  let map = this.subject();
  let _getModelLayerFeatureStub = sinon.stub(map, '_getModelLayerFeature');
  _getModelLayerFeatureStub.withArgs('f34ea73d-9f00-4f02-b02d-675d459c972b', '0017782c-6f34-46b5-ac77-c0a65366c452').returns(
    new Ember.RSVP.Promise((resolve, reject) => {
      resolve([null, null, objA[0]]);
    })
  );
  _getModelLayerFeatureStub.withArgs('63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', '45df35c7-f292-44f8-b328-5fd4be739233').returns(
    new Ember.RSVP.Promise((resolve, reject) => {
      resolve([null, null, objB[0]]);
    })
  );
  _getModelLayerFeatureStub.withArgs('63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', 'd633ea1d-eb32-423f-8663-a38abc7ba094').returns(
    new Ember.RSVP.Promise((resolve, reject) => {
      resolve([null, null, objB[1]]);
    })
  );

  map.getIntersectionArea('63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', '45df35c7-f292-44f8-b328-5fd4be739233',
  'f34ea73d-9f00-4f02-b02d-675d459c972b', '0017782c-6f34-46b5-ac77-c0a65366c452').then((e) => {
    assert.equal(e.area, 887494.3528438057, 'Intersect');
  });

  map.getIntersectionArea('63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', '79fd98d0-52ae-44ae-b616-971768196ad8',
  '63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', 'd633ea1d-eb32-423f-8663-a38abc7ba094').then((e) => {
    assert.equal(e.area, 0, 'Not area intersect');
  }).catch((e) => {
    assert.ok(e, 'Not intersect');
  });

  /* Надо как-то подмешать mapApi.getFromApi('serviceLayer')
  map.getIntersectionArea('63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', '45df35c7-f292-44f8-b328-5fd4be739233',
  'f34ea73d-9f00-4f02-b02d-675d459c972b', '0017782c-6f34-46b5-ac77-c0a65366c452', true).then((e) => {
    assert.equal(e.area, 887494.3528438057, 'Intersect and show on map');
  });*/
});

test('getRhumb', function(assert) {
  let map = this.subject();
  let _getModelLayerFeatureStub = sinon.stub(map, '_getModelLayerFeature');
  _getModelLayerFeatureStub.withArgs('63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', '45df35c7-f292-44f8-b328-5fd4be739233').returns(
    new Ember.RSVP.Promise((resolve, reject) => {
      resolve([null, null, objB[0]]);
    })
  );

  map.getRhumb('63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', '45df35c7-f292-44f8-b328-5fd4be739233').then((e) => {
    let rhumb = [
      { rib: '1;2', rhumb: 'СВ;54.60899873173304', distance: 1847.0014093569546 },
      { rib: '2;3', rhumb: 'ЮВ;18.46239009698718', distance: 1002.3048264780921 },
      { rib: '3;1', rhumb: 'ЮЗ;86.26658375754084', distance: 1827.228836727564 }
    ];
    let result = {
      startPoint: L.latLng(58.72884, 55.80677),
      rhumbCoordinates: rhumb,
      coordinates: objB[0]._latlngs
    };

    assert.deepEqual(e, result, 'Rhumb');
  });
});
