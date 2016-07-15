/**
  @module ember-flexberry-gis
 */

import BaseLayer from 'ember-flexberry-gis/components/base-layer';
import layout from '../../templates/components/layers/group-layer';

/**
  GroupLayerComponent for leaflet map.
  @class GroupLayerComponent
  @extend BaseLayerComponent
 */
export default BaseLayer.extend({
  layout,

  /**
    Should not call setZIndex for layer, such as L.LayerGroup.setZIndex set passed index for each child layer.
   */
  setZIndex() {},

  createLayer() {
    return L.layerGroup();
  }
});
