import Ember from 'ember';

const { computed, assert } = Ember;

export default Ember.Mixin.create({

  leafletRequiredOptions: null,

  requiredOptions: computed(function () {
    let leafletRequiredOptions = this.get('leafletRequiredOptions') || [];
    let options = [];
    leafletRequiredOptions.forEach(optionName => {
      let optionValue = this.get(optionName);
      assert(`\`${optionName}\` is a required option but its value was \`${optionValue}\``, optionValue);
      options.push(optionValue);
    });
    return options;
  })
});
