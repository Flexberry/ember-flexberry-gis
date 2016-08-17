import MapTool from './maptool';

export default MapTool.extend({
  cursor: 'zoom-in',

  _handleMouseDown: function (event) {
    let map = this.get('map');
    map.boxZoom._onMouseDown.call(map.boxZoom, { clientX:event.originalEvent.clientX, clientY:event.originalEvent.clientY, which:1, shiftKey:true });
  },

  enable() {
    this._super(...arguments);
    let map = this.get('map');
    map.on('mousedown', this._handleMouseDown, this);
  },

  disable() {
    this._super(...arguments);
    let map = this.get('map');
    map.off('mousedown', this._handleMouseDown, this);
  }
});
