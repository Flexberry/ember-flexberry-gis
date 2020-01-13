/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import LeafletZoomToFeatureMixin from '../mixins/leaflet-zoom-to-feature';
export default Ember.Mixin.create(LeafletZoomToFeatureMixin, {

  /**
    Array of items in fav list.
    @property favs:
    @type Array
    @default Ember.A()
  */
  favs: Ember.A(),

  /**
    Array of items in fav list to test.
    @property test
    @type Array
    @default false
  */
  test: Ember.A(),

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

  actions: {
    /**
      Handles click on favorite icon.

      @method addToFavorite
      @param feature
    */
    addToFavorite(feature) {
      let favs = this.get('favs');
      if (Ember.get(feature.properties, 'isFavorite')) {
        Ember.set(feature.properties, 'isFavorite', false);
        if (Ember.get(feature, 'compareEnabled')) {
          Ember.set(feature, 'compareEnabled', false);
          let twoObjects = this.get('twoObjectToCompare');
          twoObjects.removeObject(feature);
          favs.removeObject(feature);
        } else {
          favs.removeObject(feature);
        }
      } else {
        Ember.set(feature.properties, 'isFavorite', true);
        favs.addObject(feature);

        // let layerModelIndex = this.isLayerModelInArray(favs, feature.layerModel)
        // if (layerModelIndex !== false) {
        //   // favs = this.addNewFeatureToLayerModel(favs,layerModelIndex, feature)
        //   this.addNewFeatureToLayerModel(test,layerModelIndex, feature)
        // } else {
        //   // favs = this.addNewFeatureToNewLayerModel(favs, feature);
        //   this.addNewFeatureToNewLayerModel(test, feature)
        // }
        ///
        //favs.addObject(feature);
      }
      let test = Ember.A();
      let promise = new Ember.RSVP.Promise((resolve) => {
        resolve(favs);
      });
      test.addObject({ layerModel: feature.layerModel, features: promise });
      this.set('test', test);
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

  isLayerModelInArray(array, layerModel) {
    let res = false;
    array.forEach((item, index) => {
      if (item.layerModel.id === layerModel.id) {
        res = index;
      }
    });
    return res;
  },

  addNewFeatureToLayerModel(array, index, feature) {
    let features = array[index].features._result;
    array[index].features.then(items => {
      items.forEach(item => {
        console.log(item);
      });
    });
    features.push(feature);
    array[index].features = new Ember.RSVP.Promise((resolve) => {
      resolve(features);
    });

    // return array;
  },

  addNewFeatureToNewLayerModel(array,feature) {
    let featureArray = [];
    featureArray.push(feature);
    let promise = new Ember.RSVP.Promise((resolve) => {
      resolve(featureArray);
    });
    array.addObject({ layerModel: feature.layerModel, features: promise });

    // return array;
  }
});
