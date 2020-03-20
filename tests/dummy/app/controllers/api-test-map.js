/**
  @module ember-flexberry-gis-dummy
*/

import Ember from 'ember';
import MapController from './map';

/**
  Map controller.

  @class MapController
  @extends EditMapController
  @uses EditFormControllerOperationsIndicationMixin
*/
export default MapController.extend({
  /**
    Service for managing map API.

    @property mapApi
    @type MapApiService
  */
  mapApi: Ember.inject.service(),

  actions: {
    /**
      Sets layerInitCallback function.

      @method  actions.applyApiSettings
    */
    applyApiSettings() {
      this.get('mapApi').addToApi('layerInitCallback', function(model) {
        let layer = model.getLeafletObject();
        layer.eachLayer(function(layerr) {
          switch (model.layerModel.get('id')) {
            case 'f7670a1f-1acb-4571-923c-1ce3bc88e11e':
              layerr.setStyle({ color: '#808000', fillColor: '#FFD700' });
              break;
            case 'f8dec493-d879-49ae-ad55-f4f18c89cb88':
              layerr.setStyle({ color: '#008B8B' });
              break;
          }

          layerr.on('click', function(e) {
            window.alert(e.target.feature.properties.name);
          });
        });
      });

      this.send('refreshMap');
    },

    onIdentificationFinished(e) {
      let leafletMap = this.get('leafletMap');
      let identifyServiceLayer = this.get('identifyServiceLayer');
      if (identifyServiceLayer) {
        identifyServiceLayer.clearLayers();
      } else {
        this.set('identifyServiceLayer', e.serviceLayer || L.featureGroup().addTo(leafletMap));
      }

      this.set('polygonLayer', e.polygonLayer);
      this.set('identifyToolResults', e.results);

      if (this.get('sidebar.2.active') !== true) {
        this.set('sidebar.2.active', true);
      }

      if (!this.get('sidebarOpened')) {
        this.send('toggleSidebar', {
          changed: false
        });
      }
    },
  }
});
