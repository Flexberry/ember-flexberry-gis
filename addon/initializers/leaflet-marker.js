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
      if (!Ember.isNone(style) && !Ember.isNone(style.isImage) && (style.isImage === 'false' || !style.isImage)) {
        this.setIcon(new L.divIcon(style.options));
      } else if (!Ember.isNone(style) && !Ember.isNone(style.options)) {
        let html = this._parseString(style.options.html);
        let label = this._createStringLabel(html, this);
        style.options.html = label;
        this.setIcon(new L.Icon(style.options));
      } else {
        this.setIcon(new L.Icon.Default());
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
      return expResult ?  expResult : null;
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
  
        label += !isProp ?  element : '';
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
