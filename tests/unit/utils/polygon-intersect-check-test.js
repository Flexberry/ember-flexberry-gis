
import intersectionCheck from 'ember-flexberry-gis/utils/polygon-intersect-check';
import { module, test } from 'qunit';

module('Unit | Utility | polygon intersect check', function () {
  // Test intersecting polygon, type - L.Polygon
  const intersectPolygonLeaflet = L.polygon(
    [[56.09, 58.03], [56.02, 58.007], [56.07, 58.07], [56.08, 58.02]],
    { color: 'red', }
  );

  // Test intersecting polygon, type - array of latLngs
  const intersectPolygonArray = [
    [
      [56.09, 58.03], [56.02, 58.007], [56.07, 58.07], [56.08, 58.02]
    ]
  ];

  // Test intersecting polygon, type - GeoJson
  const intersectPolygonGeoJson = {
    type: 'Polygon',
    coordinates: [
      [
        [56.09, 58.03], [56.02, 58.007], [56.07, 58.07], [56.08, 58.02]
      ]
    ],
  };

  // Test nonintersecting polygon, type - L.Polygon
  const nonIntersectPolygonLeaflet = L.polygon(
    [[56.09, 58.03], [56.02, 58.007], [56.07, 58.07], [56.1, 58.02]],
    { color: 'red', }
  );

  // Test nonintersecting polygon, type - array of latLngs
  const nonIntersectPolygonArray = [
    [
      [56.09, 58.03], [56.02, 58.007], [56.07, 58.07], [56.1, 58.02]
    ]
  ];

  // Test nonintersecting polygon, type - GeoJson
  const nonIntersectPolygonGeoJson = {
    type: 'Polygon',
    coordinates: [
      [
        [56.09, 58.03], [56.02, 58.007], [56.07, 58.07], [56.1, 58.02]
      ]
    ],
  };

  // Test intersecting multi polygon, type - L.Polygon
  const intersectMPolygonLeaflet = L.polygon(
    [
      [
        [45.51, -122.68], [37.77, -122.43], [34.04, -118.2]
      ],
      [
        [56.09, 58.03], [56.02, 58.007], [56.07, 58.07], [56.08, 58.02]
      ]
    ],
    { color: 'red', }
  );

  // Test intersecting multi polygon, type - array of latLngs
  const intersectMPolygonArray = [
    [
      [45.51, -122.68], [37.77, -122.43], [34.04, -118.2]
    ],
    [
      [56.09, 58.03], [56.02, 58.007], [56.07, 58.07], [56.08, 58.02]
    ]
  ];

  // Test intersecting multi polygon, type - GeoJson
  const intersectMPolygonGeoJson = {
    type: 'MultiPolygon',
    coordinates: [
      [
        [[45.51, -122.68], [37.77, -122.43], [34.04, -118.2]]
      ],
      [
        [[56.09, 58.03], [56.02, 58.007], [56.07, 58.07], [56.08, 58.02]]
      ]
    ],
  };

  // Test nonintersecting multi polygon, type - L.Polygon
  const nonIntersectMPolygonLeaflet = L.polygon(
    [
      [
        [45.51, -122.68], [37.77, -122.43], [34.04, -118.2]
      ],
      [
        [56.09, 58.03], [56.02, 58.007], [56.07, 58.07], [56.1, 58.02]
      ]
    ],
    { color: 'red', }
  );

  // Test nonintersecting multi polygon, type - array of latLngs
  const nonIntersectMPolygonArray = [
    [
      [45.51, -122.68], [37.77, -122.43], [34.04, -118.2]
    ],
    [
      [56.09, 58.03], [56.02, 58.007], [56.07, 58.07], [56.1, 58.02]
    ]
  ];

  // Test nonintersecting multi polygon, type - GeoJson
  const nonIntersectMPolygonGeoJson = {
    type: 'MultiPolygon',
    coordinates: [
      [
        [[45.51, -122.68], [37.77, -122.43], [34.04, -118.2]]
      ],
      [
        [[56.09, 58.03], [56.02, 58.007], [56.07, 58.07], [56.1, 58.02]]
      ]
    ],
  };

  test('should define is testing polygon intersecting or not', function (assert) {
    assert.equal(intersectionCheck(intersectPolygonLeaflet), true);
    assert.equal(intersectionCheck(nonIntersectPolygonLeaflet), false);

    assert.equal(intersectionCheck(intersectPolygonArray), true);
    assert.equal(intersectionCheck(nonIntersectPolygonArray), false);

    assert.equal(intersectionCheck(intersectPolygonGeoJson), true);
    assert.equal(intersectionCheck(nonIntersectPolygonGeoJson), false);

    assert.equal(intersectionCheck(intersectMPolygonLeaflet), true);
    assert.equal(intersectionCheck(nonIntersectMPolygonLeaflet), false);

    assert.equal(intersectionCheck(intersectMPolygonArray), true);
    assert.equal(intersectionCheck(nonIntersectMPolygonArray), false);

    assert.equal(intersectionCheck(intersectMPolygonGeoJson), true);
    assert.equal(intersectionCheck(nonIntersectMPolygonGeoJson), false);
  });
});
