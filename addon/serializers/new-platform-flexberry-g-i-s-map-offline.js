/**
  @module ember-flexberry-gis
*/

import DS from 'ember-data';
import { Serializer } from 'ember-flexberry-data';
import { OfflineSerializer as MapSerializer } from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-map-offline';

/**
  Map offline serializer.

  @class NewPlatformFlexberryGISMapOfflineSerializer
  @extends OfflineSerializer
  @uses <a href="https://www.emberjs.com/api/ember-data/2.4/classes/DS.EmbeddedRecordsMixin">DS.EmbeddedRecordsMixin</a>
  @uses NewPlatformFlexberryGISMapOfflineSerializerMixin
*/
export default Serializer.Offline.extend(DS.EmbeddedRecordsMixin, MapSerializer, {
});
