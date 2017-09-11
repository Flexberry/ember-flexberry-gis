/**
  @module ember-flexberry-gis
*/

import { Model as MapObjectSettingMixin, defineProjections } from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-map-object-setting';
import { Projection } from 'ember-flexberry-data';
import { Offline } from 'ember-flexberry-data';

/**
  Map object setting model.

  @class NewPlatformFlexberryGISMapObjectSettingModel
  @extends Model
  @uses OfflineModelMixin
  @uses NewPlatformFlexberryGISMapObjectSettingModelMixin
*/
let Model = Projection.Model.extend(Offline.ModelMixin, MapObjectSettingMixin, {
});

defineProjections(Model);

export default Model;
