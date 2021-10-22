/**
  @module ember-flexberry-gis
*/

import DS from 'ember-data';
import { OfflineSerializer as MapSerializer } from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-map-offline';
import OfflineSerializer from 'ember-flexberry-data/serializers/offline';

/**
  Map offline serializer.

  @class NewPlatformFlexberryGISMapOfflineSerializer
  @extends OfflineSerializer
  @uses <a href="https://www.emberjs.com/api/ember-data/2.4/classes/DS.EmbeddedRecordsMixin">DS.EmbeddedRecordsMixin</a>
  @uses NewPlatformFlexberryGISMapOfflineSerializerMixin
*/
export default OfflineSerializer.extend(DS.EmbeddedRecordsMixin, MapSerializer, {
});
