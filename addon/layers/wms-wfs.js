/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import WmsLayer from './wms';
import WfsLayer from './wfs';

/**
  Class describing WMS layer metadata.

  @class WmsWfsLayer
  @extends WmsLayer
*/
export default WmsLayer.extend({
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
    @default ['edit', 'remove', 'identify', 'search', 'legend']
  */
  operations: ['edit', 'remove', 'identify', 'search', 'legend'],

  /**
    Creates new settings object (with settings related to layer-type).

    @method createSettings
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSettings() {
    let settings = this._super(...arguments);
    let wfsSettings = WfsLayer.create().createSettings();

    Ember.set(settings, 'identifySettings', wfsSettings.identifySettings);
    delete wfsSettings.identifySettings;

    Ember.set(settings, 'searchSettings', wfsSettings.searchSettings);
    delete wfsSettings.searchSettings;

    Ember.set(settings, 'displaySettings', wfsSettings.displaySettings);
    delete wfsSettings.displaySettings;

    Ember.set(settings, 'wfs', wfsSettings);

    return settings;
  },

  /**
    Creates new search settings object (with search settings related to layer-type).

    @method createSearchSettings
    @returns {Object} New search settings object (with search settings related to layer-type).
  */
  createSearchSettings() {
    return WfsLayer.create().createSearchSettings();
  }
});
