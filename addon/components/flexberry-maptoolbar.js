import Ember from 'ember';
import layout from '../templates/components/flexberry-maptoolbar';
import DragMaptool from '../maptools/drag';

const { getOwner } = Ember;

export default Ember.Component.extend({
  layout,

  leafletMap: null,

  activeTool: null,

  activeToolName: null,

  actions: {
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
        this.set('activeToolName', toolname);
      }
    },

    callCommand(commandName, ...args) {
      let command = getOwner(this).lookup('mapcommand:' + commandName);
      let leafletMap = this.get('leafletMap');
      if (command && leafletMap) {
        command.execute(leafletMap, ...args);
      }
    }
  }
});
