/**
  @module ember-flexberry-gis
*/

import { Model as MapUserSettingsMixin, defineProjections } from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-map-user-settings';
import { Projection } from 'ember-flexberry-data';
/**
  Map user settings model.

  @class NewPlatformFlexberryGISMapUserSettings
  @extends BaseModel
*/
let Model = Projection.Model.extend(MapUserSettingsMixin, {

});

defineProjections(Model);

export default Model;
