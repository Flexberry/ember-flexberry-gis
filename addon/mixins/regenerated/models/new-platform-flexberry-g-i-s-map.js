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
  createTime: DS.attr('date'),
  creator: DS.attr('string'),
  editTime: DS.attr('date'),
  editor: DS.attr('string'),
  mapLayer: DS.hasMany('new-platform-flexberry-g-i-s-map-layer', { inverse: 'map', async: false }),
  getValidations: function () {
    let parentValidations = this._super();
    let thisValidations = {
      name: { presence: true },
      public: { presence: true }
    };
    return Ember.$.extend(true, {}, parentValidations, thisValidations);
  },
  init: function () {
    this.set('validations', this.getValidations());
    this._super.apply(this, arguments);
  }
});
export let defineProjections = function (model) {
  model.defineProjection('AuditView', 'new-platform-flexberry-g-i-s-map', {
    name: Projection.attr('Name'),
    creator: Projection.attr('Creator'),
    createTime: Projection.attr('Create time'),
    editor: Projection.attr('Editor'),
    editTime: Projection.attr('Edit time')
  });
  model.defineProjection('Map', 'new-platform-flexberry-g-i-s-map', {
    name: Projection.attr(''),
    lat: Projection.attr(''),
    lng: Projection.attr(''),
    zoom: Projection.attr(''),
    public: Projection.attr(''),
    coordinateReferenceSystem: Projection.attr('')
  });
  model.defineProjection('MapE', 'new-platform-flexberry-g-i-s-map', {
    name: Projection.attr('Name'),
    lat: Projection.attr('Lat'),
    lng: Projection.attr('Lng'),
    zoom: Projection.attr('Zoom'),
    public: Projection.attr('Public'),
    coordinateReferenceSystem: Projection.attr('CRS'),
    mapLayer: Projection.hasMany('new-platform-flexberry-g-i-s-map-layer', '', {
      name: Projection.attr('Name'),
      type: Projection.attr('Type'),
      visibility: Projection.attr('Visibility'),
      index: Projection.attr('Index'),
      coordinateReferenceSystem: Projection.attr('CRS'),
      settings: Projection.attr('Settings'),
      parent: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', 'Parent', {

      }),
      layerLink: Projection.hasMany('new-platform-flexberry-g-i-s-layer-link', '', {
        layer: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', '', {
          name: Projection.attr('Слой')
        }, { hidden: true }),
        mapObjectSetting: Projection.belongsTo('new-platform-flexberry-g-i-s-map-object-setting', '', {

        }, { hidden: true })
      })
    })
  });
  model.defineProjection('MapL', 'new-platform-flexberry-g-i-s-map', {
    name: Projection.attr('Наименование'),
    lat: Projection.attr('Lat'),
    lng: Projection.attr('Lng'),
    zoom: Projection.attr('Масштаб'),
    public: Projection.attr('Общая')
  });
};
