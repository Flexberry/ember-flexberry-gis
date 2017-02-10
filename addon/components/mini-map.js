/**
  @module ember-flexberry-gis
 */

import BaseControl from 'ember-flexberry-gis/components/base-control';

/**
  Mini-map component for leaflet map
  @class MiniMapComponent
  @extends BaseControlComponent
*/
export default BaseControl.extend({

  createControl() {
    var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osm2 = new L.TileLayer(osmUrl, { minZoom: 0, maxZoom: 13 });
    return new L.Control.MiniMap(osm2, { toggleDisplay: true, collapsedWidth: 18, collapsedHeight:18 });
  }
});
