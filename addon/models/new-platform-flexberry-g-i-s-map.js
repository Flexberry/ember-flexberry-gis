import DS from 'ember-data';
import BaseModel from 'ember-flexberry/models/base';
import Proj from 'ember-flexberry-data';
let Model = BaseModel.extend({
  name: DS.attr('string'),
  center: DS.attr('string'),
  zoom: DS.attr('number'),
  public: DS.attr('boolean'),
  coordinateReferenceSystem: DS.attr('string'),
  createTime: DS.attr('string'),
  creator: DS.attr('string'),
  editTime: DS.attr('string'),
  editor: DS.attr('string'),
  layers: DS.hasMany('new-platform-flexberry-g-i-s-map-layer', { inverse: 'map', async: false }),
  validations: {
    name: { presence: true },
    public: { presence: true }
  }
});
Model.defineProjection('AuditView', 'new-platform-flexberry-g-i-s-map', {
  name: Proj.attr('Name'),
  center: Proj.attr('Center'),
  zoom: Proj.attr('Zoom'),
  public: Proj.attr('Public'),
  coordinateReferenceSystem: Proj.attr('Coordinate reference system'),
  layers: Proj.hasMany('new-platform-flexberry-g-i-s-map-layer', '', {
    name: Proj.attr('Name'),
    type: Proj.attr('Type'),
    visibility: Proj.attr('Visibility'),
    settings: Proj.attr('Settings'),
    coordinateReferenceSystem: Proj.attr('Coordinate reference system')
  })
});
Model.defineProjection('MapE', 'new-platform-flexberry-g-i-s-map', {
  name: Proj.attr('Name'),
  center: Proj.attr('Center'),
  zoom: Proj.attr('Zoom'),
  public: Proj.attr('Public'),
  coordinateReferenceSystem: Proj.attr('Coordinate reference system'),
  layers: Proj.hasMany('new-platform-flexberry-g-i-s-map-layer', 'Layers', {
    name: Proj.attr('Name'),
    type: Proj.attr('Type'),
    visibility: Proj.attr('Visibility'),
    settings: Proj.attr('Settings'),
    coordinateReferenceSystem: Proj.attr('Coordinate reference system')
  })
});
Model.defineProjection('MapL', 'new-platform-flexberry-g-i-s-map', {
  name: Proj.attr('Name'),
  center: Proj.attr('Center'),
  zoom: Proj.attr('Zoom'),
  public: Proj.attr('Public'),
  coordinateReferenceSystem: Proj.attr('Coordinate reference system'),
  createTime: Proj.attr('Создание'),
  creator: Proj.attr('Создатель'),
  editTime: Proj.attr('Редактирование'),
  editor: Proj.attr('Редактор')
});
export default Model;
