/**
  @module ember-flexberry-gis
*/

import { set } from '@ember/object';

import { getOwner } from '@ember/application';
import WmsLayer from './wms';

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
    @default ['edit', 'remove', 'identify', 'search', 'legend', 'attributes', 'filter']
  */
  operations: ['edit', 'remove', 'identify', 'search', 'legend', 'attributes', 'filter'],

  /**
    Creates new settings object (with settings related to layer-type).

    @method createSettings
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSettings() {
    const settings = this._super(...arguments);
    const owner = getOwner(this);
    const wfsLayer = owner.lookup('layer:wfs');
    const wfsSettings = wfsLayer.createSettings();

    set(settings, 'identifySettings', wfsSettings.identifySettings);
    delete wfsSettings.identifySettings;

    set(settings, 'searchSettings', wfsSettings.searchSettings);
    delete wfsSettings.searchSettings;

    set(settings, 'displaySettings', wfsSettings.displaySettings);
    delete wfsSettings.displaySettings;

    set(settings, 'wfs', wfsSettings);

    return settings;
  },

  /**
    Creates new search settings object (with search settings related to layer-type).

    @method createSearchSettings
    @returns {Object} New search settings object (with search settings related to layer-type).
  */
  createSearchSettings() {
    const owner = getOwner(this);
    const wfsLayer = owner.lookup('layer:wfs');

    return wfsLayer.createSearchSettings();
  },

  /**
    Indicates whether related layer is vector layer.

    @method isVectorType
    @param {Object} layer Layer model.
    @param {Boolean} howVector Sometimes (in intersection panel) wms-wfs layer can work how a vector (example for identify).
    @returns {Boolean}
  */
  isVectorType(layer, howVector) {
    if (howVector) {
      return true;
    }

    return false;
  },
});
