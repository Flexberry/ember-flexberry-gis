/**
  @module ember-flexberry-gis-dummy
*/

import EditMapController from 'ember-flexberry-gis/controllers/edit-map';
import EditFormControllerOperationsIndicationMixin from '../mixins/edit-form-controller-operations-indication';

/**
  Map controller.

  @class MapController
  @extends EditMapController
  @uses EditFormControllerOperationsIndicationMixin
*/
export default EditMapController.extend(
  EditFormControllerOperationsIndicationMixin, {
  /**
    Parent route.

    @property parentRoute
    @type String
    @default 'maps'
  */
  parentRoute: 'maps'
});
