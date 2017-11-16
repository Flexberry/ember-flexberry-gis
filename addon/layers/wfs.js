/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import VectorLayer from './-private/vector';

/**
  Class describing WFS layer metadata.

  @class WfsLayer
  @extends VectorLayer
*/
export default VectorLayer.extend({
  /**
    Permitted operations related to layer type.

    @property operations
    @type String[]
    @default ['edit', 'remove', 'identify', 'search', 'legend']
  */
  operations: ['edit', 'remove', 'identify', 'search', 'legend', 'attributes'],

  /**
    Creates new settings object (with settings related to layer-type).

    @method createSettings
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSettings() {
    let settings = this._super(...arguments);
    Ember.$.extend(true, settings, {
      crs: undefined,
      showExisting: undefined,
      geometryField: undefined,
      url: undefined,
      version: undefined,
      typeNS: undefined,
      typeName: undefined,
      typeNSName: undefined,
      maxFeatures: undefined,
      format: undefined,
      namespaceUri: undefined,
      clusterize: false,
      clusterOptions: undefined
    });

    return settings;
  }
});
