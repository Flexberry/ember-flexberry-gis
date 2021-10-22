import { Promise } from 'rsvp';
import { A } from '@ember/array';
import EmberObject from '@ember/object';
import FavoriteFeature from 'ember-flexberry-gis/mixins/favorites-features';
import { module, test } from 'qunit';

const mapApiMixinObject = EmberObject.extend(FavoriteFeature);

module('Unit | Mixin | favorite-feature mixin', function () {
  const editedLayerModel = A({ id: 11, crs: {}, });

  const editedPolygon = L.polygon([[1, 2], [2, 3], [3, 4]]);
  editedPolygon.feature = editedPolygon.toGeoJSON();
  editedPolygon.feature.layerModel = editedLayerModel;
  editedPolygon.feature.properties.primarykey = 1;
  editedPolygon.feature.properties.prev = true;

  const firstFavoriteFeature = L.polygon([[10, 20], [20, 30], [30, 40]]);
  firstFavoriteFeature.feature = firstFavoriteFeature.toGeoJSON();
  firstFavoriteFeature.feature.layerModel = editedLayerModel;
  firstFavoriteFeature.feature.properties.primarykey = 2;

  const secondLayerModel = A({ id: 14, crs: {}, });
  const secondFavoriteFeature = L.polygon([[11, 22], [22, 33], [33, 44]]);
  secondFavoriteFeature.feature = secondFavoriteFeature.toGeoJSON();
  secondFavoriteFeature.feature.layerModel = secondLayerModel;
  secondFavoriteFeature.feature.properties.primarykey = 3;

  const thirdFavoriteFeature = L.polygon([[2, 3], [3, 4], [5, 6]]);
  thirdFavoriteFeature.feature = thirdFavoriteFeature.toGeoJSON();
  thirdFavoriteFeature.feature.layerModel = secondLayerModel;
  thirdFavoriteFeature.feature.properties.primarykey = 3;

  const data = {
    layerModel: {
      layerModel: editedLayerModel,
    },
    layers: [editedPolygon],
  };

  const favFeatures = [
    {
      layerModel: editedLayerModel,
      features: [
        editedPolygon.feature,
        firstFavoriteFeature.feature
      ],
    },
    {
      layerModel: secondLayerModel,
      features: [
        secondFavoriteFeature.feature,
        thirdFavoriteFeature.feature
      ],
    }
  ];

  test('test method _updateFavorite with compareEnabled', function (assert) {
    assert.expect(4);
    const result = null;
    editedPolygon.feature.compareEnabled = true;
    const subject = mapApiMixinObject.create({
      mapApi: {
        getFromApi() {
          return {
            _getLayerFeatureId() {
              return 1;
            },
          };
        },
      },
      result,
      favFeatures,
      twoObjectToCompare: A([editedPolygon]),
    });
    subject._updateFavorite(data);
    assert.equal(subject.get('result').length, 2);
    assert.deepEqual(subject.get('result')[0].features.constructor, Promise);
    assert.equal(subject.get('favFeatures').length, 2);
    assert.equal(subject.get('favFeatures')[0].features.length, 2);
    delete editedPolygon.feature.compareEnabled;
  });

  test('test method _updateFavorite with not compareEnabled', function (assert) {
    assert.expect(4);
    const result = null;
    const subject = mapApiMixinObject.create({
      mapApi: {
        getFromApi() {
          return {
            _getLayerFeatureId() {
              return 1;
            },
          };
        },
      },
      result,
      favFeatures,
      twoObjectToCompare: A([editedPolygon]),
    });
    subject._updateFavorite(data);
    assert.equal(subject.get('result').length, 2);
    assert.deepEqual(subject.get('result')[0].features.constructor, Promise);
    assert.equal(subject.get('favFeatures').length, 2);
    assert.equal(subject.get('favFeatures')[0].features.length, 2);
  });
});
