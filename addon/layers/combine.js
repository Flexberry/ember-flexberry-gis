/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
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
    @default ['edit', 'remove', 'identify', 'search', 'legend', 'attributes', 'filter']
  */
  operations: ['edit', 'remove', 'identify', 'search', 'legend', 'attributes', 'editFeatures', 'filter'],

  /**
    Creates new settings object (with settings related to layer-type).

    @method createSettings
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSettings() {
    let settings = this._super(...arguments);
    Ember.$.extend(true, settings, {
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
    if (Ember.isNone(leafletObject) || Ember.isNone(leafletObject.type)) {
      return Ember.A();
    }

    //let layerClass = Ember.getOwner(this).lookup(`layer:${this.get('layerModel.type')}`);
    let layerClass = Ember.getOwner(this).lookup(`layer:${leafletObject.type}`);
    let layerProperties = layerClass.getLayerProperties(leafletObject);

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
    if (Ember.isNone(leafletObject) || Ember.isNone(leafletObject.type)) {
      return Ember.A();
    }

    let layerClass = Ember.getOwner(this).lookup(`layer:${leafletObject.type}`);
    let layerPropertyValue = layerClass.getLayerPropertyValues(leafletObject, selectedField, count);

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
    if (Ember.isNone(layer)) {
      return false;
    }

    let combineType = !Ember.isNone(Ember.get(layer, 'settingsAsObject')) ? Ember.get(layer, 'settingsAsObject.type') : null;
    if (Ember.isNone(combineType)) {
      return false;
    }

    let layerClass = Ember.getOwner(this).knownForType('layer', combineType);
    return !Ember.isNone(layerClass) && layerClass.isVectorType(layer);
  }
});
