/**
  @module ember-flexberry-gis
*/
import Ember from 'ember';
import { Model as LayerMetadataMixin, defineProjections } from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-layer-metadata';
import { Projection } from 'ember-flexberry-data';

/**
  Map layer metadata model.

  @class NewPlatformFlexberryGISLayerMetadata
  @extends BaseModel
*/
let Model = Projection.Model.extend(LayerMetadataMixin, {
  settingsAsObject: Ember.computed('settings', function () {
    let stringToDeserialize = this.get('settings');
    if (stringToDeserialize) {
      return JSON.parse(stringToDeserialize);
    }

    return {};
  })
});

defineProjections(Model);

export default Model;
