/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseVectorLayer from '../base-vector-layer';

/**
  Kml layer component for leaflet map.

  @class KmlLayerComponent
  @extends BaseVectorLayerComponent
*/
export default BaseVectorLayer.extend({
  /**
    Array containing component's properties which are also leaflet layer options.

    @property leafletOptions
    @type Stirng[]
  */
  leafletOptions: [
    'kmlUrl',
    'kmlString',
    'style',
    'filter'
  ],

  /**
    Array containing component's properties which are also leaflet layer options callbacks.

    @property leafletOptionsCallbacks
    @type Stirng[]
  */
  leafletOptionsCallbacks: ['filter'],

  /**
    Parses specified serialized callback into function.

    @method parseLeafletOptionsCallback
    @param {Object} options Method options.
    @param {String} options.callbackName Callback name.
    @param {String} options.serializedCallback Serialized callback.
    @return {Function} Deserialized callback function.
  */
  parseLeafletOptionsCallback({ callbackName, serializedCallback }) {
    // First filter must be converted into serialized function from temporary filter language.
    if (callbackName === 'filter' && typeof serializedCallback === 'string') {
      serializedCallback = Ember.getOwner(this).lookup('layer:kml').parseFilter(serializedCallback);
    }

    return this._super({ callbackName, serializedCallback });
  },

  /**
    Creates leaflet layer related to layer type.

    @method createLayer
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createVectorLayer(options) {
    options = Ember.$.extend({}, this.get('options'), options);

    let pane = this.get('_pane');
    if (pane) {
      options.pane = pane;
      options.renderer = this.get('_renderer');
    }

    let layerWithOptions = L.geoJSON([], options);
    Ember.assert('The option \'kmlUrl\' or \'kmlString\' should be defined!', Ember.isPresent(options.kmlUrl) || Ember.isPresent(options.kmlString));

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
