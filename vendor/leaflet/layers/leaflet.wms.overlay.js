L.WMS.Overlay.Extended = L.WMS.Overlay.extend({
  options: {
    zIndex: 1
  },
  update: function () {
    if (!this._map) {
      return;
    }
    // Determine image URL and whether it has changed since last update
    this.updateWmsParams();
    var url = this.getImageUrl();
    if (this._currentUrl == url) {
      return;
    }
    this._currentUrl = url;

    // Keep current image overlay in place until new one loads
    // (inspired by esri.leaflet)
    var bounds = this._map.getBounds();
    var overlay = L.imageOverlay(url, bounds, {
      'opacity': 0
    });
    overlay.addTo(this._map);
    overlay.once('load', _swap, this);
    overlay.once('error', _swap, this);

    function _swap(e) {
      if (e.type === 'error' || !this._map) {
        overlay.remove();
        return;
      }
      if (overlay._url != this._currentUrl) {
        this._map.removeLayer(overlay);
        return;
      } else if (this._currentOverlay) {
        this._map.removeLayer(this._currentOverlay);
      }
      this._currentOverlay = overlay;
      overlay.setOpacity(
        this.options.opacity ? this.options.opacity : 1
      );
      overlay.setZIndex(
        this.options.zIndex ? this.options.zIndex : 1
      );
      if (this.options.isBack === true) {
        overlay.bringToBack();
      }
      if (this.options.isBack === false) {
        overlay.bringToFront();
      }
    }
    if ((this._map.getZoom() < this.options.minZoom) ||
      (this._map.getZoom() > this.options.maxZoom)) {
      this._map.removeLayer(overlay);
    }
  },
  setZIndex: function (zIndex) {
    this.options.zIndex = zIndex;
    if (this._currentOverlay) {
      this._currentOverlay.setZIndex(zIndex);
    }
  }
});

L.WMS.overlayExtended = function (url, options) {
  return new L.WMS.Overlay.Extended(url, options);
};
