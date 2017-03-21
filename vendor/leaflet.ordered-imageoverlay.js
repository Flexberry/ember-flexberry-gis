var setZIndexMixin = {
  options: {
    zIndex: 1
  },
  setZIndex(zIndex) {
    this.options.zIndex = zIndex;
    this._updateZIndex();
    return this;
  },
  _initImage() {
    L.ImageOverlay.prototype._initImage.call(this);
    if (this.options.zIndex) {
      this._updateZIndex();
    }
  },
  _updateZIndex() {
    if (this._image && this.options.zIndex !== undefined && this.options.zIndex !== null) {
      this._image.style.zIndex = this.options.zIndex;
    }
  }
};

L.ImageOverlay.include(setZIndexMixin);