/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/flexberry-maptoolbar';
import DragMaptool from '../maptools/drag';

const { getOwner } = Ember;

/**
  Map toolbar component.

  @class FlexberryMaptoolbarComponet
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend({
  /**
    Component's template reference.
  */
  layout,

  /**
    Related leaflet map.

    @property leafletMap
    @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
    @default null
  */
  leafletMap: null,

  /**
    Currently active tool.

    @property activeTool
    @type BaseMaptool
    @default null
  */
  activeTool: null,

  actions: {
    /**
      Handles 'activateTool' action.
      Activates map tool with the specified name.

      @method actions.activateTool
      @param {string} toolname Name of those map tool that must be activated.
      @param {Object[]} [...args] Additional arguments that will be passed to
      {{#crossLink "BaseMaptool/enable:method"}}map tool's 'enable' method{{/crossLink}}.
    */
    activateTool(toolname, ...args) {
      let leafletMap = this.get('leafletMap');
      let tool = getOwner(this).lookup('maptool:' + toolname);
      let activeTool = this.get('activeTool');
      if (!tool.multitool && tool === activeTool) {
        return;
      }
      if (tool && leafletMap) {
        if(!activeTool && leafletMap.dragging.enabled())
        {
          activeTool = DragMaptool.create({ map: leafletMap });
        }

        tool.set('map', leafletMap);
        if (activeTool && !activeTool.multitool) {
          activeTool.disable();
        }

        tool.enable(...args);
        this.set('activeTool', tool);
      }
    },

    /**
      Handles 'callCommand' action.
      Executes map command with the specified name.

      @method actions.callCommand
      @param {string} commandName Name of those map command that must be called.
      @param {Object[]} [...args] Additional arguments that will be passed to
      {{#crossLink "BaseMapcommand/execute:method"}}map tool's 'execute' method{{/crossLink}}.
    */
    callCommand(commandName, ...args) {
      let command = getOwner(this).lookup('mapcommand:' + commandName);
      let leafletMap = this.get('leafletMap');
      if (command && leafletMap) {
        command.execute(leafletMap, ...args);
      }
    }
  }
});
