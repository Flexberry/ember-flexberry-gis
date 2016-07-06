import Ember from 'ember';
const { computed, assert } = Ember;

export default Ember.Object.extend({
  layer: undefined,

  container: undefined,

  leafletLayer: undefined,

  leafletRequiredOptions: [],

  requiredOptions: computed(function() {
    let leafletRequiredOptions = this.get('leafletRequiredOptions');
    let options = [];
    leafletRequiredOptions.forEach(optionName => {
      let optionValue = this.get('layer.settingsAsObject')[optionName];
      assert(`\`${optionName}\` is a required option but its value was \`${optionValue}\``, optionValue);
      options.push(optionValue);
    });
    return options;
  }),

  leafletOptions: [],

  options: computed(function() {
    let leafletOptions = this.get('leafletOptions');
    let options = {};
    leafletOptions.forEach(optionName => {
      let optionValue = this.get('layer.settingsAsObject')[optionName];
      if (optionValue !== undefined) {
        options[optionName] = optionValue;
      }
    });
    return options;
  }),

  toggleVisible: function() {
    if(this.get('layer.visibility')){
      this.get('container').addLayer(this.get('leafletLayer'));
    }
    else{
      this.get('container').removeLayer(this.get('leafletLayer'));
    }
  },

  createLayer() {
    assert('BaseLayer\'s `createLayer` should be overriden.');
  },

  buildLayer(container, layer) {
    assert('Should be built with container', container);
    assert('Should be built with layer', layer);

    this.set('layer', layer);
    this.set('container', container);
    this.set('leafletLayer', this.createLayer());
    this.toggleVisible();
  }

});
