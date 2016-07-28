/**
  @module ember-flexberry-gis
 */


import Ember from 'ember';

const { computed, run } = Ember;

/**
  Mixin for create actions in components for leaflet objects.
  @class LeafletEventsMixin
  @uses <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
 */
export default Ember.Mixin.create({
  /**
    Array of leaflet object events on which component should raise action
    @property leafletEvents
    @type Array
    @default null
   */
  leafletEvents: null,

  /**
    Array of handlers for used leaflet object events
    @property _eventHandlers
    @type Array
    @defaul null
    @private
   */
  _eventHandlers: null,

  /**
    Array of event names for which is present action or methodName
    @property usedLeafletEvents
    @type Array
   */
  usedLeafletEvents: computed('leafletEvents', function () {
    return (this.get('leafletEvents') || []).filter(eventName => {
      let methodName = '_' + eventName;
      let actionName = 'on' + Ember.String.classify(eventName);
      return this.get(methodName) !== undefined || this.get(actionName) !== undefined;
    });
  }),

  /**
    Add subscribe to leaflet object for all specified and used events
    @method _addEventListeners
   */
  _addEventListeners() {
    let eventHandlers = {};
    this.get('usedLeafletEvents').forEach(eventName => {

      let actionName = 'on' + Ember.String.classify(eventName);
      let methodName = '_' + eventName;
      // create an event handler that runs the function inside an event loop.
      eventHandlers[eventName] = function (e) {
        run.schedule('actions', this, function () {
          //try to invoke/send an action for this event
          this.sendAction(actionName, e);
          //allow classes to add custom logic on events as well
          if (typeof this[methodName] === 'function') {
            Ember.run(this, this[methodName], e);
          }
        });
      };

      this.get('_layer').addEventListener(eventName, eventHandlers[eventName], this);
    });

    this.set('_eventHandlers', eventHandlers);
  },

  /**
    Remove all event listeners from leaflet object
    @method _removeEventListeners
   */
  _removeEventListeners() {
    let eventHandlers = this.get('_eventHandlers');
    if (eventHandlers) {
      this.get('usedLeafletEvents').forEach(eventName => {
        this._layer.removeEventListener(eventName,
          eventHandlers[eventName], this);
        delete eventHandlers[eventName];
      });
    }
  },

  willDestroyElement() {
    this._super(...arguments);
    this._removeEventListeners();
  }

});
