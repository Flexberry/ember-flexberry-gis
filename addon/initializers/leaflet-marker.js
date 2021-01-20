/**
  @module ember-flexberry
*/

import Ember from 'ember';

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
    setStyle: function (style) {
      let legendStyle = {
        type: 'default',
        style: null
      };

      if (Ember.isNone(this.styleIsSet) || !this.styleIsSet) {
        if (!Ember.isNone(style) && !Ember.isNone(style.isImage) && (style.isImage === 'false' || !style.isImage)) {
          let html = this._parseString(style.options.html);
          let label = this._createStringLabel(html, this);
          let opt = Object.assign({}, style.options);
          opt.html = label;
          this.setIcon(new L.divIcon(opt));
          this.style = opt;
          this.styleIsSet = true;
        } else if (!Ember.isNone(style) && !Ember.isNone(style.options)) {
          this.setIcon(new L.Icon(style.options));
          legendStyle = {
            type: 'image',
            style: style.options
          };
        } else if (Ember.isNone(this.options.icon.options.iconUrl)) {
          this.setIcon(new L.Icon.Default());
        }
      } else if (Ember.isNone(this.styleIsSet)) {
        if (!Ember.isNone(this.style) && !Ember.isNone(this.style.html)) {
          this.setIcon(new L.divIcon(this.style));
        }

        this.styleIsSet = false;
      }

      if (!Ember.isNone(this.layerModel) && Ember.isNone(this.layerModel.legendStyle)) {
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
      if (Ember.isBlank(expression)) {
        return null;
      }

      let exp = expression.trim();
      let reg = /'(.+?)'/g;
      let expResult = exp.split(reg).filter(x => x !== '');
      return expResult ? expResult : null;
    },

    /**
      Create label string.
      @method _createStringLabel
      @param {Array} expResult Create array of strings and feature properies
    */
    _createStringLabel(expResult, featureLayer) {
      let label = '';
      let isProp = false;
      expResult.forEach(function(element) {
        for (let key in featureLayer.feature.properties) {
          if (key === element && !Ember.isNone(featureLayer.feature.properties[key]) && !Ember.isBlank(featureLayer.feature.properties[key])) {
            label += featureLayer.feature.properties[key];
            isProp = true;
          }
        }

        label += !isProp ? element : '';
        isProp = false;
      });

      return label;
    }
  });
}

export default {
  name: 'leaflet-marker',
  initialize
};
