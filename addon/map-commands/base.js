/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import LeafletMapVisibilityMixin from '../mixins/leaflet-map/map-visibility';

/**
  Base map-command.

  @class BaseMapCommand
  @extends <a href="http://emberjs.com/api/classes/Ember.Object.html">Ember.Object</a>
  @uses <a href="http://emberjs.com/api/classes/Ember.Evented.html">Ember.Evented</a>
*/
export default Ember.Object.extend(Ember.Evented,
  LeafletMapVisibilityMixin, {
  /**
    Flag: indicates whether map-command is executing now or not.

    @property _executing
    @type Boolean
    @default false
    @private
  */
  _executing: false,

  /**
    Reference to i18n service.

    @property i18n
    @type <a href="https://github.com/jamesarosen/ember-i18n">I18nService</a>
    @default Ember.inject.service('i18n')
  */
  i18n: Ember.inject.service('i18n'),

  /**
    Tool's name.

    @property name
    @type String
    @default null
  */
  name: null,

  /**
    Leaflet map related to command.

    @property leafletMap
    @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
    @default null
  */
  leafletMap: null,

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

    let leafletMap = this.get('leafletMap');
    Ember.assert(
      `Wrong type of map-command \`leafletMap\` property: ` +
      `actual type is ${Ember.typeOf(this.get('leafletMap'))}, but \`L.Map\` is expected.`,
      leafletMap instanceof L.Map);

    this.set('_executing', true);
    let executionResult = this._execute(...arguments);

    Ember.run.scheduleOnce('afterRender', this, function () {

      // Trigger common 'execute' event.
      leafletMap.fire('flexberry-map:commands:execute', {
        mapCommand: this,
        executionResult: executionResult,
        arguments: arguments
      });

      // Trigger command specific 'execute' event.
      let mapCommandName = this.get('name');
      leafletMap.fire(`flexberry-map:commands:${mapCommandName}:execute`, {
        mapCommand: this,
        executionResult: executionResult,
        arguments: arguments
      });
    });

    if (executionResult instanceof Ember.RSVP.Promise) {
      // Command is asynchronous & executing is in progress.
      executionResult.finally(() => {
        this.set('_executing', false);
      });
    } else {
      // Command isn't asynchronous & already executed.
      this.set('_executing', false);
    }

    return executionResult;
  },

  hideCommand() {
    let mapCommandName = this.get('name');
    this.showHideTool(mapCommandName, false, this.addClassHidden);
  },

  showCommand() {
    let mapCommandName = this.get('name');
    this.showHideTool(mapCommandName, false, this.removeClassHidden);
  }
});
