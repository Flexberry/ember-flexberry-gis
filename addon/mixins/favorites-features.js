/**
  @module ember-flexberry-gis
*/

import { Promise, allSettled } from 'rsvp';

import { inject as service } from '@ember/service';
import { isNone, isBlank, isEmpty } from '@ember/utils';
import { observer, get, set } from '@ember/object';
import { A } from '@ember/array';
import Mixin from '@ember/object/mixin';
import { translationMacro as t } from 'ember-i18n';
import generateUniqueId from 'ember-flexberry-data/utils/generate-unique-id';
import LeafletZoomToFeatureMixin from './leaflet-zoom-to-feature';

export default Mixin.create(LeafletZoomToFeatureMixin, {

  /**
    Array of items in fav with promise.
    @property result
    @type Array
    @default Ember.A()
  */
  result: A(),

  favorites: A(),

  /**
    Array of 2 features that will be compared.
    @property twoObjectToCompare
    @type Array
    @default Ember.A()
  */
  twoObjectToCompare: A(),

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
  favFeatures: A(),

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
  _onTwoObjectToCompareChange: observer('twoObjectToCompare.[]', function () {
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
  _onLeafletMapDidChange: observer('leafletMap', function () {
    const leafletMap = this.get('leafletMap');
    if (!isNone(leafletMap)) {
      leafletMap.on('flexberry-map:allLayersLoaded', this.fromIdArrayToFeatureArray, this);
      leafletMap.on('flexberry-map:updateFavorite', this._updateFavorite, this);
    }
  }),

  willDestroyElement() {
    this._super(...arguments);
    const leafletMap = this.get('leafletMap');
    leafletMap.off('flexberry-map:allLayersLoaded', this.fromIdArrayToFeatureArray, this);
    leafletMap.off('flexberry-map:updateFavorite', this._updateFavorite, this);
  },

  /**
    Injected ember storage.

    @property folded
    @type Ember.store
  */
  store: service(),

  actions: {
    /**
      Handles click on favorite icon.

      @method addToFavorite
      @param feature
    */
    addToFavorite(feature) {
      const store = this.get('store');
      let favFeatures = this.get('favFeatures');
      const layerModelIndex = this.isLayerModelInArray(favFeatures, feature.layerModel);
      if (get(feature.properties, 'isFavorite')) {
        if (layerModelIndex !== false) {
          favFeatures = this.removeFeatureFromLayerModel(favFeatures, layerModelIndex, feature);
          const record = store.peekAll('i-i-s-r-g-i-s-p-k-favorite-features')
            .filterBy('objectKey', feature.properties.primarykey)
            .filterBy('objectLayerKey', feature.layerModel.id);
          record[0].deleteRecord();
          record[0].save();
        }

        set(feature.properties, 'isFavorite', false);

        if (get(feature, 'compareEnabled')) {
          set(feature, 'compareEnabled', false);
          const twoObjects = this.get('twoObjectToCompare');
          twoObjects.removeObject(feature);
        }
      } else {
        set(feature.properties, 'isFavorite', true);
        if (layerModelIndex !== false) {
          favFeatures = this.addNewFeatureToLayerModel(favFeatures, layerModelIndex, feature);
          const newRecord = { id: generateUniqueId(), objectKey: feature.properties.primarykey, objectLayerKey: feature.layerModel.id, };
          const record = store.createRecord('i-i-s-r-g-i-s-p-k-favorite-features', newRecord);
          record.save();
        } else {
          favFeatures = this.addNewFeatureToNewLayerModel(favFeatures, feature.layerModel, feature);
          const newRecord = { id: generateUniqueId(), objectKey: feature.properties.primarykey, objectLayerKey: feature.layerModel.id, };
          const record = store.createRecord('i-i-s-r-g-i-s-p-k-favorite-features', newRecord);
          record.save();
        }
      }

      const layerModelPromise = A();
      favFeatures.forEach((object) => {
        const promise = new Promise((resolve) => {
          resolve(object.features);
        });
        layerModelPromise.addObject({ layerModel: object.layerModel, features: promise, });
      });
      this.set('result', layerModelPromise);
    },

    /**
      Handles click on checkbox in favorite list.

      @method addToCompareGeometries
      @param feature
    */
    addToCompareGeometries(feature) {
      const twoObjects = this.get('twoObjectToCompare');
      if (get(feature, 'compareEnabled')) {
        set(feature, 'compareEnabled', false);
        twoObjects.removeObject(feature);
      } else {
        set(feature, 'compareEnabled', true);
        twoObjects.pushObject(feature);
        if (twoObjects.length > 2) {
          const secondFeature = twoObjects[1];
          twoObjects.removeObject(secondFeature);
          set(secondFeature, 'compareEnabled', false);
        }
      }
    },

    /**
      Handles compare features button.

      @method OnCompareTwoGeometries
    */
    OnCompareTwoGeometries() {
      const twoObjects = this.get('twoObjectToCompare');
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
    },
  },

  /**
    Method checks id layerModel in array.
    if it is returns its index.

    @method isLayerModelInArray
  */
  isLayerModelInArray(array, layerModel) {
    let res = false;
    array.forEach((item, index) => {
      if (item.layerModel.id === layerModel.id) {
        res = index;
      }
    });
    return res;
  },

  /**
    Adding new featre to leayer model array of features.

    @method addNewFeatureToLayerModel
  */
  addNewFeatureToLayerModel(array, index, feature) {
    const { features, } = array[index];
    features.push(feature);
    return array;
  },

  /**
    Adding new layer model and new feature to array.

    @method addNewFeatureToNewLayerModel
  */
  addNewFeatureToNewLayerModel(array, layerModel, feature) {
    const featureArray = A();
    featureArray.addObject(feature);
    array.addObject({ layerModel, features: featureArray, });
    return array;
  },

  /**
    Remove feature from fav features list.

    @method removeFeatureFromLayerModel
  */
  removeFeatureFromLayerModel(array, index, feature) {
    const { features, } = array[index];
    const featureToDelete = features.findBy('properties.primarykey', feature.properties.primarykey);
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
    const store = this.get('store');
    const idFeaturesArray = store.findAll('i-i-s-r-g-i-s-p-k-favorite-features');
    idFeaturesArray.then((favorites) => {
      const favFeaturesArray = A();
      favorites.forEach((layer) => {
        const id = this.isLayerModelInArray(favFeaturesArray, { id: layer.get('objectLayerKey'), });
        if (id !== false) {
          favFeaturesArray[id].features.push(layer.get('objectKey'));
        } else {
          favFeaturesArray.addObject({ layerModel: { id: layer.get('objectLayerKey'), }, features: [layer.get('objectKey')], });
        }
      });

      let promises = [];
      favFeaturesArray.forEach((item) => {
        const featurePromises = this.get('mapApi').getFromApi('mapModel').loadingFeaturesByPackages(item.layerModel.id, item.features);
        promises = promises.concat(featurePromises);
      });
      if (!isBlank(promises)) {
        allSettled(promises).then((res) => {
          const favFeatures = A();
          const result = A();
          res.forEach((promiseResult) => {
            if (promiseResult.state !== 'rejected') {
              let favorites = A();
              promiseResult.value[2].forEach((layerObject) => {
                set(layerObject.feature.properties, 'isFavorite', true);
                favorites.push(layerObject.feature);
              });
              let promiseFeature = null;
              const layerModelIndex = this.isLayerModelInArray(result, promiseResult.value[0]);
              if (layerModelIndex !== false) {
                favorites = favorites.concat(favorites, favFeatures[layerModelIndex].features);
                promiseFeature = new Promise((resolve) => {
                  resolve(favorites);
                });
                result[layerModelIndex].features = promiseFeature;
                favFeatures[layerModelIndex].features = favorites;
              } else {
                promiseFeature = new Promise((resolve) => {
                  resolve(favorites);
                });
                result.addObject({ layerModel: promiseResult.value[0], features: promiseFeature, });
                favFeatures.addObject({ layerModel: promiseResult.value[0], features: favorites, });
              }
            }
          });
          this.set('result', result);
          this.set('favFeatures', favFeatures);
          this.set('_showFavorites', true);
        });
      } else {
        this.set('result', A());
        this.set('favFeatures', A());
        this.set('_showFavorites', true);
      }
    });
  },

  /**
   * This method update favorite feature when feature is edited
   * @param {Object} data This parameter contain layerModel and layer (object) which the was edited.
   */
  _updateFavorite(data) {
    const result = A();
    const favFeatures = A();
    const twoObjects = this.get('twoObjectToCompare');
    const updatedLayer = data.layers[0];
    const idUpdatedFavorite = this.get('mapApi').getFromApi('mapModel')._getLayerFeatureId(data.layerModel.layerModel, data.layers[0]);
    this.get('favFeatures').forEach((favoriteObject) => {
      let favorites = A();
      if (favoriteObject.layerModel.id === data.layerModel.layerModel.id) {
        favoriteObject.features.forEach((feature) => {
          const id = feature.properties.primarykey;
          if (idUpdatedFavorite === id) {
            updatedLayer.feature.layerModel = data.layerModel.layerModel;
            set(updatedLayer.feature.properties, 'isFavorite', true);
            if (!isEmpty(twoObjects)) {
              if (get(feature, 'compareEnabled')) {
                twoObjects.removeObject(feature);
                set(updatedLayer.feature, 'compareEnabled', true);
                twoObjects.pushObject(updatedLayer.feature);
              }
            }

            favorites.push(updatedLayer.feature);
          } else {
            favorites.push(feature);
          }
        });

        const promiseFeature = new Promise((resolve) => {
          resolve(favorites);
        });
        result.addObject({ layerModel: favoriteObject.layerModel, features: promiseFeature, });
        favFeatures.addObject({ layerModel: favoriteObject.layerModel, features: favorites, });
      } else {
        let promiseFeature = null;
        const layerModelIndex = this.isLayerModelInArray(result, favoriteObject.layerModel);
        if (layerModelIndex !== false) {
          favorites = favorites.concat(favorites, favoriteObject.features);
          promiseFeature = new Promise((resolve) => {
            resolve(favorites);
          });
          result[layerModelIndex].features = promiseFeature;
          favFeatures[layerModelIndex].features = favorites;
        } else {
          favorites = favoriteObject.features;
          promiseFeature = new Promise((resolve) => {
            resolve(favorites);
          });
          result.addObject({ layerModel: favoriteObject.layerModel, features: promiseFeature, });
          favFeatures.addObject({ layerModel: favoriteObject.layerModel, features: favorites, });
        }
      }
    });
    this.set('result', result);
    this.set('favFeatures', favFeatures);
  },
});
