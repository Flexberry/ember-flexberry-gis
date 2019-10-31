/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Mixin which injects interaction methods & properties into leaflet map.

  @class LeafletMapInteractionMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({
  /**
    Performs some initialization before leaflet map will be initialized.

    @param {Object} leafletMap Leaflet map.
  */
  willInitLeafletMap(leafletMap) {
    this._super(...arguments);

    // Flag: indicates whether map interaction is enabled at the moment or not.
    let interactionIsEnabled = true;

    // Retrieve & remember all map interaction handlers.
    let handlers = Ember.A(leafletMap._handlers);

    // Retrieved 'enable' methods related to handlers.
    let handlersOriginalEnableMethods = Ember.A(handlers.map((handler) => {
      return handler.enable;
    }));

    // Array containing disabled handlers.
    let disabledHandlers = Ember.A();

    // Override handlers 'enable' method to prevent their enabling if interaction is disabled.
    handlers.forEach((handler) => {
      let originalEnable = handler.enable;
      handler.enable = (...args) => {
        if (!interactionIsEnabled) {
          return;
        }

        originalEnable.apply(handler, args);
      };
    });

    // Override leaflet map's '_fireDOMEvent' method to prevent DOM events from being triggered while interaction is disabled.
    // Call to L.DOMEvent.StopPropagation fore every particular markup's element isn't rational &
    // anyway doesn't take an effect, so override leaflet map's '_fireDOMEvent' method is effective solution.
    let originalFireDOMEvent = leafletMap._fireDOMEvent;
    leafletMap._fireDOMEvent = (...args) => {
      if (!interactionIsEnabled) {
        return;
      }

      originalFireDOMEvent.apply(leafletMap, args);
    };

    // Define flexberryMap.interaction namespace & related methods & properties.
    leafletMap.flexberryMap.interaction = {

      // Returns flag indicating whether map interaction is enabled at the moment or not.
      isEnabled() {
        return interactionIsEnabled;
      },

      // Enables map interaction.
      enable() {
        if (interactionIsEnabled) {
          return;
        }

        // Restore disabled handlers.
        interactionIsEnabled = true;
        disabledHandlers.forEach((handler) => {
          handler.enable();
        });

        disabledHandlers.clear();
      },

      // Disables map interaction.
      disable() {
        if (!interactionIsEnabled) {
          return;
        }

        // Remember current handlers states & disable them,
        // to disable dragging, zoom, keyboard events handling, etc.
        handlers.forEach((handler) => {
          if (handler.enabled()) {
            // Disable handler.
            handler.disable();

            // Remember disabled handler to restore it later.
            disabledHandlers.pushObject(handler);
          }
        });

        interactionIsEnabled = false;
      },

      // Destroys flexberryMap.interaction.
      _destroy() {
        // Restore overridden methods.
        leafletMap._fireDOMEvent = originalFireDOMEvent;
        handlers.forEach((handler, i) => {
          handler.enable = handlersOriginalEnableMethods[i];
        });

        // Clear all collections.
        disabledHandlers.clear();
        handlersOriginalEnableMethods.clear();
        handlers.clear();

        // Remove flexberryMap.interaction namespace & related methods & properties.
        delete leafletMap.flexberryMap.interaction;
      }
    };
  },

  /**
    Performs some clean up before leaflet map will be destroyed.

    @param {Object} leafletMap Leaflet map.
  */
  willDestroyLeafletMap(leafletMap) {
    this._super(...arguments);

    leafletMap.flexberryMap.interaction._destroy();
  }
});
