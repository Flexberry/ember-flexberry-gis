/**
  @module ember-flexberry
*/

import Ember from 'ember';
import { _setAvailableLayerTypes } from '../utils/layers';

/**
  Initializes available layers types in {{#crossLink "Utils.Layers/_availableLayerTypes:property"}}'utils/layers'{{/crossLink}}.

  @for ApplicationInstanceInitializer
  @method layers.initialize
  @param {<a href="http://emberjs.com/api/classes/Ember.ApplicationInstance.html">Ember.ApplicationInstance</a>} applicationInstance Ember application instance.
*/
export function initialize(applicationInstance) {
  let resolver = applicationInstance.application.__registry__.resolver;
  let knownLayers = Object.keys(resolver.knownForType('layer'));
  let availablelayerTypes = Ember.A(knownLayers).map((knownLayer) => {
    return knownLayer.split(':')[1];
  });

  _setAvailableLayerTypes(availablelayerTypes);
}

export default {
  name: 'layers',
  initialize
};
