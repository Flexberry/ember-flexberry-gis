/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseLayer from './-private/base';
import GeoJsonFilterParserMixin from 'ember-flexberry-gis/mixins/geojson-filter-parser';

/**
  Class describing GeoJSON layer metadata.

  @class GeoJSONLayer
  @extends BaseLayer
*/
export default BaseLayer.extend(GeoJsonFilterParserMixin, {
  /**
    Permitted operations related to layer type.

    @property operations
    @type String[]
    @default ['edit', 'remove', 'identify', 'search', 'query', 'filter']
  */
  operations: ['edit', 'remove', 'identify', 'search', 'query', 'filter'],

  /**
    Creates new settings object (with settings related to layer-type).

    @method createSettings
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSettings() {
    let settings = this._super(...arguments);
    return Ember.$.extend(settings, {
      pointToLayer: undefined,
      style: null,
      onEachFeature: null,
      filter: '',
      coordsToLatLng: null,
      geojson: null,
      url: null,
      clusterize: false
    });
  },

  /**
    Creates new search settings object (with search settings related to layer-type).

    @method createSearchSettings
    @returns {Object} New search settings object (with search settings related to layer-type).
  */
  createSearchSettings() {
    let settings = this._super(...arguments);
    return Ember.$.extend(settings, {
      queryString: '',
      maxResultsCount: 10
    });
  }
});
