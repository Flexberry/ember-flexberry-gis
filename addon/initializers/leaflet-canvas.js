import Ember from 'ember';

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
      let i, j, len2, p;
      const parts = layer._parts,
            len = parts.length,
            ctx = this._ctx;

      if (!len) { return; }

      ctx.beginPath();

      for (i = 0; i < len; i++) {
        for (j = 0, len2 = parts[i].length; j < len2; j++) {
          p = parts[i][j];
          ctx[j ? 'lineTo' : 'moveTo'](p.x, p.y);
          //_ctx[j ? 'lineTo' : 'moveTo'](p.x, p.y);
        }
        if (closed) {
          ctx.closePath();
          //_ctx.closePath();
        }
      }

      if (layer.options.count) {
        for (let i = 0; i < layer.options.count; i++) {
          this._fillStroke(ctx, layer.options[i])
        }
      } else {
        this._fillStroke(ctx, layer.options)
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
    }
  });
}

export default {
  name: 'leaflet-canvas',
  initialize
};
