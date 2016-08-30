import RectangleTool from 'ember-flexberry-gis/maptools/rectangletool';

export default RectangleTool.extend({
  cursor: 'zoom-out',

  rectangleStarted({ layer }) {
    this._super(...arguments);
    let map = this.get('map');
    let mapSize = map.getBounds();
    let zoomSize = layer.getBounds();

    let dx = (mapSize.getEast() - mapSize.getWest()) / (zoomSize.getEast() - zoomSize.getWest());
    let dy = (mapSize.getNorth() - mapSize.getSouth()) / (zoomSize.getNorth() - zoomSize.getSouth());
    let maxD = dx > dy ? dx : dy;

    let zoom = map.getScaleZoom(1 / maxD, map.getZoom());
    map.panTo(zoomSize.getCenter());
    map.setZoom(Math.floor(zoom));
  }
});
