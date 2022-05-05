/**
  @module ember-flexberry-gis
*/

import DrawMapTool from './draw';

/**
  Draw polyline map-tool.

  @class DrawPolylineMapTool
  @extends DrawMapTool
*/
export default DrawMapTool.extend({
  /**
    Enables tool.

    @method _enable
    @private
  */
  _enable() {
    this._super(...arguments);
    const polyline = this.get('_editTools').startPolyline();
    polyline.on('editable:vertex:click', (e) => {
      if (e.vertex.getIndex() === 0) {
        e.cancel();

        const latlngs = e.layer._latlngs;
        latlngs.push(latlngs[0]);
        const polygone = L.polygon(latlngs, { editOptions: { editTools: this.get('_editTools'), }, });

        this.get('_editTools').stopDrawing();

        this.get('featuresLayer').removeLayer(polyline);

        this.get('featuresLayer').addLayer(polygone);
        polygone.enableEdit(this.leafletMap);
      }
    });
  },
});
