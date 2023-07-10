/**
  @module ember-flexberry-gis
*/

import { OfflineSerializer as MapSerializer } from
  '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-map-offline';
import __ApplicationSerializer from './application-offline';

/**
  Map offline serializer.
  @class NewPlatformFlexberryGISMapOfflineSerializer
  @extends OfflineSerializer
  @uses <a href="https://www.emberjs.com/api/ember-data/2.4/classes/DS.EmbeddedRecordsMixin">DS.EmbeddedRecordsMixin</a>
  @uses NewPlatformFlexberryGISMapOfflineSerializerMixin
*/
export default __ApplicationSerializer.extend(MapSerializer, {
});
