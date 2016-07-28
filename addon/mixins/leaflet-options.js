/**
  @module ember-flexberry-gis
 */


import Ember from 'ember';

const { computed } = Ember;

/**
  Mixin for use in leaflet initialize objects with options.
  @example
    ```js
    import LeafletOptionsMixin from 'ember-flexberry-gis/mixins/leaflet-options';

    export default Ember.Component.extend(LeafletOptionsMixin, {
      leafletOptions: ["zoomControl", "center", "zoom"],

      zoomControl: false,

      center: L.latLng(0, 0),

      zoom: 5,

      initMap() {
        L.Map(this.element, this.get('options'));
      }
    })
    ```
  @class LeafletOptionsMixin
  @uses <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
 */
export default Ember.Mixin.create({
  /**
    Array of options names
    @property leafletOptions
    @type Array
    @default null
   */
  leafletOptions: null,

  /**
    Object with copy of this object properties with specified in leafletOptions names
    @property options
    @type Object
    @default {}
   */
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
