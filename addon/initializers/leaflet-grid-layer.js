import Ember from 'ember';

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
      } else if (this.options.rules) {
        let styleRules = this.options.rules;
        let labelRules = this.options.label;
        let tileZoomStyle = this._zoomForStyleRules(styleRules, zoom);
        let tileZoomLabel = this._zoomForLabelRules(labelRules, zoom);
        if (!Ember.isNone(tileZoomStyle)) {
          tileZoom = tileZoomStyle;
        } else if (!Ember.isNone(tileZoomLabel)) {
          tileZoom = tileZoomLabel;
        } else {
          tileZoom = this._clampZoom(tileZoom);
        }
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

    /**
      @method _zoomForStyleRules
      Calculation tile zoom for style rules.
    */
    _zoomForStyleRules(styleRules, zoom) {
      let tileZoom = null;
      if (!Ember.isNone(styleRules) && Ember.isArray(styleRules)) {
        let prevMaxZoom = null;
        styleRules.forEach((rule, i) => {
          let minZoom = rule.rule.minZoom;
          let maxZoom = rule.rule.maxZoom;
          if (i > 0) {
            let k = i - 1;
            prevMaxZoom = styleRules[k].rule.maxZoom;
          }

          let targetZoom = this._calcZoom(zoom, minZoom, maxZoom, prevMaxZoom);
          if (!Ember.isNone(targetZoom)) {
            tileZoom = targetZoom;
          }
        });
      }

      return tileZoom;
    },

    /**
      @method _zoomForLabelRules
      Calculation tile zoom for label rules.
    */
    _zoomForLabelRules(labelRules, zoom) {
      let tileZoom = null;
      if (!Ember.isNone(labelRules) && labelRules.signMapObjects && !Ember.isNone(labelRules.rules) && Ember.isArray(labelRules.rules)) {
        let prevMaxZoom = null;
        labelRules.rules.forEach((rule, i) => {
          let minZoom = rule.scaleRange.minScaleRange;
          let maxZoom = rule.scaleRange.maxScaleRange;
          if (i > 0) {
            let k = i - 1;
            prevMaxZoom = labelRules.rules[k].scaleRange.maxScaleRange;
          }

          let targetZoom = this._calcZoom(zoom, minZoom, maxZoom, prevMaxZoom);
          if (!Ember.isNone(targetZoom)) {
            tileZoom = targetZoom;
          }
        });
      }

      return tileZoom;
    },

    /**
      @method _calcZoom
      Calculation tile zoom.
    */
    _calcZoom(zoom, minZoom, maxZoom, prevMaxZoom) {
      let tileZoom = null;
      zoom = Number(zoom.toFixed(1));
      if (minZoom <= zoom && Math.ceil(minZoom) >= zoom) {
        tileZoom = Math.ceil(zoom);
      } else if (maxZoom >= zoom && Math.floor(maxZoom) <= zoom) {
        tileZoom = Math.floor(zoom);
      }

      // hole in zooms
      if (!Ember.isNone(prevMaxZoom) && Number((minZoom - prevMaxZoom).toFixed(1)) > 0.2) {
        if (prevMaxZoom < zoom && Math.ceil(prevMaxZoom) > zoom) {
          tileZoom = Math.ceil(zoom);
        } else if (minZoom > zoom && Math.floor(minZoom) < zoom) {
          tileZoom = Math.floor(zoom);
        }
      }

      return tileZoom;
    }
  });
}

export default {
  name: 'leaflet-grid-layer',
  initialize
};
