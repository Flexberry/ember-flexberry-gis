/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import LeafletZoomToFeatureMixin from '../mixins/leaflet-zoom-to-feature';
import { translationMacro as t } from 'ember-i18n';

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

  /**
    Observer for leafletMap property.

    @property onLeafletMapDidChange
    @private
    @readonly
  */
  _onLeafletMapDidChange: Ember.observer('leafletMap', function() {
    let leafletMap = this.get('leafletMap');
    leafletMap.on('flexberry-map:load', (e) => {
      Ember.RSVP.allSettled(e.results).then(() => {    
        let store = this.get('store');
        let idFeaturesArray = store.findAll('i-i-s-r-g-i-s-p-k-favorite-features');
        idFeaturesArray.then((result) => {
          this.fromIdArrayToFeatureArray(result);                        
        });
      });
    });
  }),

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
      let store = this.get('store');
      let favFeatures = this.get('favFeatures');
      let layerModelIndex = this.isLayerModelInArray(favFeatures, feature.layerModel);
      if (Ember.get(feature.properties, 'isFavorite')) {
        Ember.set(feature.properties, 'isFavorite', false);
        if (layerModelIndex !== false) {
          favFeatures = this.removeFeatureFromLayerModel(favFeatures, layerModelIndex, feature);
          // let record = store.peekAll('i-i-s-r-g-i-s-p-k-favorite-features')
          // .filterBy('objectKey', feature.properties.primarykey)
          // .filterBy('objectLayerKey', feature.layerModel.id);
          // record[0].destroyRecord();
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
          // let record = store.createRecord('i-i-s-r-g-i-s-p-k-favorite-features', {objectKey: feature.properties.primarykey, objectLayerKey: feature.layerModel.id});
          // record.save(); 
        } else {
          favFeatures = this.addNewFeatureToNewLayerModel(favFeatures, feature.layerModel, feature);
          // let record = store.createRecord('i-i-s-r-g-i-s-p-k-favorite-features', {objectKey: feature.properties.primarykey, objectLayerKey: feature.layerModel.id});
          // record.save();
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

  /**
    Remove feature from fav features list.

    @method removeFeatureFromLayerModel
  */
  removeFeatureFromLayerModel(array, index, feature) {
    let features = array[index].features;
    features.removeObject(feature);
    if (features.length === 0) {
      array.removeAt(index);
    }

    return array;
  },

  /**
    Get features from array of ids.

    @method fromIdArrayToFeatureArray
  */
  fromIdArrayToFeatureArray(favFeaturesIds) {  
    let favFeatures = Ember.A();
    favFeaturesIds.forEach(layer => {
      let [layerModel, featureLayer] = this.getModelLayerFeature(layer.get('objectLayerKey'), layer.get('objectKey'));
      featureLayer.feature.leafletLayer = L.geoJSON(featureLayer.feature, { color: featureLayer.options.color});
      featureLayer.feature.layerModel = layerModel;
      Ember.set(featureLayer.feature.properties, 'isFavorite', true);
      let layerModelIndex = this.isLayerModelInArray(favFeatures, layerModel);
      if (layerModelIndex !== false) {
        favFeatures = this.addNewFeatureToLayerModel(favFeatures, layerModelIndex, featureLayer.feature);
      } else {
        favFeatures = this.addNewFeatureToNewLayerModel(favFeatures, layerModel, featureLayer.feature);
      }
    });

    let layerModelPromise = Ember.A();
    favFeatures.forEach(object => {
      let promise = new Ember.RSVP.Promise((resolve) => {
        resolve(object.features);
      });
      layerModelPromise.addObject({ layerModel: object.layerModel, features: promise });
    });
    this.set('favFeatures', favFeatures);
    this.set('result', layerModelPromise);
  },

  /**
    Get [layerModel, featureLayer] by layer id or layer id and object id.

    @param {string} layerId Layer id.
    @param {string} [featureId] Object id.
    @returns {[layerModel, leafletObject, featureLayer]} Get [layerModel, featureLayer] or [layerModel, undefined].
    @private
  */
  getModelLayerFeature(layerId, featureId) {
    let layerModel = this.get('model.hierarchy').findBy('id', layerId);
    let leafletObject = layerModel.get('_leafletObject');
    let layers = leafletObject._layers;
    let featureLayer;
    if (!Ember.isNone(featureId)) {
      featureLayer = Object.values(layers).find(feature => {
        const layerFeatureId = feature.feature.properties.primarykey;
        return layerFeatureId === featureId;
      });
    }

    return [layerModel, featureLayer];
  },
});
