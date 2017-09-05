/**
  @module ember-flexberry-gis
*/

import { Model as LinkMetadataMixin, defineProjections } from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-link-metadata';
import { Projection } from 'ember-flexberry-data';
import { Offline } from 'ember-flexberry-data';

/**
  Link metadata model.

  @class NewPlatformFlexberryGISLinkMetadataModel
  @extends Model
  @uses OfflineModelMixin
  @uses NewPlatformFlexberryGISLinkMetadataModelMixin
*/
let Model = Projection.Model.extend(Offline.ModelMixin, LinkMetadataMixin, {
});

defineProjections(Model);

export default Model;
