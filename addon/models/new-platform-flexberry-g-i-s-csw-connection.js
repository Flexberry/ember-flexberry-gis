/**
  @module ember-flexberry-gis
*/

import {
  Model as NewPlatformFlexberyGISCswConnectionModelMixin,
  defineProjections
} from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-csw-connection';
import { Projection } from 'ember-flexberry-data';

/**
  Map model.

  @class NewPlatformFlexberryGISCswConnectionModel
  @extends BaseModel
  @uses NewPlatformFlexberyGISCswConnectionModelMixin
*/
let Model = Projection.Model.extend(NewPlatformFlexberyGISCswConnectionModelMixin, {
});

defineProjections(Model);

export default Model;
