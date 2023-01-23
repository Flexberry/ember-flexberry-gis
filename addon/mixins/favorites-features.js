/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import LeafletZoomToFeatureMixin from '../mixins/leaflet-zoom-to-feature';
import { translationMacro as t } from 'ember-i18n';
import generateUniqueId from 'ember-flexberry-data/utils/generate-unique-id';

export default Ember.Mixin.create(LeafletZoomToFeatureMixin, {

  /**
    Array of items in fav with promise.
    @property result
    @type Array
    @default Ember.A()
  */
  result: Ember.A(),

  favorites: Ember.A(),

  /**
    Array of 2 features that will be compared.
    @property twoObjectToCompare
    @type Array
    @default Ember.A()
  */
  twoObjectToCompare: Ember.A(),

  /**
    Is compare geometries panel enabled.
    @property showComapreGeometriesPanel
    @type Boolean
    @default false
  */
  showComapreGeometriesPanel: false,

  /**
    Array of items in fav list.
    @property favFeatures
    @type Array
    @default Ember.A()
  */
  favFeatures: Ember.A(),

  /**
    Flag indicates if comapre button disabled.
    @property compareBtnDisabled
    @type Boolean
    @default true
  */
  compareBtnDisabled: true,

  /**
    'Select 2 objects'.

    @property cordsCaption
    @type String
    @default t('components.compare-object-geometries.select2')
  */
  selectTwo: t('components.compare-object-geometries.select2'),

  /**
    Observer on twoObjectToCompare array.
    @property _onTwoObjectToCompareChange
    @type Observer
    @private
  */
  _onTwoObjectToCompareChange: Ember.observer('twoObjectToCompare.[]', function () {
    if (this.get('twoObjectToCompare').length === 2) {
      this.set('compareBtnDisabled', false);
    } else {
      this.set('compareBtnDisabled', true);
    }
  }),

  /**
    Observer for leafletMap property.

    @property onLeafletMapDidChange
    @private
    @readonly
  */
  _onLeafletMapDidChange: Ember.observer('leafletMap', function () {
    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletMap)) {
      leafletMap.on('flexberry-map:allLayersLoaded', this.fromIdArrayToFeatureArray, this);
      leafletMap.on('flexberry-map:updateFavorite', this._updateFavorite, this);
    }
  }),

  willDestroyElement() {
    this._super(...arguments);
    let leafletMap = this.get('leafletMap');
    leafletMap.off('flexberry-map:allLayersLoaded', this.fromIdArrayToFeatureArray, this);
    leafletMap.off('flexberry-map:updateFavorite', this._updateFavorite, this);
  },

  /**
    Injected ember storage.

    @property folded
    @type Ember.store
  */
  store: Ember.inject.service(),

  actions: {
    /**
      Handles click on favorite icon.

      @method addToFavorite
      @param feature
    */
    addToFavorite(feature) {
      if (Ember.get(feature.properties, 'favUpdating')) {
        return;
      }

      let store = this.get('store');
      let favFeatures = this.get('favFeatures');

      let isFavourite = null;

      let layerModelIndex = this.isLayerModelInArray(favFeatures, feature.layerModel);
      let savePromise;
      if (Ember.get(feature.properties, 'isFavorite')) {
        if (layerModelIndex !== -1) {
          let records = store.peekAll('i-i-s-r-g-i-s-p-k-favorite-features')
            .filterBy('objectKey', feature.properties.primarykey)
            .filterBy('objectLayerKey', feature.layerModel.id);
          let record = records.objectAt(0);
          record.deleteRecord();
          Ember.set(feature.properties, 'favUpdating', true);
          savePromise = record.save().then(() => {
            favFeatures = this.removeFeatureFromLayerModel(favFeatures, layerModelIndex, feature);

            isFavourite = false;

            if (Ember.get(feature, 'compareEnabled')) {
              Ember.set(feature, 'compareEnabled', false);
              let twoObjects = this.get('twoObjectToCompare');
              twoObjects.removeObject(feature);
            }
          });
        }
      } else {
        let objectKey = this.get('mapApi').getFromApi('mapModel')._getLayerFeatureId(feature.layerModel, { feature });
        let newRecord = { id: generateUniqueId(), objectKey: objectKey, objectLayerKey: feature.layerModel.id };
        let record = store.createRecord('i-i-s-r-g-i-s-p-k-favorite-features', newRecord);

        Ember.set(feature.properties, 'favUpdating', true);
        savePromise = record.save().then(() => {
          isFavourite = true;

          if (layerModelIndex !== -1) {
            favFeatures = this.addNewFeatureToLayerModel(favFeatures, layerModelIndex, feature);
          } else {
            favFeatures = this.addNewFeatureToNewLayerModel(favFeatures, feature.layerModel, feature);
          }
        });
      }

      // в списках layer-result-list используется запрос к серверу на получения списка избранного,
      // поэтому отдавать результаты необходимо с уже сохраненными объектами
      (savePromise || Ember.RSVP.resolve()).then(() => {
        Ember.set(feature.properties, 'isFavorite', isFavourite);

        let layerModelPromise = Ember.A();
        favFeatures.forEach(object => {
          let promise = new Ember.RSVP.Promise((resolve) => {
            resolve(object.features);
          });

          layerModelPromise.addObject({ layerModel: object.layerModel, features: promise });
        });

        this.set('result', layerModelPromise);
      }).finally(() => {
        Ember.set(feature.properties, 'favUpdating', false);
      });
    },

    /**
      Handles click on checkbox in favorite list.

      @method addToCompareGeometries
      @param feature
    */
    addToCompareGeometries(feature) {
      let twoObjects = this.get('twoObjectToCompare');
      if (Ember.get(feature, 'compareEnabled')) {
        Ember.set(feature, 'compareEnabled', false);
        twoObjects.removeObject(feature);
      } else {
        Ember.set(feature, 'compareEnabled', true);
        twoObjects.pushObject(feature);
        if (twoObjects.length > 2) {
          let secondFeature = twoObjects[1];
          twoObjects.removeObject(secondFeature);
          Ember.set(secondFeature, 'compareEnabled', false);
        }
      }
    },

    /**
      Handles compare features button.

      @method OnCompareTwoGeometries
    */
    OnCompareTwoGeometries() {
      let twoObjects = this.get('twoObjectToCompare');
      if (twoObjects.length !== 2) {
        alert(this.get('selectTwo'));
      } else {
        this.set('showComapreGeometriesPanel', true);
      }
    },

    /**
      Habdles click on exit comare panel icon

      @method closeComparePanel
    */
    closeComparePanel() {
      this.set('showComapreGeometriesPanel', false);
    }
  },

  /**
    Method checks id layerModel in array.
    if it is returns its index.

    @method isLayerModelInArray
  */
  isLayerModelInArray(array, layerModel) {
    let res = -1;
    array.forEach((item, index) => {
      if (item.layerModel.id === layerModel.id) {
        res = index;
      }
    });
    return res;
  },

  /**
    Adding new feature to leayer model array of features.

    @method addNewFeatureToLayerModel
  */
  addNewFeatureToLayerModel(array, index, feature) {
    let features = array[index].features;
    features.push(feature);
    return array;
  },

  /**
    Adding new layer model and new feature to array.

    @method addNewFeatureToNewLayerModel
  */
  addNewFeatureToNewLayerModel(array, layerModel, feature) {
    let featureArray = Ember.A();
    featureArray.addObject(feature);
    array.addObject({ layerModel: layerModel, features: featureArray });
    return array;
  },

  /**
    Remove feature from fav features list.

    @method removeFeatureFromLayerModel
  */
  removeFeatureFromLayerModel(array, index, feature) {
    let features = array[index].features;
    let featureToDelete = features.findBy('properties.primarykey', feature.properties.primarykey);
    features.removeObject(featureToDelete);
    if (features.length === 0) {
      array.removeAt(index);
    }

    return array;
  },

  /**
    Get features from array of ids.

    @method fromIdArrayToFeatureArray
  */
  fromIdArrayToFeatureArray() {
    let store = this.get('store');
    let idFeaturesArray = store.findAll('i-i-s-r-g-i-s-p-k-favorite-features');
    idFeaturesArray.then((favorites) => {
      let favFeaturesArray = Ember.A();
      favorites.forEach(layer => {
        let id = this.isLayerModelInArray(favFeaturesArray, { id: layer.get('objectLayerKey') });
        if (id !== -1) {
          favFeaturesArray[id].features.push(layer.get('objectKey'));
        } else {
          favFeaturesArray.addObject({ layerModel: { id: layer.get('objectLayerKey') }, features: [layer.get('objectKey')] });
        }
      });

      let promises = [];
      favFeaturesArray.forEach((item) => {
        let featurePromises = this.get('mapApi').getFromApi('mapModel').loadingFeaturesByPackages(item.layerModel.id, item.features);
        promises = promises.concat(featurePromises);
      });

      if (!Ember.isBlank(promises)) {
        Ember.RSVP.allSettled(promises).then((res) => {
          let favFeatures = Ember.A();
          let result = Ember.A();
          res.forEach((promiseResult) => {
            if (promiseResult.state !== 'rejected') {
              let favorites = Ember.A();
              promiseResult.value[2].forEach((layerObject) => {
                Ember.set(layerObject.feature.properties, 'isFavorite', true);
                Ember.set(layerObject.feature, 'leafletLayer', layerObject);

                favorites.push(layerObject.feature);
              });

              let promiseFeature = null;
              let layerModelIndex = this.isLayerModelInArray(result, promiseResult.value[0]);
              if (layerModelIndex !== -1) {
                favorites = favorites.concat(favorites, favFeatures[layerModelIndex].features);
                promiseFeature = new Ember.RSVP.Promise((resolve) => {
                  resolve(favorites);
                });

                result[layerModelIndex].features = promiseFeature;
                favFeatures[layerModelIndex].features = favorites;
              } else {
                promiseFeature = new Ember.RSVP.Promise((resolve) => {
                  resolve(favorites);
                });

                result.addObject({ layerModel: promiseResult.value[0], features: promiseFeature });
                favFeatures.addObject({ layerModel: promiseResult.value[0], features: favorites });
              }
            }
          });

          this.set('result', result);
          this.set('favFeatures', favFeatures);
          this.set('_showFavorites', true);
        });
      } else {
        this.set('result', Ember.A());
        this.set('favFeatures', Ember.A());
        this.set('_showFavorites', true);
      }
    });
  },

  /**
   * This method update favorite feature when feature is edited
   * @param {Object} data This parameter contain layerModel and layer (object) which the was edited.
   */
  _updateFavorite(data) {
    let result = Ember.A();
    let favFeatures = Ember.A();
    let twoObjects = this.get('twoObjectToCompare');
    let updatedLayer = data.layers[0];
    let idUpdatedFavorite = this.get('mapApi').getFromApi('mapModel')._getLayerFeatureId(data.layerModel.layerModel, updatedLayer);
    this.get('favFeatures').forEach((favoriteObject) => {
      let favorites = Ember.A();
      if (favoriteObject.layerModel.id === data.layerModel.layerModel.id) {
        favoriteObject.features.forEach((feature) => {
          let id = feature.properties.primarykey;
          if (idUpdatedFavorite === id) {
            updatedLayer.feature.layerModel = data.layerModel.layerModel;
            Ember.set(updatedLayer.feature.properties, 'isFavorite', true);
            if (!Ember.isEmpty(twoObjects)) {
              if (Ember.get(feature, 'compareEnabled')) {
                twoObjects.removeObject(feature);
                Ember.set(updatedLayer.feature, 'compareEnabled', true);
                twoObjects.pushObject(updatedLayer.feature);
              }
            }

            favorites.push(updatedLayer.feature);
          } else {
            favorites.push(feature);
          }
        });

        let promiseFeature = new Ember.RSVP.Promise((resolve) => {
          resolve(favorites);
        });

        result.addObject({ layerModel: favoriteObject.layerModel, features: promiseFeature });
        favFeatures.addObject({ layerModel: favoriteObject.layerModel, features: favorites });
      } else {
        let promiseFeature = null;
        let layerModelIndex = this.isLayerModelInArray(result, favoriteObject.layerModel);
        if (layerModelIndex !== -1) {
          favorites = favorites.concat(favorites, favoriteObject.features);
          promiseFeature = new Ember.RSVP.Promise((resolve) => {
            resolve(favorites);
          });

          result[layerModelIndex].features = promiseFeature;
          favFeatures[layerModelIndex].features = favorites;
        } else {
          favorites = favoriteObject.features;
          promiseFeature = new Ember.RSVP.Promise((resolve) => {
            resolve(favorites);
          });

          result.addObject({ layerModel: favoriteObject.layerModel, features: promiseFeature });
          favFeatures.addObject({ layerModel: favoriteObject.layerModel, features: favorites });
        }
      }
    });

    this.set('result', result);
    this.set('favFeatures', favFeatures);
  }
});
