/**
  @module ember-flexberry-gis
 */

import { get, set } from '@ember/object';

import { isNone, typeOf, isBlank } from '@ember/utils';
import { A, isArray } from '@ember/array';
import { once } from '@ember/runloop';
import Mixin from '@ember/object/mixin';

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
export default Mixin.create({
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
    once(this, '_leafletOptionsDidChange');
  },

  /**
    Handles changes in leaflet options.
    Method will be called after changes in all options will be applied.

    @method _leafletOptionsDidChange
    @private
  */
  _leafletOptionsDidChange() {
    const options = {};
    const previousOptions = this.get('options');
    const leafletOptions = A(this.get('leafletOptions') || []);
    const changedOptions = A();

    // Parse options.
    leafletOptions.forEach((optionName) => {
      const optionValue = this.get(optionName);
      if (optionValue === undefined) {
        return;
      }

      options[optionName] = optionValue;

      if (isNone(previousOptions)) {
        return;
      }

      const previousOptionValue = get(previousOptions, optionName);
      if (JSON.stringify(optionValue) !== JSON.stringify(previousOptionValue)) {
        changedOptions.pushObject(optionName);
      }
    });

    // Parse options which are also callback functions.
    const leafletOptionsCallbacks = this.get('leafletOptionsCallbacks');
    if (isArray(leafletOptionsCallbacks) && leafletOptionsCallbacks.length > 0) {
      for (let i = 0; i < leafletOptionsCallbacks.length; i++) {
        const callbackName = leafletOptionsCallbacks[i];

        let customCallback = get(options, callbackName);
        customCallback = this.parseLeafletOptionsCallback({ callbackName, serializedCallback: customCallback, });

        let resultingCallback;
        if (typeof customCallback === 'function') {
          resultingCallback = customCallback;
        } else {
          const defaultCallback = this.get(`defaultLeafletOptionsCallbacks.${callbackName}`);
          resultingCallback = typeof defaultCallback === 'function' ? defaultCallback.bind(this) : null;
        }

        if (typeof resultingCallback === 'function') {
          set(options, callbackName, resultingCallback);
        }
      }
    }

    // Set parsed options.
    this.set('options', options);

    if (typeOf(this.leafletOptionsDidChange) === 'function') {
      this.leafletOptionsDidChange.call(this, {
        changedOptions,
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
  parseLeafletOptionsCallback({ serializedCallback, }) {
    const f = function () {
      return serializedCallback;
    };
    return typeof serializedCallback === 'string' && !isBlank(serializedCallback)
      ? f()
      : null;
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

    const leafletOptions = A(this.get('leafletOptions') || []);
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

    const leafletOptions = A(this.get('leafletOptions') || []);
    leafletOptions.forEach((optionName) => {
      this.removeObserver(optionName, this._leafletOptionDidChange);
    });
  },
});
