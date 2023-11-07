export function initialize() {
  L.Canvas.include({
    /**
      @method _updatePoly
      Override https://github.com/Leaflet/Leaflet/blob/main/src/layer/vector/Canvas.js#L275
      Get ctx and call drawing for each style options.
    */
    _updatePoly: function (layer, closed) {
      if (!this._drawing) { return; }

      let i;
      let j;
      let len2;
      let p;
      const parts = layer._parts;
      const len = parts.length;
      const ctx = this._ctx;

      if (!len) { return; }

      ctx.beginPath();

      for (i = 0; i < len; i++) {
        for (j = 0, len2 = parts[i].length; j < len2; j++) {
          p = parts[i][j];
          ctx[j ? 'lineTo' : 'moveTo'](p.x, p.y);
        }

        if (closed) {
          ctx.closePath();
        }
      }

      if (layer.options.count) {
        for (let i = 0; i < layer.options.count; i++) {
          this._fillStroke(ctx, layer.options[i]);
        }
      } else {
        this._fillStroke(ctx, layer.options);
      }
    },

    /**
      @method _updateCircle
      Override https://github.com/Leaflet/Leaflet/blob/main/src/layer/vector/Canvas.js#L302
      Get ctx and call _fillStroke.
    */
    _updateCircle: function (layer) {

      if (!this._drawing || layer._empty()) { return; }

      var p = layer._point,
          ctx = this._ctx,
          r = Math.max(Math.round(layer._radius), 1),
          s = (Math.max(Math.round(layer._radiusY), 1) || r) / r;

      if (s !== 1) {
        ctx.save();
        ctx.scale(1, s);
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y / s, r, 0, Math.PI * 2, false);

      if (s !== 1) {
        ctx.restore();
      }

      this._fillStroke(ctx, layer.options);
    },

    /**
      @method _fillStroke
      Override https://github.com/Leaflet/Leaflet/blob/main/src/layer/vector/Canvas.js#L326
      If fillStyle is pattern, create pattern for ctx. Otherwise set color for fill.
    */
    _fillStroke(ctx, options) {
      if (options.fill) {
        let fillStyle = options.fillColor || options.color;
        if (options.fillStyle === 'pattern' && options.fillPattern) {
          fillStyle = ctx.createPattern(options.imagePattern, 'repeat');
        }

        ctx.globalAlpha = options.fillOpacity;
        ctx.fillStyle = fillStyle;
        ctx.fill(options.fillRule || 'evenodd');
      }

      if (options.stroke && options.weight !== 0) {
        if (ctx.setLineDash) {
          ctx.setLineDash(options && options._dashArray || []);
        }

        ctx.globalAlpha = options.opacity;
        ctx.lineWidth = options.weight;
        ctx.strokeStyle = options.color;
        ctx.lineCap = options.lineCap;
        ctx.lineJoin = options.lineJoin;
        ctx.lineDashOffset = options.dashOffset;
        ctx.stroke();
      }
    },

    /**
      @method _initPath
      Override https://github.com/Leaflet/Leaflet/blob/main/src/layer/vector/Canvas.js#L132
      Update dash array for all styles.
    */
    _initPath(layer) {
      if (layer.options.count) {
        for (let i = 0; i < layer.options.count; i++) {
          this._updateDashArray(layer.options[i]);
        }
      } else {
        this._updateDashArray(layer.options);
      }

      this._layers[L.Util.stamp(layer)] = layer;

      const order = layer._order = {
        layer,
        prev: this._drawLast,
        next: null
      };
      if (this._drawLast) { this._drawLast.next = order; }

      this._drawLast = order;
      this._drawFirst = this._drawFirst || this._drawLast;
    },

    /**
      @method _updateStyle
      Override https://github.com/Leaflet/Leaflet/blob/main/src/layer/vector/Canvas.js#L184
      Update style for each layer styles.
    */
    _updateStyle(layer) {
      if (layer.options.count) {
        for (let i = 0; i < layer.options.count; i++) {
          this._updateDashArray(layer.options[i]);
          this._requestRedraw(layer);
        }
      } else {
        this._updateDashArray(layer.options);
        this._requestRedraw(layer);
      }
    },

    /**
      @method _updateDashArray
      Override https://github.com/Leaflet/Leaflet/blob/main/src/layer/vector/Canvas.js#L189
      Accepts options, not a layer as in original method.
    */
    _updateDashArray(options) {
      if (typeof options.dashArray === 'string') {
        const parts = options.dashArray.split(/[, ]+/);
        const dashArray = [];
        let dashValue;
        let i;
        for (i = 0; i < parts.length; i++) {
          dashValue = Number(parts[i]);

          // Ignore dash array containing invalid lengths
          if (isNaN(dashValue)) { return; }

          dashArray.push(dashValue);
        }

        options._dashArray = dashArray;
      } else {
        options._dashArray = options.dashArray;
      }
    },

    /**
      @method _extendRedrawBounds
      Override https://github.com/Leaflet/Leaflet/blob/main/src/layer/vector/Canvas.js#L214
      Calculate max weight from all styles to draw within the correct bounds.
    */
    _extendRedrawBounds(layer) {
      if (layer._pxBounds) {
        let maxWeight = 0;
        if (layer.options.count) {
          for (let i = 0; i < layer.options.count; i++) {
            if (layer.options[i].weight >= maxWeight) {
              maxWeight = layer.options[i].weight;
            }
          }
        } else {
          maxWeight = layer.options.weight;
        }

        const padding = (maxWeight || 0) + 1;
        this._redrawBounds = this._redrawBounds || new L.Bounds();
        this._redrawBounds.extend(layer._pxBounds.min.subtract([padding, padding]));
        this._redrawBounds.extend(layer._pxBounds.max.add([padding, padding]));
      }
    },
  });
}

export default {
  name: 'leaflet-canvas',
  initialize
};
