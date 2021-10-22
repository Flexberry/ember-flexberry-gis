/**
  @module ember-flexberry-gis
*/

import DS from 'ember-data';
import OfflineSerializer from 'ember-flexberry-data/serializers/offline';
import {
  OfflineSerializer as ParameterMetadataSerializer
} from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-parameter-metadata-offline';

/**
  Parameter metadata offline serializer.

  @class NewPlatformFlexberryGISParameterMetadataOfflineSerializer
  @extends OfflineSerializer
  @uses <a href="https://www.emberjs.com/api/ember-data/2.4/classes/DS.EmbeddedRecordsMixin">DS.EmbeddedRecordsMixin</a>
  @uses NewPlatformFlexberryGISParameterMetadataOfflineSerializerMixin
*/
export default OfflineSerializer.extend(DS.EmbeddedRecordsMixin, ParameterMetadataSerializer, {
});
