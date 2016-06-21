import DS from 'ember-data';
import BaseModel from 'ember-flexberry/models/base';
import Proj from 'ember-flexberry-data';
let Model = BaseModel.extend({
  center: DS.attr('string'),
  zoom: DS.attr('number'),
  layerVisibility: DS.attr('string'),
  user: DS.attr('string'),
  map: DS.belongsTo('new-platform-flexberry-g-i-s-map', { inverse: null, async: false }),
  validations: {
    user: { presence: true }
  }
});
Model.defineProjection('MapUserSettingsE', 'new-platform-flexberry-g-i-s-map-user-settings', {
  center: Proj.attr('Center'),
  zoom: Proj.attr('Zoom'),
  layerVisibility: Proj.attr('Layer visibility'),
  user: Proj.attr('User'),
  map: Proj.belongsTo('new-platform-flexberry-g-i-s-map', 'Map', {
    name: Proj.attr('Name')
  })
});
Model.defineProjection('MapUserSettingsL', 'new-platform-flexberry-g-i-s-map-user-settings', {
  center: Proj.attr('Center'),
  zoom: Proj.attr('Zoom'),
  layerVisibility: Proj.attr('Layer visibility'),
  user: Proj.attr('User'),
  map: Proj.belongsTo('new-platform-flexberry-g-i-s-map', 'Name', {
    name: Proj.attr('Name')
  }, { hidden: true })
});
export default Model;
