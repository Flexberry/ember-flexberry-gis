import { createObjectRhumb } from 'ember-flexberry-gis/utils/rhumb-operations';
import crsFactory4326 from 'ember-flexberry-gis/coordinate-reference-systems/epsg-4326';
import { module, test } from 'qunit';
import sinon from 'sinon';
import Ember from 'ember';

module('Unit | Utility | rhumb operations');

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

test('test method createObjectRhumb for Polygon with startPoint in EPSG:32640', function(assert) {
  //Arrange
  let testObj = {
    type:'Polygon',
    startPoint:[20, 20],
    crs:'EPSG:32640',
    skip:0,
    points:[
      { rhumb:'SE', angle:0, distance:10 },
      { rhumb:'NE', angle:90, distance:10 },
      { rhumb:'NW', angle:0, distance:10 },
      { rhumb:'NW', angle:90, distance:10 }
    ]
  };

  let resObj = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [[20, 20], [20, 10], [30, 10], [30, 20], [20, 20]]
      ]
    },
    properties: undefined,
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:32640'
      }
    }
  };

  let ownerStub = sinon.stub(Ember, 'getOwner');
  ownerStub.returns({
    knownForType() {
      return {
        'epsg4326': crsFactory32640,
        'epsg32640': crsFactory4326
      };
    }
  });

  //Act
  let result = createObjectRhumb(testObj, crs32640);

  //Assert
  assert.deepEqual(result, resObj);
  ownerStub.restore();
});

test('test method createObjectRhumb for Polygon with startPoint in EPSG:4326', function(assert) {
  //Arrange
  let testObj = {
    type: 'Polygon',
    startPoint: [7, 3],
    crs: 'EPSG:4326',
    skip: 0,
    points:[
      { rhumb: 'SE', angle: 0, distance: 1000 },
      { rhumb: 'NE', angle: 90, distance: 1000 },
      { rhumb: 'NW', angle: 0, distance: 1000 },
      { rhumb: 'NW', angle: 90, distance: 1000 }
    ]
  };

  let resObj = {
    type: 'Feature',
    properties: undefined,
    geometry: {
      type: 'Polygon',
      coordinates: [
        [[-5936517.120908923, 517670.4443068467], [-5936517.120908923, 516670.4443068467], [-5935517.120908923, 516670.4443068467],
        [-5935517.120908923, 517670.4443068467], [-5936517.120908923, 517670.4443068467]]
      ]
    },
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:32640'
      }
    }
  };

  let ownerStub = sinon.stub(Ember, 'getOwner');
  ownerStub.returns({
    knownForType() {
      return {
        'epsg4326': crsFactory32640,
        'epsg32640': crsFactory4326
      };
    }
  });

  //Act
  let result = createObjectRhumb(testObj, crs32640);

  //Assert
  assert.deepEqual(result, resObj);
  ownerStub.restore();
});

test('test method createObjectRhumb for LineString with startPoint in EPSG:32640', function(assert) {
  //Arrange
  let testObj = {
    type:'LineString',
    startPoint:[20, 20],
    crs:'EPSG:32640',
    skip:0,
    points:[
      { rhumb:'SE', angle:0, distance:10 },
      { rhumb:'NE', angle:90, distance:10 },
      { rhumb:'NW', angle:0, distance:10 }
    ]
  };

  let resObj = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [
        [20, 20], [20, 10], [30, 10], [30, 20]
      ]
    },
    properties: undefined,
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:32640'
      }
    }
  };

  let ownerStub = sinon.stub(Ember, 'getOwner');
  ownerStub.returns({
    knownForType() {
      return {
        'epsg4326': crsFactory32640,
        'epsg32640': crsFactory4326
      };
    }
  });

  //Act
  let result = createObjectRhumb(testObj, crs32640);

  //Assert
  assert.deepEqual(result, resObj);
  ownerStub.restore();
});

test('test method createObjectRhumb for LineString with startPoint in EPSG:4326', function(assert) {
  //Arrange
  let testObj = {
    type: 'LineString',
    startPoint: [7, 3],
    crs: 'EPSG:4326',
    skip: 0,
    points:[
      { rhumb: 'SE', angle: 0, distance: 1000 },
      { rhumb: 'NE', angle: 90, distance: 1000 },
      { rhumb: 'NW', angle: 0, distance: 1000 }
    ]
  };

  let resObj = {
    type: 'Feature',
    properties: undefined,
    geometry: {
      type: 'LineString',
      coordinates: [
        [-5936517.120908923, 517670.4443068467], [-5936517.120908923, 516670.4443068467], [-5935517.120908923, 516670.4443068467],
        [-5935517.120908923, 517670.4443068467]
      ]
    },
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:32640'
      }
    }
  };

  let ownerStub = sinon.stub(Ember, 'getOwner');
  ownerStub.returns({
    knownForType() {
      return {
        'epsg4326': crsFactory32640,
        'epsg32640': crsFactory4326
      };
    }
  });

  //Act
  let result = createObjectRhumb(testObj, crs32640);

  //Assert
  assert.deepEqual(result, resObj);
  ownerStub.restore();
});
