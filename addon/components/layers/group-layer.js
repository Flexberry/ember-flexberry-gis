import BaseLayer from 'ember-flexberry-gis/components/base-layer';
import layout from '../../templates/components/layers/group-layer';

export default BaseLayer.extend({
  layout,

  setZIndex() {},

  createLayer() {
    return L.layerGroup();
  }
});
