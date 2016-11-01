/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import DS from 'ember-data';
import { Projection } from 'ember-flexberry-data';

/**
  Mixin containing map model attributes, relations & projections.

  @class NewPlatformFlexberyGISCswConnectionModelMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export let Model = Ember.Mixin.create({
  name: DS.attr('string'),
  url: DS.attr('string'),

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
  model.defineProjection('CswConnectionE', 'new-platform-flexberry-g-i-s-map', {
    name: Projection.attr('Name'),
    url: Projection.attr('Url')
  });

  model.defineProjection('CswConnectionL', 'new-platform-flexberry-g-i-s-map', {
    name: Projection.attr('Name'),
    url: Projection.attr('Url')
  });
};
