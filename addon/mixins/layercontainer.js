import Ember from 'ember';
const { getOwner } = Ember;

export default Ember.Mixin.create({
  layers: undefined,

  buildLayers(container, model) {
    let modellayers = model.get('layers') || [];
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
