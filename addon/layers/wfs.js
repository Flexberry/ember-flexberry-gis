/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseLayer from './-private/base';

/**
  Class describing WFS layer metadata.

  @class WfsLayer
  @extends BaseLayer
*/
export default BaseLayer.extend({
  /**
    Permitted operations related to layer type.

    @property operations
    @type String[]
    @default ['edit', 'remove', 'identify', 'search', 'legend', 'objects-edit']
  */
  operations: ['edit', 'remove', 'identify', 'search', 'legend', 'objects-edit', 'attributes'],

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
      style: {
        color: undefined,
        weight: undefined
      },
      namespaceUri: undefined,
      clusterize: false,
      clusterOptions: undefined
    });

    return settings;
  },

  /**
    Creates new search settings object (with search settings related to layer-type).

    @method createSearchSettings
    @returns {Object} New search settings object (with search settings related to layer-type).
  */
  createSearchSettings() {
    let settings = this._super(...arguments);
    Ember.$.extend(true, settings, {
      queryString: '',
      maxResultsCount: 10
    });

    return settings;
  }
});
