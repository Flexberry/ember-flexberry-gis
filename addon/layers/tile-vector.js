/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import VectorLayer from 'ember-flexberry-gis/layers/-private/vector';

/**
  Class describing odata vector layer metadata.

  @class ODataVectorlayer
  @extends BaseLayer
*/
export default VectorLayer.extend({
  /**
    Permitted operations related to layer type.

    @property operations
    @type String[]
    @default ['edit', 'remove', 'identify', 'search']
  */
  operations: ['edit', 'remove'],

  /**
    Creates new settings object (with settings related to layer-type).

    @method createSettings
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSettings() {
    let settings = this._super(...arguments);
    return settings;
  },

  /**
    Get properties names from leaflet layer object.

    @method getLayerProperties
    @param {Object} leafletObject Leaflet layer object
    @returns {Array} Array with properties names
  */
  getLayerProperties(leafletObject) {
    if (Ember.isNone(leafletObject)) {
      return Ember.A();
    }

    return Ember.A();
  },

  /**
    Get property values from leaflet layer object.

    @method getLayerPropertyValues
    @param {Object} leafletObject Leaflet layer object
    @param {String} selectedField Selected field name
    @param {Integer} count Amount of values to return (for all values must be 0)
    @returns {Array} Array with selected property values
  */
  getLayerPropertyValues(leafletObject, selectedField, count) {
    if (Ember.isNone(leafletObject)) {
      return Ember.A();
    }

    return Ember.A();
  }
});
