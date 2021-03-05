/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
export function initialize() {
  let setStyle = {
    setStyle: function (style) {
      L.Path.prototype.setStyle.call(this, style);
      if (!Ember.isNone(this.layerModel) && Ember.isNone(this.layerModel.legendStyle)) {
        this.layerModel.legendStyle = {
          type: 'simple',
          style: {
            path: style
          }
        };
      }

      return this;
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
