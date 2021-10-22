/**
  @module ember-flexberry-gis
*/

import { buildValidations } from 'ember-cp-validations';
import EmberFlexberryDataModel from 'ember-flexberry-data/models/model';
import OfflineModelMixin from 'ember-flexberry-data/mixins/offline-model';
import {
  Model as MapObjectSettingMixin,
  defineProjections,
  ValidationRules
} from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-map-object-setting';

const Validations = buildValidations(ValidationRules, {
  dependentKeys: ['model.i18n.locale'],
});

/**
  Map object setting model.

  @class NewPlatformFlexberryGISMapObjectSettingModel
  @extends Model
  @uses OfflineModelMixin
  @uses NewPlatformFlexberryGISMapObjectSettingModelMixin
*/
let Model = EmberFlexberryDataModel.extend(OfflineModelMixin, MapObjectSettingMixin, Validations, {
});

defineProjections(Model);

export default Model;
