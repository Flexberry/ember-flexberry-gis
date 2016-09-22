/**
  @module ember-flexberry-gis
*/

import {
  Model as NewPlatformFlexberyGISMapModelMixin,
  defineProjections
} from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-map';
import { Projection } from 'ember-flexberry-data';
import LeafletCrsMixin from '../mixins/leaflet-crs';

/**
  Map model.

  @class NewPlatformFlexberryGISMap
  @extends BaseModel
  @uses NewPlatformFlexberyGISMapModelMixin
  @uses LeafletCrsMixin
*/
let Model = Projection.Model.extend(NewPlatformFlexberyGISMapModelMixin, LeafletCrsMixin, {
});

defineProjections(Model);

export default Model;
