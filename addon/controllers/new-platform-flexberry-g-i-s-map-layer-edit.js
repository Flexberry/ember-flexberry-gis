/**
  @module ember-flexberry-gis
*/

import BaseEditFormController from 'ember-flexberry/controllers/edit-form';

export default BaseEditFormController.extend({
  /**
    Route name for transition after close edit form.

    @property parentRoute
    @type String
    @default 'ember-flexberry-dummy-suggestion-list'
   */
  parentRoute: 'maps'
});
