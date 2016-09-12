/**
  @module ember-flexberry
*/

import Ember from 'ember';
import LayersUtil from '../utils/layers';

/**
  Initializes available layers in {{#crossLink "Utils.Layers/_availableLayers:property"}}'utils/layers'{{/crossLink}}.

  @for ApplicationInstanceInitializer
  @method layers.initialize
  @param {<a href="http://emberjs.com/api/classes/Ember.ApplicationInstance.html">Ember.ApplicationInstance</a>} applicationInstance Ember application instance.
*/
export function initialize(applicationInstance) {
  let availablelayers = {};

  let resolver = applicationInstance.application.__registry__.resolver;
  let knownLayers = Object.keys(resolver.knownForType('layer'));
  Ember.A(knownLayers).forEach((knownLayer) => {
    let layerType = knownLayer.split(':')[1];
    let layerTypeClass = applicationInstance._lookupFactory(knownLayer);

    availablelayers[layerType] = layerTypeClass;
  });

  LayersUtil._setAvailableLayers(availablelayers);
}

export default {
  name: 'layers',
  initialize
};
