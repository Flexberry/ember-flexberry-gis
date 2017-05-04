/**
  @module ember-flexberry-gis
 */

import Ember from 'ember';

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
    Object containing properties marked as leaflet options.

    @property options
    @type Object
    @default null
   */
  options: null,

  /**
    Observes changes in each defined leaflet option and once call single '_leafletOptionsDidChange' handler

    @method _leafletObjectptionDidChange
    @private
  */
  _leafletOptionDidChange() {
    Ember.run.once(this, '_leafletOptionsDidChange');
  },

  /**
    Handles changes in leaflet options.
    Method will be called after changes in all options will be applied.

    @method _leafletOptionsDidChange
    @private
  */
  _leafletOptionsDidChange() {
    let options = {};
    let leafletOptions = Ember.A(this.get('leafletOptions') || []);

    leafletOptions.forEach((optionName) => {
      let optionValue = this.get(optionName);
      if (optionValue !== undefined) {
        options[optionName] = optionValue;
      }
    });

    this.set('options', options);
  },

  /**
    Initializes mixin.
  */
  init() {
    this._super(...arguments);

    let leafletOptions = Ember.A(this.get('leafletOptions') || []);
    leafletOptions.forEach((optionName) => {
      this.addObserver(optionName, this._leafletOptionDidChange);
    });

    this._leafletOptionsDidChange();
  },

  /**
    Destroys mixin.
  */
  willDestroy() {
    this._super(...arguments);

    let leafletOptions = Ember.A(this.get('leafletOptions') || []);
    leafletOptions.forEach((optionName) => {
      this.removeObserver(optionName, this._leafletOptionDidChange);
    });
  }
});
