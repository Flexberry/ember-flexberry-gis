/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseLayer from './base';

/**
  Class describing base vector layer metadata.

  @class VectorLayer
  @extends BaseLayer
*/
export default BaseLayer.extend({
  /**
    Reference to 'layers-styles-renderer' servie.

    @property layersStylesRenderer
    @type LayersStylesRendererService
  */
  layersStylesRenderer: Ember.inject.service('layers-styles-renderer'),

  /**
    Permitted operations related to layer type.

    @property operations
    @type String[]
    @default ['edit', 'remove', 'identify', 'search', 'query', 'filter', 'attributes', 'legend']
  */
  operations: ['edit', 'remove', 'identify', 'search', 'query', 'filter', 'attributes', 'editFeatures', 'legend'],

  /**
    Creates new settings object (with settings related to layer-type).

    @method createSettings
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSettings() {
    let settings = this._super(...arguments);
    let layersStylesRenderer = this.get('layersStylesRenderer');

    Ember.$.extend(true, settings, {
      clusterize: false,
      clusterOptions: undefined,
      filter: '',
      minZoom: 0,
      maxZoom: 25,

      // Layer style 'simple' is default for vector layers (see ember-flexberry-gis/layers-styles/simple).
      styleSettings: layersStylesRenderer.getDefaultStyleSettings('simple'),

      legendSettings: {
        geometriesCanBeDisplayed: true,
        markersCanBeDisplayed: true
      }
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
  },

  /**
    Indicates whether related layer is vector layer.

    @method isVectorType
    @param {Object} layer Layer model.
    @param {Boolean} howVector.
    @returns {Boolean}
  */
  isVectorType(layer) {
    return true;
  }
});
