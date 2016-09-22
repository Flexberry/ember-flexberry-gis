/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import DS from 'ember-data';
import { Projection } from 'ember-flexberry-data';

/**
  Mixin containing map model attributes, relations & projections.

  @class NewPlatformFlexberyGISMapLayerModelMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export let Model = Ember.Mixin.create({
  name: DS.attr('string'),
  type: DS.attr('string'),
  visibility: DS.attr('boolean'),
  settings: DS.attr('string'),
  coordinateReferenceSystem: DS.attr('string'),
  index: DS.attr('number'),
  parent: DS.belongsTo('new-platform-flexberry-g-i-s-map-layer', { inverse: null, async: false }),

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
  model.defineProjection('MapLayerE', 'new-platform-flexberry-g-i-s-map-layer', {
    name: Projection.attr('Name'),
    type: Projection.attr('Type'),
    visibility: Projection.attr('Visibility'),
    settings: Projection.attr('Settings'),
    index: Projection.attr('Index'),
    coordinateReferenceSystem: Projection.attr('CRS'),
    parent: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', 'Parent layer', {
      name: Projection.attr('Name', {
        hidden: true
      })
    }, {
      displayMemberPath: 'name'
    })
  });
};
