/**
  @module ember-flexberry-gis
*/

import { isNone } from '@ember/utils';

export function initialize() {
  const setStyle = {
    setStyle(style) {
      L.Path.prototype.setStyle.call(this, style);
      if (!isNone(this.layerModel) && isNone(this.layerModel.legendStyle)) {
        this.layerModel.legendStyle = {
          type: 'simple',
          style: {
            path: style,
          },
        };
      }

      return this;
    },
  };

  L.Polygon.include(setStyle);
  L.Polyline.include(setStyle);
  L.Circle.include(setStyle);
  L.CircleMarker.include(setStyle);
  L.Rectangle.include(setStyle);
}

export default {
  name: 'leaflet-path',
  initialize,
};
