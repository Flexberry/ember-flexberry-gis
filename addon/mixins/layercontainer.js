import Ember from 'ember';
const { getOwner } = Ember;

export default Ember.Mixin.create({
  layers: [],

  buildLayers(container, model) {
    let modellayers = model.get('layers') || [];
    modellayers.forEach(layer => {
      let creator = getOwner(this).lookup(`layer:${layer.get('type')}`);
      Ember.assert(`unknown layer type: ${layer.get('type')}`, creator);
      creator.buildLayer(container, layer);
      this.layers.push(creator);
    });
  },
});
