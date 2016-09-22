/**
  @module ember-flexberry-gis
 */
import Ember from 'ember';
import { Model as MapLayerMixin, defineProjections } from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-map-layer';
import { Projection } from 'ember-flexberry-data';
import LeafletCrsMixin from '../mixins/leaflet-crs';

/**
  Map layer model.

  @class NewPlatformFlexberryGISMapLayer
  @extends BaseModel
  @uses LeafletCrsMixin
 */
let Model = Projection.Model.extend(MapLayerMixin, LeafletCrsMixin, {
  settingsAsObject: Ember.computed('settings', function () {
    let stringToDeserialize = this.get('settings');
    if (!Ember.isBlank(stringToDeserialize)) {
      return JSON.parse(stringToDeserialize);
    }

    return {};
  }),

  layers: null
});

defineProjections(Model);

export default Model;
