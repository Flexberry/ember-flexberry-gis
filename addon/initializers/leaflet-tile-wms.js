export function initialize(/* application */) {
    L.TileLayer.WMS.include({
      	onAdd: function (map) {

          this._crs =  map.options.crs || this.options.crs;
          this._wmsVersion = parseFloat(this.wmsParams.version);

          var projectionKey = this._wmsVersion >= 1.3 ? 'crs' : 'srs';
          this.wmsParams[projectionKey] = this._crs.code;

          L.TileLayer.prototype.onAdd.call(this, map);
        },
    });
}

export default {
  name: 'leaflet-tile-wms',
  initialize
};
