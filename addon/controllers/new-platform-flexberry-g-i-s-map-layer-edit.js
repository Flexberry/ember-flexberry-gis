/**
  @module ember-flexberry-gis
*/

import BaseEditFormController from 'ember-flexberry/controllers/edit-form';

/**
  Controller for edit form of {{#crossLink "NewPlatformFlexberryGISMapLayer"}}{{/crossLink}}.

  @class NewPlatformFlexberryGISMapLayerEditController
  @extends BaseEditFormController
*/
export default BaseEditFormController.extend({
  /**
    Route name for transition after close edit form.

    @property parentRoute
    @type String
    @default 'maps'
   */
  parentRoute: 'maps'
});
