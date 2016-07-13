import Ember from 'ember';

const { computed, run } = Ember;

export default Ember.Mixin.create({
  leafletEvents: null,

  _eventHandlers: null,

  usedLeafletEvents: computed('leafletEvents', function () {
    return (this.get('leafletEvents') || []).filter(eventName => {
      let methodName = '_' + eventName;
      let actionName = 'on' + Ember.String.classify(eventName);
      return this.get(methodName) !== undefined || this.get(actionName) !== undefined;
    });
  }),

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

      this._layer.addEventListener(eventName, eventHandlers[eventName], this);
    });

    this.set('_eventHandlers', eventHandlers);
  },

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
