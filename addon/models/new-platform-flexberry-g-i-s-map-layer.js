import DS from 'ember-data';
import BaseModel from 'ember-flexberry/models/base';
import Proj from 'ember-flexberry-data';
let Model = BaseModel.extend({
  name: DS.attr('string'),
  type: DS.attr('string'),
  visibility: DS.attr('boolean'),
  settings: DS.attr('string'),
  coordinateReferenceSystem: DS.attr('string'),
  map: DS.belongsTo('new-platform-flexberry-g-i-s-map', { inverse: 'layers', async: false }),
  validations: {
    name: { presence: true },
    type: { presence: true },
    visibility: { presence: true }
  }
});
Model.defineProjection('AuditView', 'new-platform-flexberry-g-i-s-map-layer', {
  name: Proj.attr('Name'),
  type: Proj.attr('Type'),
  visibility: Proj.attr('Visibility'),
  settings: Proj.attr('Settings'),
  coordinateReferenceSystem: Proj.attr('Coordinate reference system')
});
Model.defineProjection('MapLayerE', 'new-platform-flexberry-g-i-s-map-layer', {
  name: Proj.attr('Name'),
  type: Proj.attr('Type'),
  visibility: Proj.attr('Visibility'),
  settings: Proj.attr('Settings'),
  coordinateReferenceSystem: Proj.attr('Coordinate reference system')
});
export default Model;
