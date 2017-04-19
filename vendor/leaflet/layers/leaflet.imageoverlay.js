L.ImageOverlay.Extended = L.ImageOverlay.extend({
  options: {
    zIndex: 1
  },
  setZIndex: function (zIndex) {
    this.options.zIndex = zIndex;
    this._updateZIndex();
    return this;
  },
  _initImage: function () {
    L.ImageOverlay.prototype._initImage.call(this);
    if (this.options.zIndex) {
      this._updateZIndex();
    }
  },
  _updateZIndex: function () {
    if (this._image && this.options.zIndex !== undefined && this.options.zIndex !== null) {
      this._image.style.zIndex = this.options.zIndex;
    }
  }
});

L.imageOverlayExtended = function (url, options) {
  return new L.ImageOverlay.Extended(url, options);
};
