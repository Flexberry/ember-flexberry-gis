/**
  @module ember-flexberry-gis-dummy
*/

import ListMapController from 'ember-flexberry-gis/controllers/list-map';

/**
  Maps controller.

  @class MapsController
  @extends ListMapController
*/
export default ListMapController.extend({
  /**
    Name of related edit form route.

    @property editFormRoute
    @type String
    @default 'map'
  */
  editFormRoute: 'map'
});
