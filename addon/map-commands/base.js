/**
  @module ember-flexberry-gis
*/

import { Promise } from 'rsvp';

import { scheduleOnce } from '@ember/runloop';
import { typeOf } from '@ember/utils';
import { assert } from '@ember/debug';
import { inject as service } from '@ember/service';
import Evented from '@ember/object/evented';
import EmberObject from '@ember/object';
import LeafletMapVisibilityMixin from '../mixins/leaflet-map/map-visibility';

/**
  Base map-command.

  @class BaseMapCommand
  @extends <a href="http://emberjs.com/api/classes/Ember.Object.html">Ember.Object</a>
  @uses <a href="http://emberjs.com/api/classes/Ember.Evented.html">Ember.Evented</a>
*/
export default EmberObject.extend(Evented,
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
    i18n: service('i18n'),

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

    leafletMapExecute(leafletMap, executionResult) {
      // Trigger common 'execute' event.
      leafletMap.fire('flexberry-map:commands:execute', {
        mapCommand: this,
        executionResult,
        args: arguments,
      });

      // Trigger command specific 'execute' event.
      const mapCommandName = this.get('name');
      leafletMap.fire(`flexberry-map:commands:${mapCommandName}:execute`, {
        mapCommand: this,
        executionResult,
        args: arguments,
      });
    },

    /**
    Executes map-command.

    @method execute
  */
    execute() {
      if (this.get('_executing')) {
        return;
      }

      const leafletMap = this.get('leafletMap');
      assert(
        'Wrong type of map-command `leafletMap` property: '
      + `actual type is ${typeOf(this.get('leafletMap'))}, but \`L.Map\` is expected.`,
        leafletMap instanceof L.Map
      );

      this.set('_executing', true);
      const executionResult = this._execute(...arguments);

      scheduleOnce('afterRender', this, this.leafletMapExecute, leafletMap, executionResult);

      if (executionResult instanceof Promise) {
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
      const mapCommandName = this.get('name');
      this.showHideTool(mapCommandName, false, this.addClassHidden);
    },

    showCommand() {
      const mapCommandName = this.get('name');
      this.showHideTool(mapCommandName, false, this.removeClassHidden);
    },
  });
