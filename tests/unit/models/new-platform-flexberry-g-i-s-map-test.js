import { moduleForModel, test } from 'ember-qunit';
import sinon from 'sinon';
import Ember from 'ember';
import { geometryToJsts } from 'ember-flexberry-gis/utils/layer-to-jsts';

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

test('getmulticircuitobject with difference', function(assert) {
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

  let resultObj = map.createMulti([objA, objB, objC], false);

  assert.deepEqual(resultObj, multiObject, 'multi object');
});

test('getmulticircuitobject with union', function(assert) {
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
      coordinates: [[[[56.19712, 58.07197], [56.18425, 58.07197], [56.18425, 58.07987], [56.21068, 58.07987], [56.21068, 58.07551],
  [56.22322, 58.07551], [56.22322, 58.0677], [56.19712, 58.0677], [56.19712, 58.07197]]],
  [[[56.21644, 58.07864], [56.21644, 58.08608], [56.23197, 58.08608], [56.23197, 58.07864], [56.21644, 58.07864]]]]
    },
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:4326'
      }
    }
  };

  let resultObj = map.createMulti([objA, objB, objC], true);

  assert.deepEqual(resultObj, multiObject, 'multi object');
});

test('getMergedGeometry with difference should return geoJson feature in EPSG:4326', function(assert) {
  assert.expect(1);
  let done = assert.async(1);

  let geoJson1Layer1 = {
    type: 'MultiPolygon',
    properties: {},
    coordinates:[[[
      [1.001, 2.002], [1.005, 2.002], [1.003, 2.003],
      [1.001, 2.003], [1.001, 2.002]
    ]]]
  };

  let geoJson2Layer1 = {
    type: 'MultiPolygon',
    properties: {},
    coordinates:[[[
      [1.003, 2.0025], [1.005, 2.0025], [1.003, 2.003],
      [1.001, 2.003], [1.003, 2.0025]
    ]]]
  };

  let geoJson1Layer2 = {
    type: 'MultiPolygon',
    properties: {},
    coordinates: [[[
      [1.001, 2.0033], [1.003, 2.0033], [1.005, 2.004],
      [1.001, 2.004], [1.001, 2.0033]
    ]]]
  };

  let geoJson2Layer2 = {
    type: 'MultiPolygon',
    properties: {},
    coordinates: [[[
      [1.001, 2.0033], [1.003, 2.0033], [1.003, 2.0035],
      [1.001, 2.0035], [1.001, 2.0033]
    ]]]
  };

  let geoJsonUnion = {
    type: 'Feature',
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        [[[1.0039999999999998, 2.0025], [1.005, 2.002], [1.001, 2.002], [1.001, 2.003],
        [1.003, 2.0025], [1.0039999999999998, 2.0025]]],
        [[[1.003, 2.003], [1.005, 2.0025], [1.0039999999999998, 2.0025], [1.003, 2.003]]],
        [[[1.001, 2.0035], [1.001, 2.004], [1.005, 2.004], [1.003, 2.0033], [1.003, 2.0035], [1.001, 2.0035]]]
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

  feature1Layer1.toJsts = function () { };

  let toJstsStub1 = sinon.stub(feature1Layer1, 'toJsts');
  let objJsts1 = geometryToJsts(geoJson1Layer1);
  objJsts1.setSRID(4326);
  toJstsStub1.returns(objJsts1);

  feature2Layer1.toJsts = function () { };

  let toJstsStub2 = sinon.stub(feature2Layer1, 'toJsts');
  let objJsts2 = geometryToJsts(geoJson2Layer1);
  objJsts2.setSRID(4326);
  toJstsStub2.returns(objJsts2);

  feature1Layer2.toJsts = function () { };

  let toJstsStub3 = sinon.stub(feature1Layer2, 'toJsts');
  let objJsts3 = geometryToJsts(geoJson1Layer2);
  objJsts3.setSRID(4326);
  toJstsStub3.returns(objJsts3);

  feature2Layer2.toJsts = function () { };

  let toJstsStub4 = sinon.stub(feature2Layer2, 'toJsts');
  let objJsts4 = geometryToJsts(geoJson2Layer2);
  objJsts4.setSRID(4326);
  toJstsStub4.returns(objJsts4);

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
    assert.deepEqual(feature, geoJsonUnion);
    done();
    _getModelLayerFeatureStub.restore();
  });
});

test('getMergedGeometry with union should return geoJson feature in EPSG:4326', function(assert) {
  assert.expect(1);
  let done = assert.async(1);

  let geoJson1Layer1 = {
    type: 'MultiPolygon',
    properties: {},
    coordinates:[[[
      [1.001, 2.002], [1.005, 2.002], [1.003, 2.003],
      [1.001, 2.003], [1.001, 2.002]
    ]]]
  };

  let geoJson2Layer1 = {
    type: 'MultiPolygon',
    properties: {},
    coordinates:[[[
      [1.003, 2.0025], [1.005, 2.0025], [1.003, 2.003],
      [1.001, 2.003], [1.003, 2.0025]
    ]]]
  };

  let geoJson1Layer2 = {
    type: 'MultiPolygon',
    properties: {},
    coordinates: [[[
      [1.001, 2.0033], [1.003, 2.0033], [1.005, 2.004],
      [1.001, 2.004], [1.001, 2.0033]
    ]]]
  };

  let geoJson2Layer2 = {
    type: 'MultiPolygon',
    properties: {},
    coordinates: [[[
      [1.001, 2.0033], [1.003, 2.0033], [1.003, 2.0035],
      [1.001, 2.0035], [1.001, 2.0033]
    ]]]
  };

  let geoJsonUnion = {
    type: 'Feature',
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        [[[1.0039999999999998, 2.0025], [1.005, 2.002], [1.001, 2.002],
        [1.001, 2.003], [1.003, 2.003], [1.005, 2.0025], [1.0039999999999998, 2.0025]]],
        [[[1.003, 2.0033], [1.001, 2.0033], [1.001, 2.0035], [1.001, 2.004], [1.005, 2.004], [1.003, 2.0033]]]
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

  feature1Layer1.toJsts = function () { };

  let toJstsStub1 = sinon.stub(feature1Layer1, 'toJsts');
  let objJsts1 = geometryToJsts(geoJson1Layer1);
  objJsts1.setSRID(4326);
  toJstsStub1.returns(objJsts1);

  feature2Layer1.toJsts = function () { };

  let toJstsStub2 = sinon.stub(feature2Layer1, 'toJsts');
  let objJsts2 = geometryToJsts(geoJson2Layer1);
  objJsts2.setSRID(4326);
  toJstsStub2.returns(objJsts2);

  feature1Layer2.toJsts = function () { };

  let toJstsStub3 = sinon.stub(feature1Layer2, 'toJsts');
  let objJsts3 = geometryToJsts(geoJson1Layer2);
  objJsts3.setSRID(4326);
  toJstsStub3.returns(objJsts3);

  feature2Layer2.toJsts = function () { };

  let toJstsStub4 = sinon.stub(feature2Layer2, 'toJsts');
  let objJsts4 = geometryToJsts(geoJson2Layer2);
  objJsts4.setSRID(4326);
  toJstsStub4.returns(objJsts4);

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

  let result = map.getMergedGeometry('1', ['1', '2'], '2', ['1', '2'], true);

  result.then((feature) => {
    assert.deepEqual(feature, geoJsonUnion);
    done();
    _getModelLayerFeatureStub.restore();
  });
});

test('getMergedGeometry with geometry reducer and difference should return geoJson feature in EPSG:4326', function(assert) {
  assert.expect(1);
  let done = assert.async(1);

  let geoJson1Layer1 = {
    type: 'MultiPolygon',
    properties: {},
    coordinates:[[[
      [1.001000012, 2.002004235], [1.005003650, 2.00203053], [1.003627235, 2.003363777],
      [1.001000023, 2.0030305], [1.001000012, 2.002004235]
    ]]]
  };

  let geoJson2Layer1 = {
    type: 'MultiPolygon',
    properties: {},
    coordinates:[[[
      [1.003343536, 2.0025433434], [1.005343434, 2.002534343536], [1.00334653476, 2.003436347347],
      [1.0014545, 2.003353463476], [1.003343536, 2.0025433434]
    ]]]
  };

  let geoJson1Layer2 = {
    type: 'MultiPolygon',
    properties: {},
    coordinates: [[[
      [1.001346347, 2.00332365236], [1.003353456, 2.0033234234], [1.0051236347, 2.00434563475],
      [1.0013456374, 2.0042342365], [1.001346347, 2.00332365236]
    ]]]
  };

  let geoJson2Layer2 = {
    type: 'MultiPolygon',
    properties: {},
    coordinates: [[[
      [1.001346347, 2.00332365236], [1.003346346, 2.0033235263], [1.003234234, 2.00353463456],
      [1.001345345, 2.00353453467], [1.001346347, 2.00332365236]
    ]]]
  };

  let geoJsonUnion = {
    type: 'Feature',
    geometry: {
      type: 'MultiPolygon',
      coordinates:
        [[[[1.0045, 2.0025], [1.005, 2.002], [1.001, 2.002], [1.001, 2.003], [1.0019941176470588, 2.0031529411764706],
        [1.0033, 2.0025], [1.0045, 2.0025]]], [[[1.0035593750000005, 2.0033937500000003], [1.0036, 2.0034],
        [1.0038454545454545, 2.0031545454545454], [1.0034529745042493, 2.0033311614730875],
        [1.0035593750000005, 2.0033937500000003]]], [[[1.0038454545454545, 2.0031545454545454],
        [1.0053, 2.0025], [1.0045, 2.0025], [1.0038454545454545, 2.0031545454545454]]],
        [[[1.0019941176470588, 2.0031529411764706], [1.0015, 2.0034], [1.00325, 2.0034],
        [1.0032750000000001, 2.0033499999999997], [1.0019941176470588, 2.0031529411764706]]],
        [[[1.0013, 2.0035], [1.0013, 2.0042], [1.0051, 2.0043], [1.0035593750000005, 2.0033937500000003],
        [1.003376433121019, 2.0033656050955413], [1.0033, 2.0034], [1.00325, 2.0034],
        [1.0032, 2.0035], [1.0013, 2.0035]]], [[[1.0034529745042493, 2.0033311614730875],
        [1.0034, 2.0033], [1.0033, 2.0033], [1.0032750000000001, 2.0033499999999997],
        [1.003376433121019, 2.0033656050955413], [1.0034529745042493, 2.0033311614730875]]]]
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

  feature1Layer1.toJsts = function () { };

  let toJstsStub1 = sinon.stub(feature1Layer1, 'toJsts');
  let objJsts1 = geometryToJsts(geoJson1Layer1, 10000);
  objJsts1.setSRID(4326);
  toJstsStub1.returns(objJsts1);

  feature2Layer1.toJsts = function () { };

  let toJstsStub2 = sinon.stub(feature2Layer1, 'toJsts');
  let objJsts2 = geometryToJsts(geoJson2Layer1, 10000);
  objJsts2.setSRID(4326);
  toJstsStub2.returns(objJsts2);

  feature1Layer2.toJsts = function () { };

  let toJstsStub3 = sinon.stub(feature1Layer2, 'toJsts');
  let objJsts3 = geometryToJsts(geoJson1Layer2, 10000);
  objJsts3.setSRID(4326);
  toJstsStub3.returns(objJsts3);

  feature2Layer2.toJsts = function () { };

  let toJstsStub4 = sinon.stub(feature2Layer2, 'toJsts');
  let objJsts4 = geometryToJsts(geoJson2Layer2, 10000);
  objJsts4.setSRID(4326);
  toJstsStub4.returns(objJsts4);

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

  let result = map.getMergedGeometry('1', ['1', '2'], '2', ['1', '2'], false, 10000);

  result.then((feature) => {
    assert.deepEqual(feature, geoJsonUnion);
    done();
    _getModelLayerFeatureStub.restore();
  });
});

test('getMergedGeometry with geometry reducer and union should return geoJson feature in EPSG:4326', function(assert) {
  assert.expect(1);
  let done = assert.async(1);

  let geoJson1Layer1 = {
    type: 'MultiPolygon',
    properties: {},
    coordinates:[[[
      [1.001000012, 2.002004235], [1.005003650, 2.00203053], [1.003627235, 2.003363777],
      [1.001000023, 2.0030305], [1.001000012, 2.002004235]
    ]]]
  };

  let geoJson2Layer1 = {
    type: 'MultiPolygon',
    properties: {},
    coordinates:[[[
      [1.003343536, 2.0025433434], [1.005343434, 2.002534343536], [1.00334653476, 2.003436347347],
      [1.0014545, 2.003353463476], [1.003343536, 2.0025433434]
    ]]]
  };

  let geoJson1Layer2 = {
    type: 'MultiPolygon',
    properties: {},
    coordinates: [[[
      [1.001346347, 2.00332365236], [1.003353456, 2.0033234234], [1.0051236347, 2.00434563475],
      [1.0013456374, 2.0042342365], [1.001346347, 2.00332365236]
    ]]]
  };

  let geoJson2Layer2 = {
    type: 'MultiPolygon',
    properties: {},
    coordinates: [[[
      [1.001346347, 2.00332365236], [1.003346346, 2.0033235263], [1.003234234, 2.00353463456],
      [1.001345345, 2.00353453467], [1.001346347, 2.00332365236]
    ]]]
  };

  let geoJsonUnion = {
    type: 'Feature',
    geometry: {
      type: 'MultiPolygon',
      coordinates:
        [[[[1.0045, 2.0025], [1.005, 2.002], [1.001, 2.002], [1.001, 2.003], [1.0019941176470588, 2.0031529411764706],
        [1.0017000000000005, 2.0033], [1.0013, 2.0033], [1.0013, 2.0035], [1.0013, 2.0042], [1.0051, 2.0043],
        [1.0035593750000005, 2.0033937500000003], [1.0036, 2.0034], [1.0038454545454545, 2.0031545454545454],
        [1.0053, 2.0025], [1.0045, 2.0025]]]]
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

  feature1Layer1.toJsts = function () { };

  let toJstsStub1 = sinon.stub(feature1Layer1, 'toJsts');
  let objJsts1 = geometryToJsts(geoJson1Layer1, 10000);
  objJsts1.setSRID(4326);
  toJstsStub1.returns(objJsts1);

  feature2Layer1.toJsts = function () { };

  let toJstsStub2 = sinon.stub(feature2Layer1, 'toJsts');
  let objJsts2 = geometryToJsts(geoJson2Layer1, 10000);
  objJsts2.setSRID(4326);
  toJstsStub2.returns(objJsts2);

  feature1Layer2.toJsts = function () { };

  let toJstsStub3 = sinon.stub(feature1Layer2, 'toJsts');
  let objJsts3 = geometryToJsts(geoJson1Layer2, 10000);
  objJsts3.setSRID(4326);
  toJstsStub3.returns(objJsts3);

  feature2Layer2.toJsts = function () { };

  let toJstsStub4 = sinon.stub(feature2Layer2, 'toJsts');
  let objJsts4 = geometryToJsts(geoJson2Layer2, 10000);
  objJsts4.setSRID(4326);
  toJstsStub4.returns(objJsts4);

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

  let result = map.getMergedGeometry('1', ['1', '2'], '2', ['1', '2'], true, 10000);

  result.then((feature) => {
    assert.deepEqual(feature, geoJsonUnion);
    done();
    _getModelLayerFeatureStub.restore();
  });
});
