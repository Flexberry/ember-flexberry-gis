/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import { Model as LayerMetadataMixin, defineProjections } from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-layer-metadata';
import { Projection } from 'ember-flexberry-data';
import { Offline } from 'ember-flexberry-data';
import LayerModelMixin from '../mixins/layer-model';
import LeafletCrsMixin from '../mixins/leaflet-crs';

/**
  Layer metadata model.

  @class NewPlatformFlexberryGISLayerMetadataModel
  @extends Model
  @uses OfflineModelMixin
  @uses NewPlatformFlexberryGISLayerMetadataModelMixin
  @uses LayerModelMixin
  @uses LeafletCrsMixin
*/
let Model = Projection.Model.extend(Offline.ModelMixin, LayerMetadataMixin, LayerModelMixin, LeafletCrsMixin, {
  _anyTextChanged: Ember.on('init', Ember.observer('name', 'description', 'keyWords', function() {
    Ember.run.once(this, '_anyTextCompute');
  })),

  anyTextCompute() {
    return `${this.get('name') || ''} ${this.get('description') || ''} ${(this.get('keyWords') || '').replace(/,/g, ' ')}`;
  }
});

defineProjections(Model);

export default Model;
