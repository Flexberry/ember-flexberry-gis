/**
  @module ember-flexberry
*/

import { isNone, isBlank } from '@ember/utils';

export function initialize() {
  L.Marker.include({
    /**
      Style for marker.
      @method setStyle
      @param {Object} style style for marker
      @returns {Object} Returns L.Marker.

      style: {isImage: false,
          options: {
            className: classCss,
            html: text
          }
      }
    */
    setStyle(style) {
      let legendStyle = {
        type: 'default',
        style: null,
      };

      if (isNone(this.styleIsSet) || !this.styleIsSet) {
        if (!isNone(style) && !isNone(style.isImage) && (style.isImage === 'false' || !style.isImage)) {
          const html = this._parseString(style.options.html);
          const label = this._createStringLabel(html, this);
          const opt = Object.assign({}, style.options);
          opt.html = label;
          this.setIcon(new L.divIcon(opt));
          this.style = opt;
          this.styleIsSet = true;
        } else if (!isNone(style) && !isNone(style.options)) {
          this.setIcon(new L.Icon(style.options));
          legendStyle = {
            type: 'image',
            style: style.options,
          };
        } else if (isNone(this.options.icon.options.iconUrl)) {
          this.setIcon(new L.Icon.Default());
        }
      } else if (isNone(this.styleIsSet)) {
        if (!isNone(this.style) && !isNone(this.style.html)) {
          this.setIcon(new L.divIcon(this.style));
        }

        this.styleIsSet = false;
      }

      if (!isNone(this.layerModel) && isNone(this.layerModel.legendStyle)) {
        this.layerModel.legendStyle = legendStyle;
      }

      return this;
    },

    /**
      Create array of strings and feature properies.
      @method _parseString
      @param {String} expression String for parsing
    */
    _parseString(expression) {
      if (isBlank(expression)) {
        return null;
      }

      const exp = expression.trim();
      const reg = /'(.+?)'/g;
      const expResult = exp.split(reg).filter((x) => x !== '');
      return expResult || null;
    },

    /**
      Create label string.
      @method _createStringLabel
      @param {Array} expResult Create array of strings and feature properies
    */
    _createStringLabel(expResult, featureLayer) {
      let label = '';
      let isProp = false;
      expResult.forEach(function (element) {
        for (const key in featureLayer.feature.properties) {
          if (key === element && !isNone(featureLayer.feature.properties[key]) && !isBlank(featureLayer.feature.properties[key])) {
            label += featureLayer.feature.properties[key];
            isProp = true;
          }
        }

        label += !isProp ? element : '';
        isProp = false;
      });

      return label;
    },
  });
}

export default {
  name: 'leaflet-marker',
  initialize,
};
