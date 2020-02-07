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
  onTwoObjectsChange: Ember.observer('test.[]', function() {
     // console.log(layers);
     
    //  let l = this.get('mapApi').getFromApi('mapModel').hierarchy;
    //  console.log(l);
    //  l.forEach(item => {
    //    console.log(item._leafletObject)
    //  })
    // let [layerModel, leafletObject, featureLayer] = this.get('mapApi').getFromApi('mapModel')._getModelLayerFeature(favFeaturesIds[0].layerId, favFeaturesIds[0].featureId);
    // console.log(featureLayer)
    // console.log(leafletObject)
    
    // let favFeatures = this.get('favFeatures');
    // favFeaturesIds.forEach(item => {
    //   let layer = layers.findBy('id', item.layerId);
    //   let features = Ember.get(layer, '_leafletObject._layers') || {};
    //   let object = Object.values(features).find(feature => {
    //     return feature.properties.primarykey === item.featureId;
    //   });
    //   console.log(object);
    //   let layerModelIndex = this.isLayerModelInArray(favFeatures, object.layerModel);
    // });
  }),
 

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
