/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import {
  Model as NewPlatformFlexberyGISMapLayerModelMixin,
  defineProjections
} from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-map-layer';
import {
  Projection
} from 'ember-flexberry-data';
import LeafletCrsMixin from '../mixins/leaflet-crs';

/**
  Map layer model.

  @class NewPlatformFlexberryGISMapLayer
  @extends Model
  @uses NewPlatformFlexberyGISMapLayerModelMixin
  @uses LeafletCrsMixin
*/
let Model = Projection.Model.extend(NewPlatformFlexberyGISMapLayerModelMixin, LeafletCrsMixin, {
  settingsAsObject: Ember.computed('settings', function () {
    let stringToDeserialize = this.get('settings');
    if (!Ember.isBlank(stringToDeserialize)) {
      try {
        return JSON.parse(stringToDeserialize);
      } catch (e) {
        console.log('Error on read layer properties on layer ' + this.get('name'), e);
        throw e;
      }
    }

    return {};
  }),

  layers: Ember.computed('map', 'map.mapLayer', function () {
    try {
      let layers = this.get('map.mapLayer');
      if (layers) {
        let result = layers.filterBy('parent.id', this.get('id'));

        return result;
      }
    } catch (e) {
      console.log('Error on read children of layer ' + this.get('name'), e);
      throw e;
    }

    return {};
  })
});

defineProjections(Model);

export default Model;
