/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import GeoJsonFilterParserMixin from '../mixins/geojson-filter-parser';
import VectorLayer from './-private/vector';

/**
  Class describing kml layer metadata.

  @class KmlLayer
  @extends VectorLayer
*/
export default VectorLayer.extend(GeoJsonFilterParserMixin, {
  /**
    Creates new settings object (with settings related to layer-type).

    @method createSettings
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSettings() {
    let settings = this._super(...arguments);
    Ember.$.extend(true, settings, {
      kmlUrl: undefined,
      kmlString: undefined,
      filter: ''
    });

    return settings;
  }
});
