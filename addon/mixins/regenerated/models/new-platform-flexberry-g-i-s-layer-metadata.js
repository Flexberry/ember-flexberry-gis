/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import DS from 'ember-data';
import { Projection } from 'ember-flexberry-data';

/**
  Mixin containing map layer metadata model attributes, relations & projections.

  @class NewPlatformFlexberyGISLayerMetadataModelMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export let Model = Ember.Mixin.create({
  name: DS.attr('string'),
  type: DS.attr('string'),
  coordinateReferenceSystem: DS.attr('string'),
  settings: DS.attr('string'),

  getValidations() {
    let parentValidations = this._super();
    let thisValidations = {
    };
    return Ember.$.extend(true, {}, parentValidations, thisValidations);
  },

  init() {
    this.set('validations', this.getValidations());
    this._super.apply(this, arguments);
  }
});

export let defineProjections = function (model) {
  model.defineProjection('LayerMetadataE', 'new-platform-flexberry-g-i-s-layer-metadata', {
    name: Projection.attr('Name'),
    type: Projection.attr('Type'),
    coordinateReferenceSystem: Projection.attr('CRS'),
    settings: Projection.attr('Settings')
  });

  model.defineProjection('LayerMetadataL', 'new-platform-flexberry-g-i-s-layer-metadata', {
    name: Projection.attr('Name'),
    type: Projection.attr('Type')
  });
};
