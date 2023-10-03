export function initialize() {
  L.Canvas.include({
    _updatePoly: function (layer, closed) {
      if (!this._drawing) { return; }
      /* other canvas for fill
      const canvas = document.createElement('canvas');
      canvas.setAttribute('height', 1256);
      canvas.setAttribute('width', 4096);
      canvas.setAttribute('class', layer.options.pane);
      let parent = $(`.leaflet-${layer.options.pane}-pane`)[0];
      let canvasPane = $(`canvas.${layer.options.pane}`);
      if (parent && canvasPane.length === 0) {
        parent.appendChild(canvas);
      }

      const _ctx = canvas.getContext("2d");*/
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
        ctx.stroke();
      }
    },

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

    _updateDashArray(options) {
      if (typeof options.dashArray === 'string') {
        const parts = options.dashArray.split(/[, ]+/),
              dashArray = [];
        let dashValue,
            i;
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

    _extendRedrawBounds(layer) {
      if (layer._pxBounds) {
        let maxWeight = 0
        if (layer.options.count) {
          for (let i = 0; i < layer.options.count; i++) {
            if (layer.options[i].weight >= maxWeight) {
              maxWeight = layer.options[i].weight;
            }
          }
        } else {
          maxWeight = layer.options.weight
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
