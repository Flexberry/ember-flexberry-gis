import Ember from 'ember';
import layout from '../templates/components/flexberry-maptoolbar';
import draggingTool from 'ember-flexberry-gis/maptools/dragging';

const { getOwner } = Ember;

export default Ember.Component.extend({
  layout,

  leafletMap: null,

  activeTool: null,

  activeToolName: null,

  _isMeasureTool(toolname) {
    return toolname && toolname.substr(-11) ===  'measuretool';
  },

  actions: {

    activateTool(toolname) {
      let activeToolName = this.get('activeToolName');
      if (toolname === '+' && this._isMeasureTool(activeToolName)) {
        toolname = activeToolName;
      } else {
        if(!this._isMeasureTool(toolname) && toolname === activeToolName) {
          return;
        }
      }

      let tool = getOwner(this).lookup('maptool:' + toolname);
      let leafletMap = this.get('leafletMap');
      if (tool && leafletMap) {
        let activeTool = this.get('activeTool');
        if(!activeTool && leafletMap.dragging.enabled())
        {
          activeTool = draggingTool.create({ map: leafletMap });
        }

        tool.set('map', leafletMap);

        if (activeTool && !this._isMeasureTool(activeToolName)) {
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
