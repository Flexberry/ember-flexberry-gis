/**
  @module ember-flexberry-gis
*/

import { Model as LayerLinkMixin, defineProjections } from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-layer-link';
import { Projection } from 'ember-flexberry-data';
import { Offline } from 'ember-flexberry-data';

/**
  Layer link model.

  @class NewPlatformFlexberryGISLayerLinkModel
  @extends Model
  @uses OfflineModelMixin
  @uses NewPlatformFlexberryGISLayerLinkModelMixin
*/
let Model = Projection.Model.extend(Offline.ModelMixin, LayerLinkMixin, {
});

defineProjections(Model);

export default Model;
