import Ember from 'ember';
import FavoriteFeature from 'ember-flexberry-gis/mixins/favorites-features';
import { module, test } from 'qunit';

let mapApiMixinObject = Ember.Object.extend(FavoriteFeature);

module('Unit | Mixin | favorite-feature mixin');

let editedLayerModel = Ember.A({ id: 11, crs: {} });

let editedPolygon = L.polygon([[1, 2], [2, 3], [3, 4]]);
editedPolygon.feature = editedPolygon.toGeoJSON();
editedPolygon.feature.layerModel = editedLayerModel;
editedPolygon.feature.properties.primarykey = 1;
editedPolygon.feature.properties.prev = true;

let firstFavoriteFeature = L.polygon([[10, 20], [20, 30], [30, 40]]);
firstFavoriteFeature.feature = firstFavoriteFeature.toGeoJSON();
firstFavoriteFeature.feature.layerModel = editedLayerModel;
firstFavoriteFeature.feature.properties.primarykey = 2;

let secondLayerModel = Ember.A({ id: 14, crs: {} });
let secondFavoriteFeature = L.polygon([[11, 22], [22, 33], [33, 44]]);
secondFavoriteFeature.feature = secondFavoriteFeature.toGeoJSON();
secondFavoriteFeature.feature.layerModel = secondLayerModel;
secondFavoriteFeature.feature.properties.primarykey = 3;

let thirdFavoriteFeature = L.polygon([[2, 3], [3, 4], [5, 6]]);
thirdFavoriteFeature.feature = thirdFavoriteFeature.toGeoJSON();
thirdFavoriteFeature.feature.layerModel = secondLayerModel;
thirdFavoriteFeature.feature.properties.primarykey = 3;

let data = {
  layerModel: {
    layerModel: editedLayerModel
  },
  layers: [editedPolygon]
};

let favFeatures = [
  {
    layerModel: editedLayerModel,
    features: [
      editedPolygon.feature,
      firstFavoriteFeature.feature
    ]
  },
  {
    layerModel: secondLayerModel,
    features: [
      secondFavoriteFeature.feature,
      thirdFavoriteFeature.feature
    ]
  }
];

test('test method _updateFavorite with compareEnabled', function (assert) {
  assert.expect(4);
  let result = null;
  editedPolygon.feature.compareEnabled = true;
  let subject = mapApiMixinObject.create({
    mapApi: {
      getFromApi() {
        return {
          _getLayerFeatureId() {
            return 1;
          }
        };
      }
    },
    result: result,
    favFeatures: favFeatures,
    twoObjectToCompare: Ember.A([editedPolygon])
  });
  subject._updateFavorite(data);
  assert.equal(subject.get('result').length, 2);
  assert.deepEqual(subject.get('result')[0].features.constructor, Ember.RSVP.Promise);
  assert.equal(subject.get('favFeatures').length, 2);
  assert.equal(subject.get('favFeatures')[0].features.length, 2);
  delete editedPolygon.feature.compareEnabled;
});

test('test method _updateFavorite with not compareEnabled', function (assert) {
  assert.expect(4);
  let result = null;
  let subject = mapApiMixinObject.create({
    mapApi: {
      getFromApi() {
        return {
          _getLayerFeatureId() {
            return 1;
          }
        };
      }
    },
    result: result,
    favFeatures: favFeatures,
    twoObjectToCompare: Ember.A([editedPolygon])
  });
  subject._updateFavorite(data);
  assert.equal(subject.get('result').length, 2);
  assert.deepEqual(subject.get('result')[0].features.constructor, Ember.RSVP.Promise);
  assert.equal(subject.get('favFeatures').length, 2);
  assert.equal(subject.get('favFeatures')[0].features.length, 2);
});
