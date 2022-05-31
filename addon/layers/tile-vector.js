/**
  @module ember-flexberry-gis
*/

import { A } from '@ember/array';

import { isNone } from '@ember/utils';
import VectorLayer from 'ember-flexberry-gis/layers/-private/vector';

/**
  Class describing odata vector layer metadata.

  @class ODataVectorlayer
  @extends BaseLayer
*/
export default VectorLayer.extend({
  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    this.operations = this.operations || ['edit', 'remove'];
  },

  /**
    Creates new settings object (with settings related to layer-type).

    @method createSettings
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSettings() {
    const settings = this._super(...arguments);
    return settings;
  },

  /**
    Get properties names from leaflet layer object.

    @method getLayerProperties
    @param {Object} leafletObject Leaflet layer object
    @returns {Array} Array with properties names
  */
  getLayerProperties(leafletObject) {
    if (isNone(leafletObject)) {
      return A();
    }

    return A();
  },

  /**
    Get property values from leaflet layer object.

    @method getLayerPropertyValues
    @param {Object} leafletObject Leaflet layer object
    @returns {Array} Array with selected property values
  */
  getLayerPropertyValues(leafletObject) {
    if (isNone(leafletObject)) {
      return A();
    }

    return A();
  },
});
