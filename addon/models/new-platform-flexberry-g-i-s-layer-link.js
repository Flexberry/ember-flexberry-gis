/**
  @module ember-flexberry-gis
*/

import {
  Model as LayerLinkMixin,
  defineProjections
} from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-layer-link';
import EmberFlexberryDataModel from 'ember-flexberry-data/models/model';
import OfflineModelMixin from 'ember-flexberry-data/mixins/offline-model';

/**
  Layer link model.

  @class NewPlatformFlexberryGISLayerLinkModel
  @extends Model
  @uses OfflineModelMixin
  @uses NewPlatformFlexberryGISLayerLinkModelMixin
*/
let Model = EmberFlexberryDataModel.extend(OfflineModelMixin, LayerLinkMixin, {
});

defineProjections(Model);

export default Model;
