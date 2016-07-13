import Ember from 'ember';

const { computed } = Ember;

export default Ember.Mixin.create({
  leafletOptions: null,

  options: computed(function () {
    let leafletOptions = this.get('leafletOptions') || [];
    let options = {};
    leafletOptions.forEach(optionName => {
      let optionValue = this.get(optionName);
      if (optionValue !== undefined) {
        options[optionName] = optionValue;
      }
    });
    return options;
  }),
});
