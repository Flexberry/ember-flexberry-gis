import Ember from 'ember';

export default Ember.Mixin.create({
  // не будем удалять слой после завершения рисования
  hideOnDrawingEnd: false,
  hidePreviousOnDrawingStart: true,
  clearOnDisable: false,
  cursor: 'crosshair',
  suffix: '-geom',

  _baseDrawingDidEnd(workingPolygon, bufferedMainPolygonLayer) {
    let leafletMap = this.get('leafletMap');
    let drawLayer = this.get('drawLayer');

    // зафиксируем workingPolygon - это либо сам нарисованный слой, либо добавленный буфер
    // и он уже добавлен либо на карту, либо на drawLayer и он не удаляется после рисования
    this.set('polygonLayer', workingPolygon.addTo(drawLayer));

    this.set('bufferedMainPolygonLayer', null);

    // также зафиксируем нарисованный слой отдельно - он приходит только если был буфер
    if (bufferedMainPolygonLayer && drawLayer) {
      this.set('bufferedMainPolygonLayer', bufferedMainPolygonLayer.addTo(drawLayer));
    }

    // а работаем в любом случае с workingPolygon
    leafletMap.fire('flexberry-map:geomChanged', { wkt: workingPolygon.toEWKT(L.CRS.EPSG4326) });
  }
});
