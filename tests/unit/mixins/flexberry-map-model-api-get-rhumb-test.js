import Ember from 'ember';
import { module, test } from 'qunit';
import FlexberryMapModelApiMixin from 'ember-flexberry-gis/mixins/flexberry-map-model-api';

module('Unit | Mixin | method get rhumb');

let mapApiMixinObject = Ember.Object.extend(FlexberryMapModelApiMixin);

test('test method getRhumb for LineString', function (assert) {
  //Arrange
  let testLiseString = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [
          [3, 7], [3, 3], [8, 3]
      ]
    }
  };

  const resObj = [{
    type: 'LineString',
    startPoint: [3, 7],
    crs: 'EPSG:4326',
    skip: 0,
    points:
    [
        {
          rhumb: 'SE',
          angle: 0,
          distance: 4
        },
        {
          rhumb: 'SE',
          angle: 90,
          distance: 5
        }
    ]
  }];
  let subject = mapApiMixinObject.create();

  //Act
  let rhumbs = subject.getRhumb(testLiseString, 'EPSG:4326');

  //Assert
  assert.deepEqual(rhumbs, resObj);
});

test('test method getRhumb for MultiLineString', function (assert) {
  //Arrange
  let testLiseString = {
    type: 'Feature',
    geometry: {
      type: 'MultiLineString',
      coordinates: [
          [[3, 7], [3, 3], [8, 3]],
          [[6, 9], [6, 5], [10, 5]]
      ]
    }
  };

  const resObj = [{
    type: 'LineString',
    startPoint: [3, 7],
    crs: 'EPSG:4326',
    skip: 0,
    points:
    [
        {
          rhumb: 'SE',
          angle: 0,
          distance: 4
        },
        {
          rhumb: 'SE',
          angle: 90,
          distance: 5
        }
    ]
  },
  {
    type: 'LineString',
    startPoint: [6, 9],
    crs: 'EPSG:4326',
    skip: 0,
    points:
    [
        {
          rhumb: 'SE',
          angle: 0,
          distance: 4
        },
        {
          rhumb: 'SE',
          angle: 90,
          distance: 4
        }
    ]
  }];
  let subject = mapApiMixinObject.create();

  //Act
  let rhumbs = subject.getRhumb(testLiseString, 'EPSG:4326');

  //Assert
  assert.deepEqual(rhumbs, resObj);
});

test('test method getRhumb for Polygon without hole', function (assert) {
  //Arrange
  let testLiseString = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
          [[3, 7], [3, 3], [8, 3], [8, 7], [3, 7]]
      ]
    }
  };

  const resObj = [{
    type: 'Polygon',
    startPoint: [3, 7],
    crs: 'EPSG:4326',
    skip: 0,
    hole: false,
    points:
    [
        {
          rhumb: 'SE',
          angle: 0,
          distance: 4
        },
        {
          rhumb: 'SE',
          angle: 90,
          distance: 5
        },
        {
          rhumb: 'NE',
          angle: 0,
          distance: 4
        },
        {
          rhumb: 'NW',
          angle: 90,
          distance: 5
        }
    ]
  }];
  let subject = mapApiMixinObject.create();

  //Act
  let rhumbs = subject.getRhumb(testLiseString, 'EPSG:4326');

  //Assert
  assert.deepEqual(rhumbs, resObj);
});

test('test method getRhumb for Polygon with hole', function (assert) {
  //Arrange
  let testLiseString = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
          [[3, 7], [3, 3], [8, 3], [8, 7], [3, 7]],
          [[4, 4], [5, 4], [5, 5], [4, 5], [4, 4]]
      ]
    }
  };

  const resObj = [{
    type: 'Polygon',
    startPoint: [3, 7],
    crs: 'EPSG:4326',
    skip: 0,
    hole: false,
    points:
    [
        {
          rhumb: 'SE',
          angle: 0,
          distance: 4
        },
        {
          rhumb: 'SE',
          angle: 90,
          distance: 5
        },
        {
          rhumb: 'NE',
          angle: 0,
          distance: 4
        },
        {
          rhumb: 'NW',
          angle: 90,
          distance: 5
        }
    ]
  }, {
    type: 'Polygon',
    startPoint: [4, 4],
    crs: 'EPSG:4326',
    skip: 0,
    hole: true,
    points:
    [
        {
          rhumb: 'SE',
          angle: 90,
          distance: 1
        },
        {
          rhumb: 'NE',
          angle: 0,
          distance: 1
        },
        {
          rhumb: 'NW',
          angle: 90,
          distance: 1
        },
        {
          rhumb: 'SE',
          angle: 0,
          distance: 1
        }
    ]
  }];
  let subject = mapApiMixinObject.create();

  //Act
  let rhumbs = subject.getRhumb(testLiseString, 'EPSG:4326');

  //Assert
  assert.deepEqual(rhumbs, resObj);
});

test('test method getRhumb for MultiPolygon with part', function (assert) {
  //Arrange
  let testLiseString = {
    type: 'Feature',
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
          [
            [[3, 7], [3, 3], [8, 3], [8, 7], [3, 7]]
          ],
          [
            [[9, 3], [9, 2], [10, 2], [10, 3], [9, 3]]
          ]
      ]
    }
  };

  const resObj = [{
    type: 'Polygon',
    startPoint: [3, 7],
    crs: 'EPSG:4326',
    skip: 0,
    hole: false,
    points:
    [
        {
          rhumb: 'SE',
          angle: 0,
          distance: 4
        },
        {
          rhumb: 'SE',
          angle: 90,
          distance: 5
        },
        {
          rhumb: 'NE',
          angle: 0,
          distance: 4
        },
        {
          rhumb: 'NW',
          angle: 90,
          distance: 5
        }
    ]
  }, {
    type: 'Polygon',
    startPoint: [9, 3],
    crs: 'EPSG:4326',
    skip: 0,
    hole: false,
    points:
    [
        {
          rhumb: 'SE',
          angle: 0,
          distance: 1
        },
        {
          rhumb: 'SE',
          angle: 90,
          distance: 1
        },
        {
          rhumb: 'NE',
          angle: 0,
          distance: 1
        },
        {
          rhumb: 'NW',
          angle: 90,
          distance: 1
        }
    ]
  }];
  let subject = mapApiMixinObject.create();

  //Act
  let rhumbs = subject.getRhumb(testLiseString, 'EPSG:4326');

  //Assert
  assert.deepEqual(rhumbs, resObj);
});

test('test method getRhumb for MultiPolygon with part and hole', function (assert) {
  //Arrange
  let testLiseString = {
    type: 'Feature',
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
          [
            [[3, 7], [3, 3], [8, 3], [8, 7], [3, 7]],
            [[4, 4], [5, 4], [5, 5], [4, 5], [4, 4]]
          ],
          [
            [[9, 3], [9, 2], [10, 2], [10, 3], [9, 3]]
          ]
      ]
    }
  };

  const resObj = [{
    type: 'Polygon',
    startPoint: [3, 7],
    crs: 'EPSG:4326',
    skip: 0,
    hole: false,
    points:
    [
        {
          rhumb: 'SE',
          angle: 0,
          distance: 4
        },
        {
          rhumb: 'SE',
          angle: 90,
          distance: 5
        },
        {
          rhumb: 'NE',
          angle: 0,
          distance: 4
        },
        {
          rhumb: 'NW',
          angle: 90,
          distance: 5
        }
    ]
  }, {
    type: 'Polygon',
    startPoint: [4, 4],
    crs: 'EPSG:4326',
    skip: 0,
    hole: true,
    points:
    [
        {
          rhumb: 'SE',
          angle: 90,
          distance: 1
        },
        {
          rhumb: 'NE',
          angle: 0,
          distance: 1
        },
        {
          rhumb: 'NW',
          angle: 90,
          distance: 1
        },
        {
          rhumb: 'SE',
          angle: 0,
          distance: 1
        }
    ]
  }, {
    type: 'Polygon',
    startPoint: [9, 3],
    crs: 'EPSG:4326',
    skip: 0,
    hole: false,
    points:
    [
        {
          rhumb: 'SE',
          angle: 0,
          distance: 1
        },
        {
          rhumb: 'SE',
          angle: 90,
          distance: 1
        },
        {
          rhumb: 'NE',
          angle: 0,
          distance: 1
        },
        {
          rhumb: 'NW',
          angle: 90,
          distance: 1
        }
    ]
  }];
  let subject = mapApiMixinObject.create();

  //Act
  let rhumbs = subject.getRhumb(testLiseString, 'EPSG:4326');

  //Assert
  assert.deepEqual(rhumbs, resObj);
});
