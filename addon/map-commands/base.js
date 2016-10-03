/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Base map-command.

  @class BaseMapCommand
  @extends <a href="http://emberjs.com/api/classes/Ember.Object.html">Ember.Object</a>
  @uses <a href="http://emberjs.com/api/classes/Ember.Evented.html">Ember.Evented</a>
*/
export default Ember.Object.extend(Ember.Evented, {
  /**
    Flag: indicates whether map-command is executing now or not.

    @property _executing
    @type Boolean
    @default false
    @private
  */
  _executing: false,

  /**
    Leaflet map related to command.

    @property leafletMap
    @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
    @default null
  */
  leafletMap: null,

  /**
    Map layers hierarchy.

    @property layers
    @type Object[]
    @default null
  */
  layers: null,

  /**
    Executes map-command.

    @method _enable
    @private
  */
  _execute() {
  },

  /**
    Executes map-command.

    @method execute
  */
  execute() {
    if (this.get('_executing')) {
      return;
    }

    Ember.assert(
      `Wrong type of map-command \`leafletMap\` property: ` +
      `actual type is ${Ember.typeOf(this.get('leafletMap'))}, but \`L.Map\` is expected.`,
      this.get('leafletMap') instanceof L.Map);

    this.set('_executing', true);
    let executionResult = this._execute(...arguments);

    // Trigger 'execute' event.
    this.trigger('execute', { mapCommand: this, executionResult: executionResult });

    if (executionResult instanceof Ember.RSVP.Promise) {
      // Command is asynchronous & executing is in progress.
      executionResult.finally(() => {
        this.set('_executing', false);
      });
    } else {
      // Command isn't asynchronous & already executed.
      this.set('_executing', false);
    }
  },

  /**
    Event that signalizes that map-command starts execution.

    @method events.execute
  */
});
