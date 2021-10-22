/**
  @module ember-flexberry-gis
*/

import { on } from '@ember/object/evented';
import { once } from '@ember/runloop';
import { observer } from '@ember/object';
import { buildValidations } from 'ember-cp-validations';
import LayerModelMixin from '../mixins/layer-model';
import LeafletCrsMixin from '../mixins/leaflet-crs';
import EmberFlexberryDataModel from 'ember-flexberry-data/models/model';
import OfflineModelMixin from 'ember-flexberry-data/mixins/offline-model';
import {
  Model as LayerMetadataMixin,
  defineProjections,
  ValidationRules
} from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-layer-metadata';

const Validations = buildValidations(ValidationRules, {
  dependentKeys: ['model.i18n.locale'],
});

/**
  Layer metadata model.

  @class NewPlatformFlexberryGISLayerMetadataModel
  @extends Model
  @uses OfflineModelMixin
  @uses NewPlatformFlexberryGISLayerMetadataModelMixin
  @uses LayerModelMixin
  @uses LeafletCrsMixin
*/
let Model = EmberFlexberryDataModel.extend(
  OfflineModelMixin,
  LayerMetadataMixin,
  LayerModelMixin,
  LeafletCrsMixin,
  Validations,
{
  _anyTextChanged: on('init', observer('name', 'description', 'keyWords', function() {
    once(this, '_anyTextCompute');
  })),

  anyTextCompute() {
    return `${this.get('name') || ''} ${this.get('description') || ''} ${(this.get('keyWords') || '').replace(/,/g, ' ')}`;
  }
});

defineProjections(Model);

export default Model;
