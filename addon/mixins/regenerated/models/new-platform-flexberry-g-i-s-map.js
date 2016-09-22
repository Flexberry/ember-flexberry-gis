/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import DS from 'ember-data';
import { Projection } from 'ember-flexberry-data';

/**
  Mixin containing map model attributes, relations & projections.

  @class NewPlatformFlexberyGISMapModelMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export let Model = Ember.Mixin.create({
  name: DS.attr('string'),
  lat: DS.attr('number'),
  lng: DS.attr('number'),
  zoom: DS.attr('number'),
  public: DS.attr('boolean'),
  coordinateReferenceSystem: DS.attr('string'),
  rootLayer: DS.belongsTo('new-platform-flexberry-g-i-s-map-layer', { inverse: null, async: false }),

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
  model.defineProjection('MapE', 'new-platform-flexberry-g-i-s-map', {
    name: Projection.attr('Name'),
    lat: Projection.attr('Lat'),
    lng: Projection.attr('Lng'),
    zoom: Projection.attr('Zoom'),
    public: Projection.attr('Public'),
    coordinateReferenceSystem: Projection.attr('CRS'),
    rootLayer: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', 'Root layer', {
      name: Projection.attr('Name', {
        hidden: true
      })
    }, {
      displayMemberPath: 'name'
    })
  });

  model.defineProjection('MapL', 'new-platform-flexberry-g-i-s-map', {
    name: Projection.attr('Name'),
    lat: Projection.attr('Lat'),
    lng: Projection.attr('Lng'),
    zoom: Projection.attr('Zoom'),
    public: Projection.attr('Public')
  });
};
