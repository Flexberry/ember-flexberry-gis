/**
  @module ember-flexberry-gis
*/

import DS from 'ember-data';
import {
  OfflineSerializer as MapLayerSerializer
} from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-map-layer-offline';
import OfflineSerializer from 'ember-flexberry-data/serializers/offline';

/**
  Map layer offline serializer.

  @class NewPlatformFlexberryGISMapLayerOfflineSerializer
  @extends OfflineSerializer
  @uses <a href="https://www.emberjs.com/api/ember-data/2.4/classes/DS.EmbeddedRecordsMixin">DS.EmbeddedRecordsMixin</a>
  @uses NewPlatformFlexberryGISMapLayerOfflineSerializerMixin
*/
export default OfflineSerializer.extend(DS.EmbeddedRecordsMixin, MapLayerSerializer, {
});
