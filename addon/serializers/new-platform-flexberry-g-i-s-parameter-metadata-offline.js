/**
  @module ember-flexberry-gis
*/

import { OfflineSerializer as ParameterMetadataSerializer } from
  '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-parameter-metadata-offline';
import __ApplicationSerializer from './application-offline';

/**
  Parameter metadata offline serializer.
  @class NewPlatformFlexberryGISParameterMetadataOfflineSerializer
  @extends OfflineSerializer
  @uses <a href="https://www.emberjs.com/api/ember-data/2.4/classes/DS.EmbeddedRecordsMixin">DS.EmbeddedRecordsMixin</a>
  @uses NewPlatformFlexberryGISParameterMetadataOfflineSerializerMixin
*/
export default __ApplicationSerializer.extend(ParameterMetadataSerializer, {
});
