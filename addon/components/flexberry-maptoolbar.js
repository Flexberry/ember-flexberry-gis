import Ember from 'ember';
import layout from '../templates/components/flexberry-maptoolbar';
import draggingTool from 'ember-flexberry-gis/maptools/dragging';

const { getOwner } = Ember;

export default Ember.Component.extend({
  layout,

  leafletMap: null,

  activeTool: null,

  actions: {

    activateTool(toolname) {
      let leafletMap = this.get('leafletMap');
      let tool = getOwner(this).lookup('maptool:' + toolname);
      let activeTool = this.get('activeTool');
      if (!tool.isMultiTool() && tool === activeTool) {
        return;
      }
      if (tool && leafletMap) {
        if(!activeTool && leafletMap.dragging.enabled())
        {
          activeTool = draggingTool.create({ map: leafletMap });
        }

        tool.set('map', leafletMap);
        if (activeTool && !activeTool.isMultiTool()) {
          activeTool.disable();
        }

        tool.enable();
        this.set('activeTool', tool);
      }
    },

    callCommand(commandName) {
      let command = getOwner(this).lookup('mapcommand:' + commandName);
      let leafletMap = this.get('leafletMap');
      if (command && leafletMap) {
        command.execute(leafletMap);
      }
    }
  }
});
