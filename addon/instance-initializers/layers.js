/**
  @module ember-flexberry
*/

import Ember from 'ember';

/**
  Replaces layers factories with already created instances in owner.knownForType utility.

  @for ApplicationInstanceInitializer
  @method layers.initialize
  @param {<a href="http://emberjs.com/api/classes/Ember.ApplicationInstance.html">Ember.ApplicationInstance</a>} applicationInstance Ember application instance.
*/
export function initialize(applicationInstance) {
  // Retrieve known layers & replace factories with already created instances.
  // It is needed for a while to keep backward compatibility.
  let knownLayers = applicationInstance.knownForType('layer');
  Ember.A(Object.keys(knownLayers) || []).forEach((layerName) => {
    knownLayers[layerName] = applicationInstance.lookup(`layer:${layerName}`);
  });
}

export default {
  after: 'owner',
  name: 'layers',
  initialize
};
