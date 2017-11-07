/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseLayer from '../base-vector-layer';

/* globals omnivore */

/**
  Kml layer component for leaflet map.

  @class KmlLayerComponent
  @extends BaseLayerComponent
*/
export default BaseLayer.extend({
  /**
    Specific option names available on the Layer settings tab.
  */
  leafletOptions: [
    'kmlUrl',
    'kmlString',
    'style',
    'filter'
  ],

  layerFunctions: ['filter'],

  /**
    Creates leaflet layer related to layer type.

    @method createLayer
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createVectorLayer(options) {
    options = Ember.$.extend({}, this.get('options'), options);
    if (options.filter) {
      options.filter = Ember.getOwner(this).knownForType('layer', 'kml').parseFilter(options.filter);
    }

    let layerFunctions = this.get('layerFunctions');
    let customFunction;
    for (let i = 0; i < layerFunctions.length; i++) {
      customFunction = Ember.get(options, layerFunctions[i]);
      if (customFunction && typeof (customFunction) === 'string') {
        Ember.set(options, layerFunctions[i], new Function('return ' + customFunction)());
      }
    }

    let layerWithOptions = L.geoJSON([], options);
    Ember.assert('The option "kmlUrl" or "kmlString" should be defined!', Ember.isPresent(options.kmlUrl) || Ember.isPresent(options.kmlString));

    if (options.kmlUrl) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        let layer = omnivore.kml(options.kmlUrl, {}, layerWithOptions)
          .on('ready', (e) => {
            resolve(layer);
          })
          .on('error', (e) => {
            reject(e.error || e);
          });
      });
    }

    return omnivore.kml.parse(options.kmlString, {}, layerWithOptions);
  }
});
