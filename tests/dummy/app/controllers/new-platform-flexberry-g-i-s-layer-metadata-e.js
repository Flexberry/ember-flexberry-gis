/**
  @module ember-flexberry-gis-dummy
*/

import EditFormController from 'ember-flexberry/controllers/edit-form';
import EditFormControllerOperationsIndicationMixin from '../mixins/edit-form-controller-operations-indication';
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
      let model = this.get('model');
      let layerProperties = this.get('getLayerProperties')();

      model.set('type', layerProperties.type);
      model.set('name', layerProperties.name);
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
