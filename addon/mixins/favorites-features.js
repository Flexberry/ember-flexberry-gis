/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import LeafletZoomToFeatureMixin from '../mixins/leaflet-zoom-to-feature';
export default Ember.Mixin.create(LeafletZoomToFeatureMixin, {

  /**
    Array of items in fav with promise.
    @property result
    @type Array
    @default Ember.A()
  */
  result: Ember.A(),

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
    Observer on twoObjectToCompare array.
    @property _onTwoObjectToCompareChange
    @type Observer
    @private
  */
  _onTwoObjectToCompareChange: Ember.observer('twoObjectToCompare.[]', function() {
    if (this.get('twoObjectToCompare').length === 2) {
      this.set('compareBtnDisabled', false);
    } else {
      this.set('compareBtnDisabled', true);
    }
  }),

  actions: {
    /**
      Handles click on favorite icon.

      @method addToFavorite
      @param feature
    */
    addToFavorite(feature) {
      let favFeatures = this.get('favFeatures');
      let layerModelIndex = this.isLayerModelInArray(favFeatures, feature.layerModel);
      if (Ember.get(feature.properties, 'isFavorite')) {
        Ember.set(feature.properties, 'isFavorite', false);
        if (layerModelIndex !== false) {
          favFeatures = this.removeFeatureFromLayerModel(favFeatures, layerModelIndex, feature);
        }

        if (Ember.get(feature, 'compareEnabled')) {
          Ember.set(feature, 'compareEnabled', false);
          let twoObjects = this.get('twoObjectToCompare');
          twoObjects.removeObject(feature);
        }
      } else {
        Ember.set(feature.properties, 'isFavorite', true);
        if (layerModelIndex !== false) {
          favFeatures = this.addNewFeatureToLayerModel(favFeatures, layerModelIndex, feature);
        } else {
          favFeatures = this.addNewFeatureToNewLayerModel(favFeatures, feature);
        }
      }

      let layerModelPromise = Ember.A();
      favFeatures.forEach(object => {
        let promise = new Ember.RSVP.Promise((resolve) => {
          resolve(object.features);
        });
        layerModelPromise.addObject({ layerModel: object.layerModel, features: promise });
      });
      this.set('result', layerModelPromise);
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
        alert('Выберите 2 объекта');
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
    let features = array[index].features;
    features.push(feature);
    return array;
  },

  /**
    Adding new layer model and new feature to array.

      @method addNewFeatureToNewLayerModel
  */
  addNewFeatureToNewLayerModel(array, feature) {
    let featureArray = Ember.A();
    featureArray.addObject(feature);
    array.addObject({ layerModel: feature.layerModel, features: featureArray });
    return array;
  },

  removeFeatureFromLayerModel(array, index, feature) {
    let features = array[index].features;
    features.removeObject(feature);
    if (features.length === 0) {
      array.removeAt(index);
    }

    return array;
  }
});
