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

  layerGroup: L.layerGroup(),

  createControl() {
    return new L.Control.MiniMap(this.get('layerGroup'), { toggleDisplay: true, collapsedWidth: 18, collapsedHeight:18 });
  }
});
