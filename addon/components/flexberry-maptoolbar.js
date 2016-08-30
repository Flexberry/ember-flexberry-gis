import Ember from 'ember';
import layout from '../templates/components/flexberry-maptoolbar';
import draggingTool from 'ember-flexberry-gis/maptools/dragging';

const { getOwner } = Ember;

export default Ember.Component.extend({
  layout,

  leafletMap: null,

  activeTool: null,

  activeToolName: null,

  actions: {

    activateTool(toolname) {
      if(toolname === this.get('activeToolName')) {
        return;
      }

      let tool = getOwner(this).lookup('maptool:' + toolname);
      let leafletMap = this.get('leafletMap');
      if (tool && leafletMap) {
        let activeTool = this.get('activeTool');
        if(!activeTool && leafletMap.dragging.enabled())
        {
          activeTool = draggingTool.create({ map: leafletMap })
        }

        tool.set('map', leafletMap);

        if (activeTool) {
          activeTool.disable();
        }

        tool.enable();
        this.set('activeTool', tool);
        this.set('activeToolName', toolname);
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
