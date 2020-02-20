import Ember from 'ember';
import layout from '../templates/components/favorites-list';
import LeafletZoomToFeatureMixin from '../mixins/leaflet-zoom-to-feature';
export default Ember.Component.extend(LeafletZoomToFeatureMixin, {

  /**
    Reference to component's template.
  */
  layout,

  /**
    Array contains identification result features and layerModels.

    @property features
    @type Array
    @default Ember.A()
  */
  features: Ember.A(),

  /**
    Array contains identification result features and layerModels.

    @property features
    @type Array
    @default null
  */
  data: null,

  /**
    Flag indicates if comapre button disabled.
    @property compareBtnDisabled
    @type Boolean
    @default true
  */
  compareBtnDisabled: true,

  test: Ember.A(),
  
  mapApi: Ember.inject.service(),

  onTwoObjectsChange: Ember.observer('features.[]', function() {
    this.set('data', this.get('features'));
  }),
  // onTwoObjectsChange: Ember.observer('test.[]', function() {
  //   let _this = this
  //   let api = this.get('mapApi');
  //   api.addToApi('getLayerFeatureId', function(layer, layerObject) {
  //     if (layerObject.feature.properties.hasOwnProperty('primarykey')) {
  //       return layerObject.feature.properties.primarykey;
  //     }
  //     return layerObject.feature.properties.name;
  //   });

  //   api.addToApi('readyMapLayers', function() {
  //     return new Ember.RSVP.Promise(resolve=>{
  //       resolve();
  //     })
  //   });
  //   let r = api.getFromApi('readyMapLayers');
  //   r().then(()=> {
  //     setTimeout(function(){
  //       _this.fromIdArrayToFeatureArray(_this.get('test'));
  //     }, 2000)
    
  //   });
  // }),

  // fromIdArrayToFeatureArray(favFeaturesIds) {
    
  //   let api = this.get('mapApi').getFromApi('mapModel');
  //   let favFeatures = Ember.A();
  //   favFeaturesIds.forEach(layer => {
  //     let [layerModel, lealfetObject, featureLayer] = api._getModelLayerFeature(layer.layerId, layer.featureId);
  //     let layerModelIndex = this.isLayerModelInArray(favFeatures, layerModel);
  //     if (layerModelIndex !== false) {
  //       favFeatures = this.addNewFeatureToLayerModel(favFeatures, layerModelIndex, featureLayer);
  //     } else {
  //       favFeatures = this.addNewFeatureToNewLayerModel(favFeatures, layerModel, featureLayer);
  //     }
  //   })
  //   let layerModelPromise = Ember.A();
  //   favFeatures.forEach(object => {
  //     let promise = new Ember.RSVP.Promise((resolve) => {
  //       resolve(object.features);
  //     });
  //     layerModelPromise.addObject({ layerModel: object.layerModel, features: promise });
  //   });
  //   this.set('features', favFeatures);
  //   this.set('data', layerModelPromise);
   
  // },

  // addNewFeatureToLayerModel(array, index, feature) {
  //   let features = array[index].features;
  //   features.push(feature);
  //   return array;
  // },

  // /**
  //   Adding new layer model and new feature to array.

  //     @method addNewFeatureToNewLayerModel
  // */
  // addNewFeatureToNewLayerModel(array, layerModel, feature) {
  //   let featureArray = Ember.A();
  //   featureArray.addObject(feature);
  //   array.addObject({ layerModel: layerModel, features: featureArray });
  //   return array;
  // },

  actions: {

    /**
      Action adds feature to favorites.

      @method actions.addToFavorite
      @param feature
    */
    addToFavorite(feature) {
      this.sendAction('addToFavorite', feature);
    },

    /**
      Action open compare geometries panel.

      @method actions.compareTwoGeometries
    */
    compareTwoGeometries() {
      this.sendAction('compareTwoGeometries');
    },

    /**
      Action handles click on checkbox.

      @method actions.addToCompareGeometries
      @param feature
    */
    addToCompareGeometries(feature) {
      this.sendAction('addToCompareGeometries', feature);
    },

    /**
      Action hadles click on intersection icon.

      @method showIntersectionPanel
      @param feature
    */
    showIntersectionPanel(feature) {
      this.sendAction('showIntersectionPanel', feature);
    }
  }
});
