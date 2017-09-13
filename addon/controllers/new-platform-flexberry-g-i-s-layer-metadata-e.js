/**
  @module ember-flexberry-gis-dummy
*/

import EditFormController from 'ember-flexberry/controllers/edit-form';
import EditFormControllerOperationsIndicationMixin from 'ember-flexberry-gis/mixins/edit-form-controller-operations-indication';

/**
  Maps layers metadata edit controller.

  @class NewPlatformFlexberrtGISLayerMetadataEController
  @extends EditFormController
  @uses EditFormControllerOperationsIndicationMixin
*/
export default EditFormController.extend(EditFormControllerOperationsIndicationMixin, {
  actions: {
    /**
      Handles {{#crossLink "FlexberryEditLayerComponent/sendingActions.onInit:method"}}'flexberry-edit-layer' component's 'onInit' action{{/crossLink}}.

      @method actions.initLayerProperties
    */
    initLayerProperties(getLayerPropertiesFunction) {
      this.set('getLayerProperties', getLayerPropertiesFunction);
    },

    /**
      Default action for button 'Save'.

      @method actions.save
    */
    save() {
      let model = this.get('model');
      let layerProperties = this.get('getLayerProperties')();

      model.set('type', layerProperties.type);
      model.set('name', layerProperties.name);
      model.set('scale', layerProperties.scale);
      model.set('coordinateReferenceSystem', layerProperties.coordinateReferenceSystem);
      model.set('settings', layerProperties.settings);

      this._super(...arguments);
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
