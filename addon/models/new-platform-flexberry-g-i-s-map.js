/**
  @module ember-flexberry-gis
*/

import { once } from '@ember/runloop';

import { observer } from '@ember/object';
import { on } from '@ember/object/evented';
import {
  Model as MapMixin,
  defineProjections
} from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-map';
import MapModelApiMixin from '../mixins/flexberry-map-model-api';
import MapModelApiVisualEditMixin from '../mixins/flexberry-map-model-api-visualedit';
import MapModelApiSaveLayerMixin from '../mixins/flexberry-map-model-api-savelayer';
import MapModelApiReloadLayerMixin from '../mixins/flexberry-map-model-api-reloadlayer';
import MapModelApiExpansionMixin from '../mixins/flexberry-map-model-api-expansion';
import MapModelApiCosmosMixin from '../mixins/flexberry-map-model-api-cosmos';
import LeafletCrsMixin from '../mixins/leaflet-crs';
import EmberFlexberryDataModel from 'ember-flexberry-data/models/model';
import OfflineModelMixin from 'ember-flexberry-data/mixins/offline-model';

/**
  Map model.

  @class NewPlatformFlexberryGISMapModel
  @extends Model
  @uses OfflineModelMixin
  @uses NewPlatformFlexberryGISMapModelMixin
  @uses LeafletCrsMixin
*/
let Model = EmberFlexberryDataModel.extend(
  OfflineModelMixin,
  MapMixin,
  LeafletCrsMixin,
  MapModelApiMixin,
  MapModelApiVisualEditMixin,
  MapModelApiSaveLayerMixin,
  MapModelApiReloadLayerMixin,
  MapModelApiExpansionMixin,
  MapModelApiCosmosMixin,
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
