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
      let tool = getOwner(this).lookup('maptool:' + toolname);
      let leafletMap = this.get('leafletMap');
      if (tool && leafletMap) {
        let activeTool = this.get('activeTool') || draggingTool.create({ map: leafletMap });
        if (activeTool === tool) {
          return;
        }

        tool.set('map', leafletMap);

        if (activeTool) {
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
