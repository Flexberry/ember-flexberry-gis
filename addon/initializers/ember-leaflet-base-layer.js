import Ember from 'ember';
import BaseLayer from 'ember-leaflet/components/base-layer';

export function initialize() {
  BaseLayer.reopen({
    dynamicProperties: null,

    init: function () {
      this._super(...arguments);
      let properties = this.get('dynamicProperties');
      if (!Ember.isNone(properties) && typeof (properties) === 'object') {
        for (var propertyName in properties) {
          if (properties.hasOwnProperty(propertyName)) {
            this.set(propertyName, properties[propertyName]);
          }
        }
      }
    }
  });
}

export default {
  name: 'ember-leaflet-base-layer',
  initialize
};
