import Ember from 'ember';
import DS from 'ember-data';
import { Projection } from 'ember-flexberry-data';
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
  rootLayer: DS.belongsTo('new-platform-flexberry-g-i-s-map-layer', { inverse: null, async: false }),
  getValidations: function () {
    let parentValidations = this._super();
    let thisValidations = {
      name: { presence: true },
      public: { presence: true },
      rootLayer: { presence: true }
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
    zoom: Projection.attr('Zoom'),
    public: Projection.attr('Public'),
    coordinateReferenceSystem: Projection.attr('Coordinate reference system'),
    lat: Projection.attr(''),
    lng: Projection.attr(''),
    rootLayer: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', '', {

    })
  });
  model.defineProjection('MapE', 'new-platform-flexberry-g-i-s-map', {
    name: Projection.attr('Name'),
    lat: Projection.attr('Lat'),
    lng: Projection.attr('Lng'),
    zoom: Projection.attr('Zoom'),
    public: Projection.attr('Public'),
    coordinateReferenceSystem: Projection.attr('Coordinate reference system'),
    rootLayer: Projection.belongsTo('new-platform-flexberry-g-i-s-map-layer', '', {

    })
  });
  model.defineProjection('MapL', 'new-platform-flexberry-g-i-s-map', {
    name: Projection.attr('Name'),
    public: Projection.attr('Public'),
    coordinateReferenceSystem: Projection.attr('Coordinate reference system'),
    createTime: Projection.attr('Создание'),
    creator: Projection.attr('Создатель'),
    editTime: Projection.attr('Редактирование'),
    editor: Projection.attr('Редактор')
  });
};
