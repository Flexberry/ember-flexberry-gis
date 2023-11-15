/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
export function initialize() {
  let setStyle = {
    setStyle: function (style) {
      if (style) {
        if (this.options.count) {
          for (let i = 0; i < this.options.count; i++) {
            if (!style.count) {
              this.setStyleCustom(this, this.options[i], style);
            } else {
              L.Path.prototype.setStyle.call(this, style);
            }
          }
        } else {
          L.Path.prototype.setStyle.call(this, style);
        }

        if (!Ember.isNone(this.layerModel) && Ember.isNone(this.layerModel.legendStyle)) {
          this.layerModel.legendStyle = {
            type: 'simple',
            style: {
              path: style
            }
          };
        }
      }

      return this;
    },

    setStyleCustom(layer, options, style) {
      for (var j in style) {
        options[j] = style[j];
      }

      if (layer._renderer) {
        layer._renderer._updateStyle(layer);
        if (options.stroke && style && style.hasOwnProperty('weight')) {
          layer._updateBounds();
        }
      }
    }
  };

  L.Polygon.include(setStyle);
  L.Polyline.include(setStyle);
  L.Circle.include(setStyle);
  L.CircleMarker.include(setStyle);
  L.Rectangle.include(setStyle);
}

export default {
  name: 'leaflet-path',
  initialize
};
