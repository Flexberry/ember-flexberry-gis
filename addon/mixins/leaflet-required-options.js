/**
  @module ember-flexberry-gis
 */

import Ember from 'ember';

const { computed, assert } = Ember;

/**
  Mixin for use in leaflet initialize objects with required properties.
  @example
    ```js
    import LeafletRequiredOptionsMixin from 'ember-flexberry-gis/mixins/leaflet-required-options';

    export default Ember.Component.extend(LeafletRequiredOptionsMixin, {
      leafletRequiredOptions: ["url"],

      url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

      createLayer() {
        return L.TileLayer(...this.get('requiredOptions'));
      }
    })
    ```
  @class LeafletRequiredOptionsMixin
  @uses <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
 */
export default Ember.Mixin.create({

  /**
    Array of required options names.
    @property leafletRequiredOptions
    @type Array
    @default null
   */
  leafletRequiredOptions: null,

  /**
    Array values this object properties by specified in leafletRequiredOptions names.
    Throw error if property value is not set.
    @property requiredOptions
    @type Array
    @default []
   */
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
