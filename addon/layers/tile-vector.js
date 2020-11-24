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
  operations: ['edit', 'remove', 'identify', 'search', 'attributes', 'legend'],

  /**
    Creates new settings object (with settings related to layer-type).

    @method createSettings
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSettings() {
    let settings = this._super(...arguments);
    return settings;
  }
});
