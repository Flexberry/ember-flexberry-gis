/**
  @module ember-flexberry-gis
*/

import {
  Model as ParameterMetadataMixin,
  defineProjections
} from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-parameter-metadata';
import EmberFlexberryDataModel from 'ember-flexberry-data/models/model';
import OfflineModelMixin from 'ember-flexberry-data/mixins/offline-model';

/**
  Parameter metadata model.

  @class NewPlatformFlexberryGISLayerLinkModel
  @extends Model
  @uses OfflineModelMixin
  @uses NewPlatformFlexberryGISLayerLinkModelMixin
*/
let Model = EmberFlexberryDataModel.extend(OfflineModelMixin, ParameterMetadataMixin, {
});

defineProjections(Model);

export default Model;
