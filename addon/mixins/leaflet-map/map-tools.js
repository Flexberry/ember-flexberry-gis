/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Mixin which injects map-tools methods & properties into leaflet map.

  @class LeafletMapToolsMixin
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

    // Default map-tool.
    let defaultMapTool = null;

    // Enabled map-tool;
    let enabledMapTool = null;

    // Cache containing already lookuped map-tools.
    let alreadyLookupedMapTools = {};

    // lookups specified map-tool with given options.
    let lookupMapTool = (mapToolName) => {
      let mapTool = alreadyLookupedMapTools[mapToolName];
      if (Ember.isNone(mapTool)) {
        mapTool = owner.lookup(`map-tool:${mapToolName}`);
        mapTool.setProperties({
          name: mapToolName,
          leafletMap: leafletMap
        });

        alreadyLookupedMapTools[mapToolName] = mapTool;
      }

      Ember.assert(
        `Can't lookup \`map-tool:${mapToolName}\` such map-tool doesn\`t exist`,
        !Ember.isNone(mapTool));

      return mapTool;
    };

    // Define flexberryMap.tools namespace & related methods & properties.
    let tools = leafletMap.flexberryMap.tools = {

      // Sets default map-tool.
      setDefault: (mapToolName) => {
        let mapTool = lookupMapTool(mapToolName);
        if (Ember.isNone(mapTool)) {
          return;
        }

        defaultMapTool = mapTool;
        return defaultMapTool;
      },

      // Returns default map-tool.
      getDefault: () => {
        return defaultMapTool;
      },

      // Enables specified map-tool.
      enable: (mapToolName, options) => {
        let mapTool = lookupMapTool(mapToolName, options);
        if (Ember.isNone(mapTool)) {
          return;
        }

        // Disable enabled map-tool.
        if (!Ember.isNone(enabledMapTool)) {
          enabledMapTool.disable();
        }

        // Enable specified map-tool.
        mapTool.enable(options);
        enabledMapTool = mapTool;

        return enabledMapTool;
      },

      // Disables enabled map-tool.
      disable: (options) => {
        if (Ember.isNone(enabledMapTool)) {
          return;
        }

        // Disable enabled map-tool.
        let disabledMapTool = enabledMapTool;
        enabledMapTool.disable(options);

        // Enable default map-tool.
        defaultMapTool.enable();
        enabledMapTool = defaultMapTool;

        return disabledMapTool;
      },

      // Returns enabled map-tool.
      getEnabled: () => {
        return enabledMapTool;
      },

      // Destroys flexberryMap.tools.
      _destroy: () => {
        // Remove flexberryMap.tools namespace & related methods & properties.
        defaultMapTool = null;
        enabledMapTool = null;

        Ember.A(Object.keys(alreadyLookupedMapTools)).forEach((mapToolName) => {
          delete alreadyLookupedMapTools[mapToolName];
        });

        delete leafletMap.flexberryMap.tools;
      }
    };

    // Set 'drag' map-tool as default & enable it.
    tools.setDefault('drag');
    tools.enable('drag');
  },

  /**
    Performs some clean up before leaflet map will be destroyed.

    @param {Object} leafletMap Leaflet map.
  */
  willDestroyLeafletMap(leafletMap) {
    this._super(...arguments);

    leafletMap.flexberryMap.tools._destroy();
  }
});
