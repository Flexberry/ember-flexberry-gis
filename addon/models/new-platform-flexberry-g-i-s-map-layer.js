/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import DS from 'ember-data';
import BaseModel from 'ember-flexberry/models/base';
import Proj from 'ember-flexberry-data';
import LeafletCrsMixin from '../mixins/leaflet-crs';

/**
  Map layer model.

  @class NewPlatformFlexberryGISMapLayer
  @extends BaseModel
  @uses LeafletCrsMixin
*/
let Model = BaseModel.extend(LeafletCrsMixin, {
  name: DS.attr('string'),
  type: DS.attr('string'),
  visibility: DS.attr('boolean'),
  settings: DS.attr('string'),
  coordinateReferenceSystem: DS.attr('string'),
  index: DS.attr('number'),
  parent: DS.belongsTo('new-platform-flexberry-g-i-s-map-layer', { inverse: null, async: false }),

  settingsAsObject: Ember.computed('settings', function () {
    let stringToDeserialize = this.get('settings');
    if (!Ember.isBlank(stringToDeserialize)) {
      return JSON.parse(stringToDeserialize);
    }
    return {};
  }),

  layers: null
});

Model.defineProjection('MapLayerE', 'new-platform-flexberry-g-i-s-map-layer', {
  name: Proj.attr('Name'),
  type: Proj.attr('Type'),
  visibility: Proj.attr('Visibility'),
  settings: Proj.attr('Settings'),
  coordinateReferenceSystem: Proj.attr('CRS'),
  index: Proj.attr('Index'),
  parent: Proj.belongsTo('new-platform-flexberry-g-i-s-map-layer', 'Parent layer', {
    name: Proj.attr('Name', {
      hidden: true
    })
  }, {
    displayMemberPath: 'name'
  })
});

Model.defineProjection('MapLayerL', 'new-platform-flexberry-g-i-s-map-layer', {
  name: Proj.attr('Name'),
  type: Proj.attr('Type'),
  visibility: Proj.attr('Visibility')
});

export default Model;
