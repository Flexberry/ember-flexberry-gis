/**
  @module ember-flexberry-gis
 */
import { Model as MapMixin, defineProjections } from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-map';
import { Projection } from 'ember-flexberry-data';
import LeafletCrsMixin from '../mixins/leaflet-crs';

/**
  Map model.

  @class NewPlatformFlexberryGISMap
  @extends BaseModel
  @uses LeafletCrsMixin
 */
let Model = Projection.Model.extend(MapMixin, LeafletCrsMixin, {

});

defineProjections(Model);

export default Model;
