/**
  @module ember-flexberry-gis
*/

import { buildValidations } from 'ember-cp-validations';
import EmberFlexberryDataModel from 'ember-flexberry-data/models/model';
import OfflineModelMixin from 'ember-flexberry-data/mixins/offline-model';
import {
  Model as LayerLinkMixin,
  defineProjections,
  ValidationRules
} from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-layer-link';

const Validations = buildValidations(ValidationRules, {
  dependentKeys: ['model.i18n.locale'],
});

/**
  Layer link model.

  @class NewPlatformFlexberryGISLayerLinkModel
  @extends Model
  @uses OfflineModelMixin
  @uses NewPlatformFlexberryGISLayerLinkModelMixin
*/
let Model = EmberFlexberryDataModel.extend(OfflineModelMixin, LayerLinkMixin, Validations, {
});

defineProjections(Model);

export default Model;
