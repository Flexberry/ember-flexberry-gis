import RectangleTool from 'ember-flexberry-gis/maptools/rectangletool';

export default RectangleTool.extend({
  cursor: 'help',

  rectangleStarted({ layer }) {
    this._super(...arguments);
    this.get('map').fire('flexberry:identify', { layer });
  }
});
