/**
  @module ember-flexberry-gis-dummy
*/

import EditFormController from 'ember-flexberry/controllers/edit-form';
import EditFormControllerOperationsIndicationMixin from '../mixins/edit-form-controller-operations-indication';

/**
  Maps layers metadata edit controller.

  @class NewPlatformFlexberrtGISLayerMetadataEController
  @extends EditFormController
  @uses EditFormControllerOperationsIndicationMixin
*/
export default EditFormController.extend(EditFormControllerOperationsIndicationMixin, {
  
  actions: {
    onLayerProperties(getLayerProperties){
      this.set('getLayerProperties', getLayerProperties);
    },

    onApprove(){
      let model = this.get('model');
      let layerProperties = this.get('getLayerProperties')()
      
      model.set('type', layerProperties.type);
      model.set('name', layerProperties.name);
      model.set('coordinateReferenceSystem', layerProperties.coordinateReferenceSystem);
      model.set('settings', layerProperties.settings);

      this.save();
    }
  },
  /**
    Parent route.

    @property parentRoute
    @type String
    @default 'new-platform-flexberry-g-i-s-layer-metadata-l'
  */
  parentRoute: 'new-platform-flexberry-g-i-s-layer-metadata-l',
});
