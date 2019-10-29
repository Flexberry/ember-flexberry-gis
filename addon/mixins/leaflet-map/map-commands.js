/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Mixin which injects map-commands methods & properties into leaflet map.

  @class LeafletMapCommandsMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({
  /**
    Performs some initialization before leaflet map will be initialized.

    @param {Object} leafletMap Leaflet map.
  */
  willInitLeafletMap(leafletMap) {
    this._super(...arguments);

    let owner = Ember.getOwner(this);

    // Cache containing already lookuped map-commands.
    let alreadyLookupedMapCommands = {};

    // lookups specified map-command with given command properties.
    let lookupMapCommand = (mapCommandName, mapCommandProperties) => {
      let mapCommand = alreadyLookupedMapCommands[mapCommandName];
      if (Ember.isNone(mapCommand)) {
        mapCommand = owner.lookup(`map-command:${mapCommandName}`);
        Ember.assert(
          `Can't lookup \`map-command:${mapCommandName}\` such map-command doesn\`t exist.`,
          !Ember.isNone(mapCommand));

        mapCommand.setProperties({
          name: mapCommandName,
          leafletMap: leafletMap
        });

        alreadyLookupedMapCommands[mapCommandName] = mapCommand;
      }

      if (!Ember.isNone(mapCommandProperties)) {
        Ember.A(Object.keys(mapCommandProperties)).forEach((propertyName) => {
          Ember.set(mapCommand, propertyName, Ember.get(mapCommandProperties, propertyName));
        });
      }

      return mapCommand;
    };

    // Define flexberryMap.commands namespace & related methods & properties.
    let commands = leafletMap.flexberryMap.commands = {
      // Executes specified map-command.
      execute(mapCommandName, mapCommandProperties, mapCommandExecutionOptions) {
        let mapCommand = lookupMapCommand(mapCommandName, mapCommandProperties);
        if (Ember.isNone(mapCommand)) {
          return;
        }

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
        let mapCommand = alreadyLookupedMapCommands[mapCommandName];
        if (!Ember.isNone(mapCommand)) {
          return;
        }

        mapCommand.destroy();

        delete alreadyLookupedMapCommands[mapCommandName];
      },

      // Destroys flexberryMap.tools.
      _destroy() {
        // Remove flexberryMap.commands namespace & related methods & properties.
        Ember.A(Object.keys(alreadyLookupedMapCommands)).forEach((mapCommandName) => {
          let mapCommand = alreadyLookupedMapCommands[mapCommandName];
          mapCommand.destroy();

          delete alreadyLookupedMapCommands[mapCommandName];
        });

        delete leafletMap.flexberryMap.commands;
      }
    };
  },

  /**
    Performs some clean up before leaflet map will be destroyed.

    @param {Object} leafletMap Leaflet map.
  */
  willDestroyLeafletMap(leafletMap) {
    this._super(...arguments);

    leafletMap.flexberryMap.commands._destroy();
  }
});
