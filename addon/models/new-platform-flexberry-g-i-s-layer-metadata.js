import DS from 'ember-data';
import __BaseModel from './base';
import Proj from 'ember-flexberry-data';
let Model = __BaseModel.extend({
  name: DS.attr('string'),
  type: DS.attr('string'),
  coordinateReferenceSystem: DS.attr('string'),
  settings: DS.attr('string'),
  createTime: DS.attr('string'),
  creator: DS.attr('string'),
  editTime: DS.attr('string'),
  editor: DS.attr('string'),
  validations: {
    name: { presence: true },
    type: { presence: true }
  }
});
Model.defineProjection('AuditView', 'new-platform-flexberry-g-i-s-layer-metadata', {
  name: Proj.attr('Name'),
  type: Proj.attr('Type'),
  coordinateReferenceSystem: Proj.attr('Coordinate reference system'),
  settings: Proj.attr('Settings')
});
Model.defineProjection('LayerMetadataE', 'new-platform-flexberry-g-i-s-layer-metadata', {
  name: Proj.attr('Name'),
  type: Proj.attr('Type'),
  coordinateReferenceSystem: Proj.attr('Coordinate reference system'),
  settings: Proj.attr('Settings')
});
Model.defineProjection('LayerMetadataL', 'new-platform-flexberry-g-i-s-layer-metadata', {
  name: Proj.attr('Name'),
  type: Proj.attr('Type'),
  coordinateReferenceSystem: Proj.attr('Coordinate reference system'),
  settings: Proj.attr('Settings'),
  createTime: Proj.attr('Создание'),
  creator: Proj.attr('Создатель'),
  editTime: Proj.attr('Редактирование'),
  editor: Proj.attr('Редактор')
});
export default Model;
