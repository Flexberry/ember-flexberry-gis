import { buildValidations } from 'ember-cp-validations';
import EmberFlexberryDataModel from 'ember-flexberry-data/models/model';
import OfflineModelMixin from 'ember-flexberry-data/mixins/offline-model';
import {
  Model as LinkParameterMixin,
  defineProjections,
  ValidationRules
} from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-link-parameter';

const Validations = buildValidations(ValidationRules, {
  dependentKeys: ['model.i18n.locale'],
});

/**
  Link parameter model.

  @class NewPlatformFlexberryGISLinkParameterModel
  @extends Model
  @uses OfflineModelMixin
  @uses NewPlatformFlexberryGISLinkParameterModelMixin
*/
const Model = EmberFlexberryDataModel.extend(OfflineModelMixin, LinkParameterMixin, Validations, {
});

defineProjections(Model);

export default Model;
