import BaseLayer from './base-layer';
import ContainerMixin from 'ember-flexberry-gis/mixins/layercontainer';

export default BaseLayer.extend(ContainerMixin, {
  createLayer() {
    let leafLayer = L.layerGroup();
    this.buildLayers(leafLayer, this.get('model'));
    return leafLayer;
  }
});
