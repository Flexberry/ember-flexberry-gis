/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import DS from 'ember-data';
import BaseModel from 'ember-flexberry/models/base';
import Proj from 'ember-flexberry-data';

/**
  Map layer metadata model.

  @class NewPlatformFlexberryGISLayerMetadata
  @extends BaseModel
*/
let Model = BaseModel.extend({
  name: DS.attr('string'),
  type: DS.attr('string'),
  coordinateReferenceSystem: DS.attr('string'),
  settings: DS.attr('string'),

  settingsAsObject: Ember.computed('settings', function() {
    let stringToDeserialize = this.get('settings');
    if (stringToDeserialize) {
      return JSON.parse(stringToDeserialize);
    }
    return {};
  })
});

Model.defineProjection('LayerMetadataE', 'new-platform-flexberry-g-i-s-layer-metadata', {
  name: Proj.attr('Name'),
  type: Proj.attr('Type'),
  coordinateReferenceSystem: Proj.attr('CRS'),
  settings: Proj.attr('Settings')
});

Model.defineProjection('LayerMetadataL', 'new-platform-flexberry-g-i-s-layer-metadata', {
  name: Proj.attr('Name'),
  type: Proj.attr('Type'),
  coordinateReferenceSystem: Proj.attr('CRS')
});

export default Model;
