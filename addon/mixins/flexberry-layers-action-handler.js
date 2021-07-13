import Ember from 'ember';

/**
  Mixin containing handlers for
  {{#crossLink "BaseLayerComponent"}}flexberry layers component's{{/crossLink}} actions.

  @class FlexberryLayerActionsHandlerMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/

export default Ember.Mixin.create({
  actions: {

    /**
      Handles {{#crossLink "BaseLayerComponent/sendingActions.layerInit"}}base layer component's 'layerInit' action{{/crossLink}}.

      @method actions.onLayerInit
      @param {Object} e Action's event object.
      @param {Object} eventObject.leafletObject Created (leaflet layer)[http://leafletjs.com/reference-1.2.0.html#layer]
      @param {NewPlatformFlexberryGISMapLayerModel} eventObject.layerModel Current layer model
    */
    onLayerInit(e) {
      e.layerModel.set('layerInitialized', true);
    }
  }
});
