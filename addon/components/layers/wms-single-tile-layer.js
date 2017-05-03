/**
  @module ember-flexberry-gis
*/

import WmsLayerComponent from './wms-layer';

/**
  WMS single tile layer component for leaflet map.

  @class WMSSingleTileLayerComponent
  @extends WMSLayerComponent
 */
export default WmsLayerComponent.extend({

  /**
    Creates leaflet layer related to layer type.

    @method createLayer
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createLayer() {
    return L.WMS.overlayExtended(this.get('url'), this.get('options'));
  },
});
