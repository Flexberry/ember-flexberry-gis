/**
  @module ember-flexberry-gis-dummy
*/

import EditFormController from 'ember-flexberry/controllers/edit-form';
import EditFormControllerOperationsIndicationMixin from 'ember-flexberry/mixins/edit-form-controller-operations-indication';

/**
  Maps layers metadata edit controller.

  @class NewPlatformFlexberrtGISLayerMetadataEController
  @extends EditFormController
  @uses EditFormControllerOperationsIndicationMixin
*/
export default EditFormController.extend(EditFormControllerOperationsIndicationMixin, {
  /**
    Parent route.

    @property parentRoute
    @type String
    @default 'new-platform-flexberry-g-i-s-layer-metadata-l'
  */
  parentRoute: 'new-platform-flexberry-g-i-s-layer-metadata-l',

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
      this._mutateModel();

      this._super(...arguments);
    },

    /**
      Default action for button 'SaveAndClose'.

      @method actions.saveAndClose
    */
    saveAndClose() {
      this._mutateModel();

      this._super(...arguments);
    }
  },

  /**
    Mutates layer metadta model with properties sended from 'flexberry-edit-layermap' component.

    @method _mutateModel
    @private
  */
  _mutateModel() {
    let model = this.get('model');
    let layerProperties = this.get('getLayerProperties')();

    model.set('type', layerProperties.type);
    model.set('name', layerProperties.name);
    model.set('description', layerProperties.description);
    model.set('keyWords', layerProperties.keyWords);
    model.set('coordinateReferenceSystem', layerProperties.coordinateReferenceSystem);
    model.set('settings', layerProperties.settings);
  }
});
