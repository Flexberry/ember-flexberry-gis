/**
  @module ember-flexberry-gis-dummy
*/

import EditFormController from 'ember-flexberry/controllers/edit-form';
import EditFormControllerOperationsIndicationMixin from 'ember-flexberry/mixins/edit-form-controller-operations-indication';
import FlexberryLinksEditorActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-links-editor-actions-handler';

/**
  Maps layers metadata edit controller.

  @class NewPlatformFlexberrtGISLayerMetadataEController
  @extends EditFormController
  @uses EditFormControllerOperationsIndicationMixin
  @uses FlexberryLinksEditorActionsHandlerMixin
*/
export default EditFormController.extend(EditFormControllerOperationsIndicationMixin, FlexberryLinksEditorActionsHandlerMixin, {
  /**
    Parent route.

    @property parentRoute
    @type String
    @default 'new-platform-flexberry-g-i-s-layer-metadata-l'
  */
  parentRoute: 'new-platform-flexberry-g-i-s-layer-metadata-l',

  /**
    Layer's links' property path.

    @property linksPropertyPath
    @type String
    @default 'model.linkMetadata'
  */
  linksPropertyPath: 'model.linkMetadata',

  /**
    Layer's links' model name.

    @property linksModelName
    @type String
    @default 'new-platform-flexberry-g-i-s-link-metadata'
  */
  linksModelName: 'new-platform-flexberry-g-i-s-link-metadata',

  /**
    Layer's links' parameters model name.

    @property linksParametersModelName
    @type String
    @default 'new-platform-flexberry-g-i-s-parameter-metadata'
  */
  linksParametersModelName: 'new-platform-flexberry-g-i-s-parameter-metadata',

  /**
    Layer's links' parameters model projection.

    @property linksParametersModelProjection
    @type String
    @default 'ParameterMetadataD'
  */
  linksParametersModelProjection: 'ParameterMetadataD',

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

    for (let attr of Object.keys(layerProperties)) {
      model.set(attr, layerProperties[attr]);
    }
  }
});
