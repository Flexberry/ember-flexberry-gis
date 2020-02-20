/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import { translationMacro as t } from 'ember-i18n';
export default Ember.Mixin.create({

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

  favServiceLayer: L.featureGroup(),

  /**
    Array of items in fav list.
    @property favFeatures
    @type Array
    @default Ember.A()
  */
  favFeatures: Ember.A(),

   /**
    Array of items in fav list.
    @property favFeatures
    @type Array
    @default Ember.A()
  */
  favFeaturesIds1: Ember.A(),

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
  _onTwoObjectToCompareChange: Ember.observer('twoObjectToCompare.[]', function() {
    if (this.get('twoObjectToCompare').length === 2) {
      this.set('compareBtnDisabled', false);
    } else {
      this.set('compareBtnDisabled', true);
    }
  }),

  mapApi: Ember.inject.service(),

  onLeafletMapChange: Ember.observer('model', function () {
    let service = this.get('service');
    let className = this.get('_storageClassName');
    let key = this.get('model.id');
    this.set('favFeaturesIds1', service.getFromStorage(className, key));
    let _this = this
    let api = this.get('mapApi');
    api.addToApi('getLayerFeatureId', function(layer, layerObject) {
      if (layerObject.feature.properties.hasOwnProperty('primarykey')) {
        return layerObject.feature.properties.primarykey;
      }
      return layerObject.feature.properties.name;
    });

    api.addToApi('readyMapLayers', function() {
      return new Ember.RSVP.Promise(resolve=>{
        resolve();
      })
    });
    let r = api.getFromApi('readyMapLayers');
    r().then(()=> {
      setTimeout(function(){
        let service = _this.get('service');
        let className = _this.get('_storageClassName');
        let key = _this.get('model.id');
        _this.set('favFeaturesIds1', service.getFromStorage(className, key));
        _this.fromIdArrayToFeatureArray(_this.get('favFeaturesIds1'));
      }, 2000)
    
    });
      
    
   
    // service.setToStorage(className, key, );
  }), 

  storageService: Ember.inject.service('local-storage'),

  store: Ember.inject.service(),

  /**
    Current instance class name for storage.

    @property storageClassName
    @type string
    @default 'bookmarks'
    @private
    */
  _storageClassName: 'favlist',

  /**
    Map's id (primarykey). Key for storage.

    @property storageKey
    @type string
    @default null
    @public
  */
  storageKey: 'fav',

  actions: {
    /**
      Handles click on favorite icon.

      @method addToFavorite
      @param feature
    */
    addToFavorite(feature) {
      const map = this.get('leafletMap');
      let favFeatures = this.get('favFeatures');
      let favFeaturesIds = this.get('favFeaturesIds1');
      let service = this.get('service');
      let className = this.get('_storageClassName');
      let key = this.get('model.id');
      let layerModelIndex = this.isLayerModelInArray(favFeatures, feature.layerModel);
      if (Ember.get(feature.properties, 'isFavorite')) {
        Ember.set(feature.properties, 'isFavorite', false);
        if (layerModelIndex !== false) {
          favFeatures = this.removeFeatureFromLayerModel(favFeatures, layerModelIndex, feature);
          ////
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
          // let featureIds = {layerId: feature.layerModel.id, featureId: feature.properties.name}
          // favFeaturesIds.pushObject(featureIds)
          // console.log(favFeaturesIds)
          // service.setToStorage(className, key, favFeaturesIds);
          // this.set('favFeaturesIds1', favFeaturesIds);
        } else {
          favFeatures = this.addNewFeatureToNewLayerModel(favFeatures, feature.layerModel, feature);
          console.log('feature from identification:',feature);
          // let featureIds = {layerId: feature.layerModel.id, featureId: feature.properties.name}
          // favFeaturesIds.pushObject(featureIds)
          // console.log(favFeaturesIds)
          // service.setToStorage(className, key, favFeaturesIds);
          // this.set('favFeaturesIds1', favFeaturesIds);
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
  addNewFeatureToNewLayerModel(array, layerModel, feature) {
    let featureArray = Ember.A();
    featureArray.addObject(feature);
    array.addObject({ layerModel: layerModel, features: featureArray });
    return array;
  },

  removeFeatureFromLayerModel(array, index, feature) {
    let features = array[index].features;
    features.removeObject(feature);
    if (features.length === 0) {
      array.removeAt(index);
    }

    return array;
  },

  fromIdArrayToFeatureArray(favFeaturesIds) {
    
    let api = this.get('mapApi').getFromApi('mapModel');
    let favFeatures = Ember.A();
    favFeaturesIds.forEach(layer => {
      let [layerModel, lealfetObject, featureLayer] = api._getModelLayerFeature(layer.layerId, layer.featureId);
      featureLayer.feature.leafletLayer = lealfetObject;
      featureLayer.feature.layerModel = layerModel;
      let layerModelIndex = this.isLayerModelInArray(favFeatures, layerModel);
      if (layerModelIndex !== false) {
        favFeatures = this.addNewFeatureToLayerModel(favFeatures, layerModelIndex, featureLayer.feature);
      } else {
        favFeatures = this.addNewFeatureToNewLayerModel(favFeatures, layerModel, featureLayer.feature);
      }
      console.log(featureLayer.feature)
    })

    let layerModelPromise = Ember.A();
    favFeatures.forEach(object => {
      let promise = new Ember.RSVP.Promise((resolve) => {
        resolve(object.features);
      });
      layerModelPromise.addObject({ layerModel: object.layerModel, features: promise });
    });
    this.set('favFeatures', favFeatures);
    this.set('result', layerModelPromise);
   
  }
});
