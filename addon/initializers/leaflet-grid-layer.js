export function initialize() {
  L.GridLayer.include({
    /**
      Overridden. Layer is shown depending on the zoom. https://github.com/Leaflet/Leaflet/blob/main/src/layer/tile/GridLayer.js#L551
      @method _setView
    */
    _setView: function (center, zoom, noPrune, noUpdate) {
      var tileZoom = Math.round(zoom);

      // it compares with tileZoom in original. When zoom is fractional, round begin show layer and after hide that's why he blinks.
      if ((this.options.maxZoom !== undefined && zoom > this.options.maxZoom) ||
          (this.options.minZoom !== undefined && zoom < this.options.minZoom)) {
        tileZoom = undefined;
      } else {
        tileZoom = this._clampZoom(tileZoom);
      }

      var tileZoomChanged = this.options.updateWhenZooming && (tileZoom !== this._tileZoom);

      if (!noUpdate || tileZoomChanged) {

        this._tileZoom = tileZoom;

        if (this._abortLoading) {
          this._abortLoading();
        }

        this._updateLevels();
        this._resetGrid();

        if (tileZoom !== undefined) {
          this._update(center);
        }

        if (!noPrune) {
          this._pruneTiles();
        }

        // Flag to prevent _updateOpacity from pruning tiles during
        // a zoom anim or a pinch gesture
        this._noPrune = !!noPrune;
      }

      this._setZoomTransforms(center, zoom);
    },
  });
}

export default {
  name: 'leaflet-grid-layer',
  initialize
};
