/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import {
  Model as NewPlatformFlexberyGISLayerMetadataModelMixin,
  defineProjections
} from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-layer-metadata';
import { Projection } from 'ember-flexberry-data';

/**
  Map layer metadata model.

  @class NewPlatformFlexberryGISLayerMetadata
  @extends Model
  @uses NewPlatformFlexberyGISLayerMetadataModelMixin
  @uses LeafletCrsMixin
*/
let Model = Projection.Model.extend(NewPlatformFlexberyGISLayerMetadataModelMixin, {
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
