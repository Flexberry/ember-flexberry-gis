import Ember from 'ember';
const { getOwner } = Ember;

export default Ember.Mixin.create({
  model: null,

  layers: null,

  buildLayers(container) {
    let modellayers = this.get('model.layers') || [];
    let layers = [];
    modellayers.forEach(layer => {
      let creator = getOwner(this).lookup(`layer:${layer.get('type')}`);
      Ember.assert(`unknown layer type: ${layer.get('type')}`, creator);
      creator.buildLayer(container, layer);
      layers.push(creator);
    });

    this.set('layers', layers);
  },

  setOrder(indexed) {
    this._super(indexed);
    this.get('layers').forEach(layer => layer.setOrder(indexed));
  }
});
