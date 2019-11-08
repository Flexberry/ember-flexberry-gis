/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import { Model as MapMixin, defineProjections } from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-map';
import MapModelApiMixin from '../mixins/flexberry-map-model-api';
import MpaModelApiVisualEditMixin from '../mixins/flexberry-map-model-api-visualedit';
import { Projection } from 'ember-flexberry-data';
import { Offline } from 'ember-flexberry-data';
import LeafletCrsMixin from '../mixins/leaflet-crs';

/**
  Map model.

  @class NewPlatformFlexberryGISMapModel
  @extends Model
  @uses OfflineModelMixin
  @uses NewPlatformFlexberryGISMapModelMixin
  @uses LeafletCrsMixin
*/
let Model = Projection.Model.extend(
  Offline.ModelMixin,
  MapMixin,
  LeafletCrsMixin,
  MapModelApiMixin,
  MpaModelApiVisualEditMixin,
  {
  _anyTextChanged: Ember.on('init', Ember.observer('name', 'description', 'keyWords', function() {
    Ember.run.once(this, '_anyTextCompute');
  })),

  anyTextCompute() {
    return `${this.get('name') || ''} ${this.get('description') || ''} ${(this.get('keyWords') || '').replace(/,/g, ' ')}`;
  }
});

defineProjections(Model);

export default Model;
