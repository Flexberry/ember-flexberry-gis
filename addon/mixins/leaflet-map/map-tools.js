/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import LeafletMapVisibilityMixin from './map-visibility';

/**
  Mixin which injects map-tools methods & properties into leaflet map.

  @class LeafletMapToolsMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create(LeafletMapVisibilityMixin, {
  /**
    Performs some initialization before leaflet map will be initialized.

    @param {Object} leafletMap Leaflet map.
  */
  willInitLeafletMap(leafletMap) {
    this._super(...arguments);

    let owner = Ember.getOwner(this);

    let _this = this;

    // Default map-tool.
    let defaultMapTool = null;

    // Enabled map-tool;
    let enabledMapTool = null;

    // Cache containing already lookuped map-tools.
    let alreadyLookupedMapTools = {};

    // lookups specified map-tool with given tool properties.
    let lookupMapTool = (mapToolName, mapToolProperties) => {
      let mapTool = alreadyLookupedMapTools[mapToolName];
      if (Ember.isNone(mapTool)) {
        mapTool = owner.lookup(`map-tool:${mapToolName}`);
        Ember.assert(
          `Can't lookup \`map-tool:${mapToolName}\` such map-tool doesn\`t exist.`,
          !Ember.isNone(mapTool));

        mapTool.setProperties({
          name: mapToolName,
          leafletMap: leafletMap
        });

        alreadyLookupedMapTools[mapToolName] = mapTool;
      }

      if (!Ember.isNone(mapToolProperties)) {
        Ember.set(mapTool, 'mapToolProperties', mapToolProperties);
        Ember.A(Object.keys(mapToolProperties)).forEach((propertyName) => {
          Ember.set(mapTool, propertyName, Ember.get(mapToolProperties, propertyName));
        });
      }

      return mapTool;
    };

    // Define flexberryMap.tools namespace & related methods & properties.
    let tools = leafletMap.flexberryMap.tools = {

      // Sets default map-tool.
      setDefault(mapToolName, mapToolProperties) {
        let mapTool = lookupMapTool(mapToolName, mapToolProperties);
        if (Ember.isNone(mapTool)) {
          return;
        }

        defaultMapTool = mapTool;
        return defaultMapTool;
      },

      // Returns default map-tool.
      getDefault() {
        return defaultMapTool;
      },

      // Enables default map-tool.
      enableDefault(mapToolProperties) {
        Ember.assert(
          `Can't enable default map-tool because it isn't defined, ` +
          `use \`leafletMap.flexberryMap.tools.setDefault\` method to define it.`,
          !Ember.isNone(defaultMapTool));
        let defaultMapToolName = Ember.get(defaultMapTool, 'name');

        return tools.enable(defaultMapToolName, mapToolProperties);
      },

      // Enables specified map-tool.
      enable(mapToolName, mapToolProperties) {
        let mapTool = lookupMapTool(mapToolName, mapToolProperties);
        if (Ember.isNone(mapTool)) {
          return;
        }

        leafletMap.fire('flexberry-map:tools:choose', {
          mapTool: mapTool
        });

        if (mapTool === enabledMapTool) {
          return enabledMapTool;
        }

        // Disable enabled map-tool.
        // It will also trigger 'flexberry-map:tools:disable' event on leaflet map.
        if (!Ember.isNone(enabledMapTool)) {
          enabledMapTool.disable();
        }

        // Enable specified map-tool.
        // It will also trigger 'flexberry-map:tools:enable' event on leaflet map.
        mapTool.enable();
        enabledMapTool = mapTool;

        return enabledMapTool;
      },

      // Returns enabled map-tool.
      getEnabled() {
        return enabledMapTool;
      },

      // Sets map-tool properties without enabling or disabling it.
      setProperties(mapToolName, mapToolProperties) {
        return lookupMapTool(mapToolName, mapToolProperties);
      },

      // Hide map-tool.
      hide(mapCommandName) {
        let result = _this.showHide(mapCommandName, _this.addClassHidden, leafletMap, true);

        if (!result) {
          let mapTool = lookupMapTool(mapCommandName, null);
          if (Ember.isNone(mapTool)) {
            return;
          }

          mapTool.hideTool();
        }
      },

      // Show map-tool.
      show(mapCommandName) {
        let result = _this.showHide(mapCommandName, _this.removeClassHidden, leafletMap, true);

        if (!result) {
          let mapCommand = lookupMapTool(mapCommandName, null);
          if (Ember.isNone(mapCommand)) {
            return;
          }

          mapCommand.showTool();
        }
      },

      // Disables enabled map-tool.
      disable() {
        if (Ember.isNone(enabledMapTool)) {
          return;
        }

        // Disable enabled map-tool.
        // It will also trigger 'flexberry-map:tools:disable' event on leaflet map.
        let disabledMapTool = enabledMapTool;
        enabledMapTool.disable();

        // Enable default map-tool.
        // It will also trigger 'flexberry-map:tools:enable' event on leaflet map.
        defaultMapTool.enable();
        enabledMapTool = defaultMapTool;

        return disabledMapTool;
      },

      // Destroys specified map-tool.
      destroy(mapToolName) {
        let mapTool = alreadyLookupedMapTools[mapToolName];
        if (!Ember.isNone(mapTool)) {
          return;
        }

        Ember.assert(
          `Can't destroy \`map-tool:${mapToolName}\` it is set as map's currently enabled map-tool, ` +
          `use \`leafletMap.flexberryMap.tools.disable\` method to disable it.`,
          Ember.isNone(enabledMapTool) || Ember.get(enabledMapTool, 'name') !== mapToolName);

        Ember.assert(
          `Can't destroy \`map-tool:${mapToolName}\` it is set as map's default map-tool, ` +
          `use \`leafletMap.flexberryMap.tools.setDefault\` method to set another map-tool as default.`,
          Ember.isNone(defaultMapTool) || Ember.get(defaultMapTool, 'name') !== mapToolName);

        mapTool.destroy();

        delete alreadyLookupedMapTools[mapToolName];
      },

      // Destroys flexberryMap.tools.
      _destroy() {
        // Remove flexberryMap.tools namespace & related methods & properties.
        defaultMapTool = null;
        enabledMapTool = null;

        Ember.A(Object.keys(alreadyLookupedMapTools)).forEach((mapToolName) => {
          let mapTool = alreadyLookupedMapTools[mapToolName];
          mapTool.destroy();

          delete alreadyLookupedMapTools[mapToolName];
        });

        delete leafletMap.flexberryMap.tools;
      }
    };

    // Set 'drag' map-tool as default & enable it.
    Ember.run.scheduleOnce('afterRender', this, function () {
      tools.setDefault('drag');
      tools.enable('drag');
    });
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
