/**
  @module ember-flexberry-gis
*/

import { scheduleOnce } from '@ember/runloop';

import { A } from '@ember/array';
import { set, get } from '@ember/object';
import { assert } from '@ember/debug';
import { isNone } from '@ember/utils';
import { getOwner } from '@ember/application';
import Mixin from '@ember/object/mixin';
import LeafletMapVisibilityMixin from './map-visibility';

/**
  Mixin which injects map-tools methods & properties into leaflet map.

  @class LeafletMapToolsMixin
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

    // Default map-tool.
    let defaultMapTool = null;

    // Enabled map-tool;
    let enabledMapTool = null;

    // Cache containing already lookuped map-tools.
    const alreadyLookupedMapTools = {};

    // lookups specified map-tool with given tool properties.
    const lookupMapTool = (mapToolName, mapToolProperties) => {
      let mapTool = alreadyLookupedMapTools[mapToolName];
      if (isNone(mapTool)) {
        mapTool = owner.lookup(`map-tool:${mapToolName}`);
        assert(
          `Can't lookup \`map-tool:${mapToolName}\` such map-tool doesn\`t exist.`,
          !isNone(mapTool)
        );

        mapTool.setProperties({
          name: mapToolName,
          leafletMap,
        });

        alreadyLookupedMapTools[mapToolName] = mapTool;
      }

      if (!isNone(mapToolProperties)) {
        set(mapTool, 'mapToolProperties', mapToolProperties);
        A(Object.keys(mapToolProperties)).forEach((propertyName) => {
          set(mapTool, propertyName, get(mapToolProperties, propertyName));
        });
      }

      return mapTool;
    };

    // Define flexberryMap.tools namespace & related methods & properties.
    const tools = leafletMap.flexberryMap.tools = {

      // Sets default map-tool.
      setDefault(mapToolName, mapToolProperties) {
        const mapTool = lookupMapTool(mapToolName, mapToolProperties);
        if (isNone(mapTool)) {
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
        assert(
          'Can\'t enable default map-tool because it isn\'t defined, '
          + 'use `leafletMap.flexberryMap.tools.setDefault` method to define it.',
          !isNone(defaultMapTool)
        );
        const defaultMapToolName = get(defaultMapTool, 'name');

        return tools.enable(defaultMapToolName, mapToolProperties);
      },

      // Enables specified map-tool.
      enable(mapToolName, mapToolProperties) {
        const mapTool = lookupMapTool(mapToolName, mapToolProperties);
        if (isNone(mapTool)) {
          return;
        }

        leafletMap.fire('flexberry-map:tools:choose', {
          mapTool,
        });

        if (mapTool === enabledMapTool) {
          return enabledMapTool;
        }

        // Disable enabled map-tool.
        // It will also trigger 'flexberry-map:tools:disable' event on leaflet map.
        if (!isNone(enabledMapTool)) {
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
        const result = _this.showHide(mapCommandName, _this.addClassHidden, leafletMap, true);

        if (!result) {
          const mapCommand = lookupMapTool(mapCommandName, null);
          if (isNone(mapCommand)) {
            return;
          }

          mapCommand.hideTool();
        }
      },

      // Show map-tool.
      show(mapCommandName) {
        const result = _this.showHide(mapCommandName, _this.removeClassHidden, leafletMap, true);

        if (!result) {
          const mapCommand = lookupMapTool(mapCommandName, null);
          if (isNone(mapCommand)) {
            return;
          }

          mapCommand.showTool();
        }
      },

      // Disables enabled map-tool.
      disable() {
        if (isNone(enabledMapTool)) {
          return;
        }

        // Disable enabled map-tool.
        // It will also trigger 'flexberry-map:tools:disable' event on leaflet map.
        const disabledMapTool = enabledMapTool;
        enabledMapTool.disable();

        // Enable default map-tool.
        // It will also trigger 'flexberry-map:tools:enable' event on leaflet map.
        defaultMapTool.enable();
        enabledMapTool = defaultMapTool;

        return disabledMapTool;
      },

      // Destroys specified map-tool.
      destroy(mapToolName) {
        const mapTool = alreadyLookupedMapTools[mapToolName];
        if (!isNone(mapTool)) {
          return;
        }

        assert(
          `Can't destroy \`map-tool:${mapToolName}\` it is set as map's currently enabled map-tool, `
          + 'use `leafletMap.flexberryMap.tools.disable` method to disable it.',
          isNone(enabledMapTool) || get(enabledMapTool, 'name') !== mapToolName
        );

        assert(
          `Can't destroy \`map-tool:${mapToolName}\` it is set as map's default map-tool, `
          + 'use `leafletMap.flexberryMap.tools.setDefault` method to set another map-tool as default.',
          isNone(defaultMapTool) || get(defaultMapTool, 'name') !== mapToolName
        );

        mapTool.destroy();

        delete alreadyLookupedMapTools[mapToolName];
      },

      // Destroys flexberryMap.tools.
      _destroy() {
        // Remove flexberryMap.tools namespace & related methods & properties.
        defaultMapTool = null;
        enabledMapTool = null;

        A(Object.keys(alreadyLookupedMapTools)).forEach((mapToolName) => {
          const mapTool = alreadyLookupedMapTools[mapToolName];
          mapTool.destroy();

          delete alreadyLookupedMapTools[mapToolName];
        });

        delete leafletMap.flexberryMap.tools;
      },
    };

    // Set 'drag' map-tool as default & enable it.
    scheduleOnce('afterRender', this, function () {
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
  },
});
