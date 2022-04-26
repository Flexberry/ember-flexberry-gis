/**
  @module ember-flexberry-gis
*/

import $ from 'jquery';

import { inject as service } from '@ember/service';
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
  layersStylesRenderer: service('layers-styles-renderer'),

  /**
    Permitted operations related to layer type.

    @property operations
    @type String[]
    @default ['edit', 'remove', 'identify', 'search', 'query', 'filter', 'attributes', 'legend']
  */
  operations: Object.freeze(['edit', 'remove', 'identify', 'search', 'query', 'filter', 'attributes', 'legend']),

  /**
    Creates new settings object (with settings related to layer-type).

    @method createSettings
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSettings() {
    const settings = this._super(...arguments);
    const layersStylesRenderer = this.get('layersStylesRenderer');
    const legendSettings = {
      geometriesCanBeDisplayed: true,
      markersCanBeDisplayed: true,
    };

    $.extend(true, settings, {
      clusterize: false,
      clusterOptions: undefined,
      filter: '',
      minZoom: 0,
      maxZoom: 25,

      // Layer style 'simple' is default for vector layers (see ember-flexberry-gis/layers-styles/simple).
      styleSettings: layersStylesRenderer.getDefaultStyleSettings('simple'),

      legendSettings,
    });

    return settings;
  },

  /**
    Creates new search settings object (with search settings related to layer-type).

    @method createSearchSettings
    @returns {Object} New search settings object (with search settings related to layer-type).
  */
  createSearchSettings() {
    const settings = this._super(...arguments);
    $.extend(true, settings, {
      queryString: '',
      maxResultsCount: 10,
    });

    return settings;
  },

  /**
    Indicates whether related layer is vector layer.

    @method isVectorType
    @param {Boolean} howVector.
    @returns {Boolean}
  */
  isVectorType() {
    return true;
  },
});
