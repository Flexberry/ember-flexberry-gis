/**
  @module ember-flexberry-gis
*/

import { Model as ParameterMetadataMixin, defineProjections } from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-parameter-metadata';
import { Projection } from 'ember-flexberry-data';
import { Offline } from 'ember-flexberry-data';

/**
  Parameter metadata model.

  @class NewPlatformFlexberryGISLayerLinkModel
  @extends Model
  @uses OfflineModelMixin
  @uses NewPlatformFlexberryGISLayerLinkModelMixin
*/
let Model = Projection.Model.extend(Offline.ModelMixin, ParameterMetadataMixin, {
});

defineProjections(Model);

export default Model;
