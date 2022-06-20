/**
  @module ember-flexberry-gis
*/

import { get } from '@ember/object';

import { getOwner } from '@ember/application';
import { A } from '@ember/array';
import { isNone } from '@ember/utils';
import $ from 'jquery';
import BaseLayer from './-private/base';

/**
  Class describing combine layers metadata.

  @class CombineLayer
  @extends BaseLayer
*/
export default BaseLayer.extend({
  /**
    Icon class related to layer type.

    @property iconClass
    @type String
    @default 'image icon'
  */
  iconClass: 'image icon',

  /**
    Permitted operations related to layer type.
    @property operations
    @type String[]
    @default ['edit', 'remove', 'identify', 'search', 'legend', 'attributes', 'editFeatures', 'filter']
  */
  operations: null,

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    this.operations = this.operations || ['edit', 'remove', 'identify', 'search', 'legend', 'attributes', 'editFeatures', 'filter'];
  },

  /**
    Creates new settings object (with settings related to layer-type).

    @method createSettings
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSettings() {
    const settings = this._super(...arguments);
    $.extend(true, settings, {
      type: undefined,
      innerLayers: undefined,
    });
    return settings;
  },

  /**
    Get properties names from leaflet layer object.

    @method getLayerProperties
    @param {Object} leafletObject Leaflet layer object
    @returns {Array} Array with properties names
  */
  getLayerProperties(leafletObject) {
    if (isNone(leafletObject) || isNone(leafletObject.type)) {
      return A();
    }

    // let layerClass = Ember.getOwner(this).lookup(`layer:${this.get('layerModel.type')}`);
    const layerClass = getOwner(this).lookup(`layer:${leafletObject.type}`);
    const layerProperties = layerClass.getLayerProperties(leafletObject);

    return layerProperties;
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
    if (isNone(leafletObject) || isNone(leafletObject.type)) {
      return A();
    }

    const layerClass = getOwner(this).lookup(`layer:${leafletObject.type}`);
    const layerPropertyValue = layerClass.getLayerPropertyValues(leafletObject, selectedField, count);

    return layerPropertyValue;
  },

  /**
    Indicates whether related layer is vector layer.

    @method isVectorType
    @param {Object} layer Layer model.
    @param {Boolean} howVector.
    @returns {Boolean}
  */
  isVectorType(layer) {
    if (isNone(layer)) {
      return false;
    }

    const combineType = !isNone(get(layer, 'settingsAsObject')) ? get(layer, 'settingsAsObject.type') : null;
    if (isNone(combineType)) {
      return false;
    }

    const layerClass = getOwner(this).knownForType('layer', combineType);
    return !isNone(layerClass) && layerClass.isVectorType(layer);
  },
});
