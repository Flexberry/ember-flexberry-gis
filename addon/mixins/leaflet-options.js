/**
  @module ember-flexberry-gis
 */

import Ember from 'ember';

/**
  Mixin containing logic aggregating propertis marked as leaflet options into 'options' JSON-object.

  @example
    ```js
    import LeafletOptionsMixin from 'ember-flexberry-gis/mixins/leaflet-options';

    export default Ember.Component.extend(LeafletOptionsMixin, {
      leafletOptions: ['zoomControl', 'center', 'zoom', 'coordsToLatLng', 'pointToLayer'],

      leafletOptionsCallbacks: ['coordsToLatLng', 'pointToLayer'],

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
    Array containing properties which are also leaflet options.

    @property leafletOptions
    @type Array
    @default null
  */
  leafletOptions: null,

  /**
    Array containing properties which are also leaflet options callbacks.

    @property leafletOptionsCallbacks
    @type Stirng[]
  */
  leafletOptionsCallbacks: null,

  /**
    Hash containing default implementations for leaflet options callbacks.

    @property defaultLeafletOptionsCallbacks
    @type Object
  */
  defaultLeafletOptionsCallbacks: null,

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
    let previousOptions = this.get('options');
    let leafletOptions = Ember.A(this.get('leafletOptions') || []);
    let changedOptions = Ember.A();

    // Parse options.
    leafletOptions.forEach((optionName) => {
      let optionValue = this.get(optionName);
      if (optionValue === undefined) {
        return;
      }

      options[optionName] = optionValue;

      if (Ember.isNone(previousOptions)) {
        return;
      }

      let previousOptionValue = Ember.get(previousOptions, optionName);
      if (JSON.stringify(optionValue) !== JSON.stringify(previousOptionValue)) {
        changedOptions.pushObject(optionName);
      }
    });

    // Parse options which are also callback functions.
    let leafletOptionsCallbacks = this.get('leafletOptionsCallbacks');
    if (Ember.isArray(leafletOptionsCallbacks) && leafletOptionsCallbacks.length > 0) {
      for (let i = 0; i < leafletOptionsCallbacks.length; i++) {
        let callbackName = leafletOptionsCallbacks[i];

        let customCallback = Ember.get(options, callbackName);
        customCallback = this.parseLeafletOptionsCallback({ callbackName, serializedCallback: customCallback });

        let resultingCallback;
        if (typeof customCallback === 'function') {
          resultingCallback = customCallback;
        } else {
          let defaultCallback = this.get(`defaultLeafletOptionsCallbacks.${callbackName}`);
          resultingCallback = typeof defaultCallback === 'function' ? defaultCallback.bind(this) : null;
        }

        if (typeof resultingCallback === 'function') {
          Ember.set(options, callbackName, resultingCallback);
        }
      }
    }

    // Set parsed options.
    this.set('options', options);

    if (Ember.typeOf(this.leafletOptionsDidChange) === 'function') {
      this.leafletOptionsDidChange.call(this, {
        changedOptions
      });
    }
  },

  /**
    Parses specified serialized callback into function.

    @method parseLeafletOptionsCallback
    @param {Object} options Method options.
    @param {String} options.callbackName Callback name.
    @param {String} options.serializedCallback Serialized callback.
    @return {Function} Deserialized callback function.
  */
  parseLeafletOptionsCallback({ callbackName, serializedCallback }) {
    return typeof serializedCallback === 'string' && !Ember.isBlank(serializedCallback) ?
      new Function('return ' + serializedCallback)() :
      null;
  },

  /**
    Handles changes in leaflet options.
    Method will be called after changes in all options will be applied.

    @method leafletOptionsDidChange
    @param {String[]} changedOptions Array containing names of all changed options.
  */
  leafletOptionsDidChange() {
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
