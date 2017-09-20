/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseLayer from './-private/base';

/**
  Class describing kml layer metadata.

  @class KmlLayer
  @extends BaseLayer
*/
export default BaseLayer.extend({
  /**
    Icon class related to layer type.

    @property iconClass
    @type String
    @default 'map icon'
  */
  iconClass: 'map icon',

  /**
    Permitted operations related to layer type.

    @property operations
    @type String[]
    @default ['edit', 'remove', 'identify', 'search']
  */
  operations: ['edit', 'remove', 'identify', 'search'],

  /**
    Creates new settings object (with settings related to layer-type).

    @method createSettings
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSettings() {
    let settings = this._super(...arguments);
    Ember.$.extend(true, settings, {
      kmlUrl: undefined,
      kmlString: undefined
    });

    return settings;
  }
});

