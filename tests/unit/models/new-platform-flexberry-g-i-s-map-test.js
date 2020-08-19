import { QUnit, moduleForModel, test } from 'ember-qunit';
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
let objWithCrs = {
  options: {
    crs: {
      code: crsName
    }
  }
};
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
}];

let objC = [{
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
}];

let objD = [{
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
  _getModelLayerFeatureStub.withArgs('f34ea73d-9f00-4f02-b02d-675d459c972b', ['0017782c-6f34-46b5-ac77-c0a65366c452']).returns(
    new Ember.RSVP.Promise((resolve, reject) => {
      resolve([null, objWithCrs, objA]);
    })
  );
  _getModelLayerFeatureStub.withArgs('63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', ['45df35c7-f292-44f8-b328-5fd4be739233']).returns(
    new Ember.RSVP.Promise((resolve, reject) => {
      resolve([null, objWithCrs, objB]);
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
  _getModelLayerFeatureStub.withArgs('f34ea73d-9f00-4f02-b02d-675d459c972b', ['0017782c-6f34-46b5-ac77-c0a65366c452']).returns(
    new Ember.RSVP.Promise((resolve, reject) => {
      resolve([null, objWithCrs, objA]);
    })
  );
  _getModelLayerFeatureStub.withArgs('63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', ['45df35c7-f292-44f8-b328-5fd4be739233']).returns(
    new Ember.RSVP.Promise((resolve, reject) => {
      resolve([null, objWithCrs, objB]);
    })
  );
  _getModelLayerFeatureStub.withArgs('63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', ['d633ea1d-eb32-423f-8663-a38abc7ba094']).returns(
    new Ember.RSVP.Promise((resolve, reject) => {
      resolve([null, objWithCrs, objC]);
    })
  );
  _getModelLayerFeatureStub.withArgs('63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', ['79fd98d0-52ae-44ae-b616-971768196ad8']).returns(
    new Ember.RSVP.Promise((resolve, reject) => {
      resolve([null, objWithCrs, objD]);
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
  _getModelLayerFeatureStub.withArgs('f34ea73d-9f00-4f02-b02d-675d459c972b', ['0017782c-6f34-46b5-ac77-c0a65366c452']).returns(
    new Ember.RSVP.Promise((resolve, reject) => {
      resolve([null, objWithCrs, objA]);
    })
  );

  _getModelLayerFeatureStub.withArgs('63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', ['45df35c7-f292-44f8-b328-5fd4be739233']).returns(
    new Ember.RSVP.Promise((resolve, reject) => {
      resolve([null, objWithCrs, objB]);
    })
  );
  _getModelLayerFeatureStub.withArgs('63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', ['d633ea1d-eb32-423f-8663-a38abc7ba094']).returns(
    new Ember.RSVP.Promise((resolve, reject) => {
      resolve([null, objWithCrs, objC]);
    })
  );

  map.getIntersectionArea('63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', '45df35c7-f292-44f8-b328-5fd4be739233',
  'f34ea73d-9f00-4f02-b02d-675d459c972b', ['0017782c-6f34-46b5-ac77-c0a65366c452']).then((e) => {
    assert.equal(e[0].area, 887494.3528438057, 'Intersect');
  });

  map.getIntersectionArea('63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', '79fd98d0-52ae-44ae-b616-971768196ad8',
  '63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', ['d633ea1d-eb32-423f-8663-a38abc7ba094']).then((e) => {
    assert.equal(e[0].area, 'Intersection not found', 'Not area intersect');
  }).catch((e) => {
    assert.ok(e, 'Not intersect');
  });
});

test('getRhumb', function(assert) {
  let map = this.subject();
  let _getModelLayerFeatureStub = sinon.stub(map, '_getModelLayerFeature');
  _getModelLayerFeatureStub.withArgs('63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', ['45df35c7-f292-44f8-b328-5fd4be739233']).returns(
    new Ember.RSVP.Promise((resolve, reject) => {
      resolve([null, null, objB]);
    })
  );

  map.getRhumb('63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', '45df35c7-f292-44f8-b328-5fd4be739233').then((e) => {
    let rhumb = [
      { rhumb: 'СВ', angle: 54.60899873173304, distance: 1847.0014093569546 },
      { rhumb: 'ЮВ', angle: 18.46239009698718, distance: 1002.3048264780921 },
      { rhumb: 'ЮЗ', angle: 86.26658375754084, distance: 1827.228836727564 }
    ];
    let result = {
      type: 'Polygon',
      crs: 'EPSG:4326',
      skip: 1,
      startPoint: L.latLng(58.72884, 55.80677),
      rhumbCoordinates: rhumb,
      coordinates: objB[0]._latlngs
    };

    assert.deepEqual(e, result, 'Rhumb');
  });
});

test('getDistanceBetweenObjects', function(assert) {
  let map = this.subject();
  let _getModelLayerFeatureStub = sinon.stub(map, '_getModelLayerFeature');
  _getModelLayerFeatureStub.withArgs('f34ea73d-9f00-4f02-b02d-675d459c972b', ['0017782c-6f34-46b5-ac77-c0a65366c452']).returns(
    new Ember.RSVP.Promise((resolve, reject) => {
      resolve([null, objWithCrs, L.geoJSON(objA[0].feature).getLayers()]);
    })
  );
  _getModelLayerFeatureStub.withArgs('63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', ['45df35c7-f292-44f8-b328-5fd4be739233']).returns(
    new Ember.RSVP.Promise((resolve, reject) => {
      resolve([null, objWithCrs, L.geoJSON(objB[0].feature).getLayers()]);
    })
  );

  map.getDistanceBetweenObjects('f34ea73d-9f00-4f02-b02d-675d459c972b', '0017782c-6f34-46b5-ac77-c0a65366c452',
  '63b3f6fb-3d4c-4acc-ab93-1b4fa31f9b0e', '45df35c7-f292-44f8-b328-5fd4be739233').then((e) => {
    assert.equal(e, 536.4476316355142, 'distance');
  });
});

test('getmulticircuitobject', function(assert) {
  let map = this.subject();
  let objA = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[[56.18425, 58.07197], [56.21068, 58.07197], [56.21068, 58.07987], [56.18425, 58.07987], [56.18425, 58.07197]]]
    },
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:4326'
      }
    }
  };
  let objB = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[[56.19712, 58.06770], [56.22322, 58.06770], [56.22322, 58.07551], [56.19712, 58.07551], [56.19712, 58.06770]]]
    },
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:4326'
      }
    }
  };
  let objC = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[[56.21644, 58.07864], [56.23197, 58.07864], [56.23197, 58.08608], [56.21644, 58.08608], [56.21644, 58.07864]]]
    },
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:4326'
      }
    }
  };
  let multiObject = {
    type: 'Feature',
    geometry: {
      type: 'MultiPolygon',
      coordinates: [[[[56.19712, 58.07197], [56.18425, 58.07197], [56.18425, 58.07987],
[56.21068, 58.07987], [56.21068, 58.07551], [56.19712, 58.07551], [56.19712, 58.07197]]],
[[[56.21068, 58.07551], [56.22322, 58.07551], [56.22322, 58.0677],
[56.19712, 58.0677], [56.19712, 58.07197], [56.21068, 58.07197], [56.21068, 58.07551]]],
[[[56.21644, 58.07864], [56.21644, 58.08608], [56.23197, 58.08608], [56.23197, 58.07864],
[56.21644, 58.07864]]]]
    },
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:4326'
      }
    }
  };

  let resultObj = map.createMulti([objA, objB, objC]);

  assert.deepEqual(resultObj, multiObject, 'multi object');
});

test('getMergedGeometry should return geoJson feature in EPSG:4326', function(assert) {
  assert.expect(1);
  let done = assert.async(1);

  let geoJson1Layer1 = {
    type: 'MultiPolygon',
    properties: {},
    coordinates:[[[
      [56.3252305984497, 58.6398609008772], [56.3221406936646, 58.6398609008771], [56.3221406936646, 58.6412232372209],
      [56.3252305984497, 58.6412232372209], [56.3252305984497, 58.6398609008772]
    ]]]
  };

  let geoJson2Layer1 = {
    type: 'MultiPolygon',
    properties: {},
    coordinates:[[[
      [56.3305950164795, 58.6398385670516], [56.3272905349732, 58.6398385670516], [56.3272905349732, 58.6412679030864],
      [56.3305950164795, 58.6412679030864], [56.3305950164795, 58.6398385670516]
    ]]]
  };

  let geoJson1Layer2 = {
    type: 'MultiPolygon',
    properties: {},
    coordinates: [[[
      [56.3273334503174, 58.6397715654894], [56.3273334503174, 58.6383198334056], [56.3220977783203, 58.6383198334056],
      [56.3220977783203, 58.6397715654894], [56.3273334503174, 58.6397715654894]
    ]]]
  };

  let geoJson2Layer2 = {
    type: 'MultiPolygon',
    properties: {},
    coordinates: [[[
      [56.331582069397, 58.6397827324254], [56.331582069397, 58.6383086660018], [56.3278484344483, 58.6383198334056],
      [56.3278484344483, 58.6397603985499], [56.331582069397, 58.6397827324254]
    ]]]
  };

  let geoJsonUnion = {
    type: 'Feature',
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        [[[56.3252305984497, 58.6398609008772], [56.3221406936646, 58.6398609008771], [56.3221406936646, 58.6412232372209],
        [56.3252305984497, 58.6412232372209], [56.3252305984497, 58.6398609008772]]],
        [[[56.3305950164795, 58.6398385670516], [56.3272905349732, 58.6398385670516], [56.3272905349732, 58.6412679030864],
        [56.3305950164795, 58.6412679030864], [56.3305950164795, 58.6398385670516]]],
        [[[56.3273334503174, 58.6397715654894], [56.3273334503174, 58.6383198334056], [56.3220977783203, 58.6383198334056],
        [56.3220977783203, 58.6397715654894], [56.3273334503174, 58.6397715654894]]],
        [[[56.331582069397, 58.6397827324254], [56.331582069397, 58.6383086660018], [56.3278484344483, 58.6383198334056],
        [56.3278484344483, 58.6397603985499], [56.331582069397, 58.6397827324254]]]
      ]
    },
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:4326'
      }
    }
  };

  let feature1Layer1 = L.geoJSON(geoJson1Layer1).getLayers()[0];
  feature1Layer1.options.crs = { code: 'EPSG:4326' };
  let feature2Layer1 = L.geoJSON(geoJson2Layer1).getLayers()[0];
  feature2Layer1.options.crs = { code: 'EPSG:4326' };

  let feature1Layer2 = L.geoJSON(geoJson1Layer2).getLayers()[0];
  feature1Layer2.options.crs = { code: 'EPSG:4326' };
  let feature2Layer2 = L.geoJSON(geoJson2Layer2).getLayers()[0];
  feature2Layer2.options.crs = { code: 'EPSG:4326' };

  let map = this.subject();
  let _getModelLayerFeatureStub = sinon.stub(map, '_getModelLayerFeature');
  _getModelLayerFeatureStub.withArgs('1', ['1', '2']).returns(
    new Ember.RSVP.Promise((resolve, reject) => {
      resolve([null, null, [feature1Layer1, feature2Layer1]]);
    })
  );

  _getModelLayerFeatureStub.withArgs('2', ['1', '2']).returns(
    new Ember.RSVP.Promise((resolve, reject) => {
      resolve([null, null, [feature1Layer2, feature2Layer2]]);
    })
  );

  let result = map.getMergedGeometry('1', ['1', '2'], '2', ['1', '2']);

  result.then((feature) => {
    QUnit.dump.maxDepth = 6;
    assert.deepEqual(feature, geoJsonUnion);
    done();
  });
});
