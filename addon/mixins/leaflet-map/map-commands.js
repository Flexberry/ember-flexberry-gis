/**
  @module ember-flexberry-gis
*/

import { set, get } from '@ember/object';

import { A } from '@ember/array';
import { assert } from '@ember/debug';
import { isNone } from '@ember/utils';
import { getOwner } from '@ember/application';
import Mixin from '@ember/object/mixin';
import LeafletMapVisibilityMixin from './map-visibility';

/**
  Mixin which injects map-commands methods & properties into leaflet map.

  @class LeafletMapCommandsMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Mixin.create(LeafletMapVisibilityMixin, {
  /**
    Performs some initialization before leaflet map will be initialized.

    @param {Object} leafletMap Leaflet map.
  */
  willInitLeafletMap(leafletMap) {
    this._super(...arguments);

    const owner = getOwner(this);

    const _this = this;

    // Cache containing already lookuped map-commands.
    const alreadyLookupedMapCommands = {};

    // lookups specified map-command with given command properties.
    const lookupMapCommand = (mapCommandName, mapCommandProperties) => {
      let mapCommand = alreadyLookupedMapCommands[mapCommandName];
      if (isNone(mapCommand)) {
        mapCommand = owner.lookup(`map-command:${mapCommandName}`);
        assert(
          `Can't lookup \`map-command:${mapCommandName}\` such map-command doesn\`t exist.`,
          !isNone(mapCommand)
        );

        mapCommand.setProperties({
          name: mapCommandName,
          leafletMap,
        });

        alreadyLookupedMapCommands[mapCommandName] = mapCommand;
      }

      if (!isNone(mapCommandProperties)) {
        A(Object.keys(mapCommandProperties)).forEach((propertyName) => {
          set(mapCommand, propertyName, get(mapCommandProperties, propertyName));
        });
      }

      return mapCommand;
    };

    // Define flexberryMap.commands namespace & related methods & properties.
    leafletMap.flexberryMap.commands = {

      // Executes specified map-command.
      execute(mapCommandName, mapCommandProperties, mapCommandExecutionOptions) {
        const mapCommand = lookupMapCommand(mapCommandName, mapCommandProperties);
        if (isNone(mapCommand)) {
          return;
        }

        leafletMap.fire('flexberry-map:commands:choose', {
          mapCommand,
        });

        // Execute specified map-command.
        // It will also trigger 'flexberry-map:commands:execute' event on leaflet map.
        return mapCommand.execute(mapCommandExecutionOptions);
      },

      // Sets map-tool properties without enabling or disbling it.
      setProperties(mapCommandName, mapCommandProperties) {
        lookupMapCommand(mapCommandName, mapCommandProperties);
      },

      // Destroys specified map-command.
      destroy(mapCommandName) {
        const mapCommand = alreadyLookupedMapCommands[mapCommandName];
        if (!isNone(mapCommand)) {
          return;
        }

        mapCommand.destroy();

        delete alreadyLookupedMapCommands[mapCommandName];
      },

      // Destroys flexberryMap.tools.
      _destroy() {
        // Remove flexberryMap.commands namespace & related methods & properties.
        A(Object.keys(alreadyLookupedMapCommands)).forEach((mapCommandName) => {
          const mapCommand = alreadyLookupedMapCommands[mapCommandName];
          mapCommand.destroy();

          delete alreadyLookupedMapCommands[mapCommandName];
        });

        delete leafletMap.flexberryMap.commands;
      },

      // Hide map-command.
      hide(mapCommandName) {
        const result = _this.showHide(mapCommandName, _this.addClassHidden, leafletMap, false);

        if (!result) {
          const mapCommand = lookupMapCommand(mapCommandName, null);
          if (isNone(mapCommand)) {
            return;
          }

          mapCommand.hideCommand();
        }
      },

      // Show map-command.
      show(mapCommandName) {
        const result = _this.showHide(mapCommandName, _this.removeClassHidden, leafletMap, false);

        if (!result) {
          const mapCommand = lookupMapCommand(mapCommandName, null);
          if (isNone(mapCommand)) {
            return;
          }

          mapCommand.showCommand();
        }
      },
    };
  },

  /**
    Performs some clean up before leaflet map will be destroyed.

    @param {Object} leafletMap Leaflet map.
  */
  willDestroyLeafletMap(leafletMap) {
    this._super(...arguments);

    leafletMap.flexberryMap.commands._destroy();
  },
});
