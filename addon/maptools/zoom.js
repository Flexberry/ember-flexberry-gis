import RectangleTool from 'ember-flexberry-gis/maptools/rectangletool';

export default RectangleTool.extend({
  cursor: 'zoom-in',

  rectangleStarted({ layer }) {
    this._super(...arguments);
    this.get('map').fitBounds(layer.getBounds());
  }
});
