/**
  @module ember-flexberry-gis-dummy
*/

import ListFormController from 'ember-flexberry/controllers/list-form';

/**
  Maps layers metadata list controller.

  @class NewPlatformFlexberrtGISLayerMetadataLController
  @extends ListFormController
*/
export default ListFormController.extend({
  /**
    Name of related edit form route.

    @property editFormRoute
    @type String
    @default 'new-platform-flexberry-g-i-s-layer-metadata-e'
   */
  editFormRoute: 'new-platform-flexberry-g-i-s-layer-metadata-e'
});
