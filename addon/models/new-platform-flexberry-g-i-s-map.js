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
  rootLayer: DS.belongsTo('new-platform-flexberry-g-i-s-map-layer', { inverse: null, async: false })
});

Model.defineProjection('MapE', 'new-platform-flexberry-g-i-s-map', {
  name: Proj.attr('Name'),
  lat: Proj.attr('Lat'),
  lng: Proj.attr('Lng'),
  zoom: Proj.attr('Zoom'),
  public: Proj.attr('Public'),
  coordinateReferenceSystem: Proj.attr('CRS'),
  rootLayer: Proj.belongsTo('new-platform-flexberry-g-i-s-map-layer', 'Root layer', {
    name: Proj.attr('Name', {
      hidden: true
    })
  }, {
    displayMemberPath: 'name'
  })
});

Model.defineProjection('MapL', 'new-platform-flexberry-g-i-s-map', {
  name: Proj.attr('Name'),
  lat: Proj.attr('Lat'),
  lng: Proj.attr('Lng'),
  zoom: Proj.attr('Zoom'),
  public: Proj.attr('Public')
});

export default Model;
