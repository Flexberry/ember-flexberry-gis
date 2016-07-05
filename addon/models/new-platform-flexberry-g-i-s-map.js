import DS from 'ember-data';
import BaseModel from 'ember-flexberry/models/base';
import Proj from 'ember-flexberry-data';
let Model = BaseModel.extend({
  name: DS.attr('string'),
  lat: DS.attr('number'),
  lng: DS.attr('number'),
  zoom: DS.attr('number'),
  public: DS.attr('boolean'),
  coordinateReferenceSystem: DS.attr('string'),
  createTime: DS.attr('string'),
  creator: DS.attr('string'),
  editTime: DS.attr('string'),
  editor: DS.attr('string'),
  rootLayer: DS.belongsTo('new-platform-flexberry-g-i-s-map-layer', { inverse: null, async: false }),

  layers: null,

  validations: {
    name: { presence: true },
    public: { presence: true },
    rootLayer: { presence: true }
  }
});
Model.defineProjection('AuditView', 'new-platform-flexberry-g-i-s-map', {
  name: Proj.attr('Name'),
  zoom: Proj.attr('Zoom'),
  public: Proj.attr('Public'),
  coordinateReferenceSystem: Proj.attr('Coordinate reference system'),
  lat: Proj.attr(''),
  lng: Proj.attr(''),
  rootLayer: Proj.belongsTo('new-platform-flexberry-g-i-s-map-layer', '', {

  })
});
Model.defineProjection('MapE', 'new-platform-flexberry-g-i-s-map', {
  name: Proj.attr('Name'),
  lat: Proj.attr('Lat'),
  lng: Proj.attr('Lng'),
  zoom: Proj.attr('Zoom'),
  public: Proj.attr('Public'),
  coordinateReferenceSystem: Proj.attr('Coordinate reference system'),
  rootLayer: Proj.belongsTo('new-platform-flexberry-g-i-s-map-layer', '', {

  })
});
Model.defineProjection('MapL', 'new-platform-flexberry-g-i-s-map', {
  name: Proj.attr('Name'),
  public: Proj.attr('Public'),
  coordinateReferenceSystem: Proj.attr('Coordinate reference system'),
  createTime: Proj.attr('Создание'),
  creator: Proj.attr('Создатель'),
  editTime: Proj.attr('Редактирование'),
  editor: Proj.attr('Редактор')
});
export default Model;
