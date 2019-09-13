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
  actions: {
    /**
      Sets layerInitCallback function.

      @method  actions.applyApiSettings
    */
    applyApiSettings() {
      if (Ember.isNone(window.mapApi)) {
        window.mapApi = {};
      }

      window.mapApi.layerInitCallback = function(model) {
        model.getLeafletObject().then(function(layer) {
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
      };

      this.send('refreshMap');
    },
  }
});
