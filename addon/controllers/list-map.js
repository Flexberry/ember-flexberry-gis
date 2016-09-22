/**
  @module ember-flexberry-gis
*/

import ListFormController from 'ember-flexberry/controllers/list-form';

/**
  List map controller.

  @class ListMapController
  @extends ListFormController
*/
export default ListFormController.extend({
  /**
    Name of related edit form route.

    @property editFormRoute
    @type String
    @default null
  */
  editFormRoute: null
});
