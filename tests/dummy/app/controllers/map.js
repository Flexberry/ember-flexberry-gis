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
      },

      doSearch() {
        let queryString = this.get('queryString');
        let leafletMap = this.get('leafletMap');
        let e = {
          latlng: leafletMap.getCenter(),
          searchOptions: {
            queryString,
            maxResultsCount: 10
          },
          filter(layerComponent) {
            return layerComponent.get('layerModel.canBeSearched') && layerComponent.get('layerModel.visibility');
          },
          results: Ember.A()
        };

        leafletMap.fire('flexberry-map:search', e);

        this.set('searchResults', e.results);
      }
    },

    queryString: '',

    /**
      Parent route.

      @property parentRoute
      @type String
      @default 'maps'
    */
    parentRoute: 'maps'

  });
