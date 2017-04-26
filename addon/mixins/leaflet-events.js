/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

const { computed, run } = Ember;

/**
  Leaflet events mixin.
  Listens to leaflet events & send related actions.

  @class LeafletEventsMixin
  @uses <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({
  /**
    Array of leaflet object events on which component should raise action.

    @property leafletEvents
    @type Array
    @default null
  */
  leafletEvents: null,

  /**
    Array of handlers for used leaflet object events.

    @property _eventHandlers
    @type Array
    @default null
    @private
  */
  _eventHandlers: null,

  /**
    Array of event names for which is present action or methodName.

    @property usedLeafletEvents
    @type String[]
  */
  usedLeafletEvents: computed('leafletEvents', function () {
    return (this.get('leafletEvents') || []).filter(eventName => {
      let methodName = '_' + eventName;
      let actionName = eventName;
      return this.get(methodName) !== undefined || this.get(actionName) !== undefined;
    });
  }),

  /**
    Add subscribe to leaflet object for all specified and used events.

    @method _addEventListeners
  */
  _addEventListeners() {
    let eventHandlers = {};
    this.get('usedLeafletEvents').forEach(eventName => {
      let actionName = eventName;
      let methodName = '_' + eventName;

      // Create an event handler that runs the function inside an event loop.
      eventHandlers[eventName] = function (e) {
        run.schedule('actions', this, function () {
          this.sendAction(actionName, e);

          // Allow classes to add custom logic on events as well.
          if (typeof this[methodName] === 'function') {
            Ember.run(this, this[methodName], e);
          }
        });
      };

      this.get('_leafletObject').addEventListener(eventName, eventHandlers[eventName], this);
    });

    this.set('_eventHandlers', eventHandlers);
  },

  /**
    Remove all event listeners from leaflet object.

    @method _removeEventListeners
  */
  _removeEventListeners() {
    let eventHandlers = this.get('_eventHandlers');
    let leafletObject = this.get('_leafletObject');
    if (Ember.isNone(eventHandlers) || Ember.isNone(leafletObject)) {
      return;
    }

    this.get('usedLeafletEvents').forEach(eventName => {
      leafletObject.removeEventListener(eventName,
        eventHandlers[eventName], this);
      delete eventHandlers[eventName];
    });
  },

  /**
    Removes attached event listeners on destroy.
  */
  willDestroyElement() {
    this._super(...arguments);
    this._removeEventListeners();
  }
});
