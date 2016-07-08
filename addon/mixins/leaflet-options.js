import Ember from 'ember';

const { computed, assert } = Ember;

export default Ember.Mixin.create({
  model: null,

  leafletRequiredOptions: [],

  requiredOptions: computed(function () {
    let leafletRequiredOptions = this.get('leafletRequiredOptions');
    let options = [];
    leafletRequiredOptions.forEach(optionName => {
      let optionValue = this.get('model.settingsAsObject')[optionName];
      assert(`\`${optionName}\` is a required option but its value was \`${optionValue}\``, optionValue);
      options.push(optionValue);
    });
    return options;
  }),

  leafletOptions: [],

  options: computed(function () {
    let leafletOptions = this.get('leafletOptions');
    let options = {};
    leafletOptions.forEach(optionName => {
      let optionValue = this.get('model.settingsAsObject')[optionName];
      if (optionValue !== undefined) {
        options[optionName] = optionValue;
      }
    });
    return options;
  }),
});
