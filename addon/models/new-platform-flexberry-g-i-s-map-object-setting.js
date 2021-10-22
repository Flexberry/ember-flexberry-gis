/**
  @module ember-flexberry-gis
*/

import {
  Model as MapObjectSettingMixin,
  defineProjections
} from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-map-object-setting';
import EmberFlexberryDataModel from 'ember-flexberry-data/models/model';
import OfflineModelMixin from 'ember-flexberry-data/mixins/offline-model';

/**
  Map object setting model.

  @class NewPlatformFlexberryGISMapObjectSettingModel
  @extends Model
  @uses OfflineModelMixin
  @uses NewPlatformFlexberryGISMapObjectSettingModelMixin
*/
let Model = EmberFlexberryDataModel.extend(OfflineModelMixin, MapObjectSettingMixin, {
});

defineProjections(Model);

export default Model;
