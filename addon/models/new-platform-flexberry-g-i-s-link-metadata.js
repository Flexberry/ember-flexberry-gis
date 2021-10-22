/**
  @module ember-flexberry-gis
*/

import {
  Model as LinkMetadataMixin,
  defineProjections
} from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-link-metadata';
import EmberFlexberryDataModel from 'ember-flexberry-data/models/model';
import OfflineModelMixin from 'ember-flexberry-data/mixins/offline-model';

/**
  Link metadata model.

  @class NewPlatformFlexberryGISLinkMetadataModel
  @extends Model
  @uses OfflineModelMixin
  @uses NewPlatformFlexberryGISLinkMetadataModelMixin
*/
let Model = EmberFlexberryDataModel.extend(OfflineModelMixin, LinkMetadataMixin, {
});

defineProjections(Model);

export default Model;
