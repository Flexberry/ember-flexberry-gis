/**
  @module ember-flexberry-gis
*/

import { buildValidations } from 'ember-cp-validations';
import EmberFlexberryDataModel from 'ember-flexberry-data/models/model';
import OfflineModelMixin from 'ember-flexberry-data/mixins/offline-model';
import {
  Model as LinkMetadataMixin,
  defineProjections,
  ValidationRules
} from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-link-metadata';

const Validations = buildValidations(ValidationRules, {
  dependentKeys: ['model.i18n.locale'],
});

/**
  Link metadata model.

  @class NewPlatformFlexberryGISLinkMetadataModel
  @extends Model
  @uses OfflineModelMixin
  @uses NewPlatformFlexberryGISLinkMetadataModelMixin
*/
const Model = EmberFlexberryDataModel.extend(OfflineModelMixin, LinkMetadataMixin, Validations, {
});

defineProjections(Model);

export default Model;
