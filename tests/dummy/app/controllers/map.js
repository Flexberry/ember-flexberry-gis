/**
  @module ember-flexberry-gis-dummy
*/

import Ember from 'ember';
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

    actions: {
      toggleSidebar(sidebar, context) {
        Ember.$(sidebar)
          .sidebar({
            context: Ember.$(context),
            dimPage: false,
            closable: false
          })
          .sidebar('setting', 'transition', 'overlay')
          .sidebar('toggle');
      }
    },

    /**
      Parent route.

      @property parentRoute
      @type String
      @default 'maps'
    */
    parentRoute: 'maps'

  });
