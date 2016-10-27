/**
  @module ember-flexberry-gis-dummy
*/

import ListFormController from 'ember-flexberry/controllers/list-form';

/**
  CSW connections list controller.

  @class NewPlatformFlexberrtGISCswConnectionLController
  @extends ListFormController
*/
export default ListFormController.extend({
  /**
    Name of related edit form route.

    @property editFormRoute
    @type String
    @default 'new-platform-flexberry-g-i-s-csw-connection-e'
   */
  editFormRoute: 'new-platform-flexberry-g-i-s-csw-connection-e'
});
