/**
  @module ember-flexberry-gis
*/

import DS from 'ember-data';
import OfflineSerializer from 'ember-flexberry-data/serializers/offline';
import {
  OfflineSerializer as MapObjectSettingSerializer
} from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-map-object-setting-offline';

/**
  Map object setting offline serializer.

  @class NewPlatformFlexberryGISMapObjectSettingOfflineSerializer
  @extends OfflineSerializer
  @uses <a href="https://www.emberjs.com/api/ember-data/2.4/classes/DS.EmbeddedRecordsMixin">DS.EmbeddedRecordsMixin</a>
  @uses NewPlatformFlexberryGISMapObjectSettingOfflineSerializerMixin
*/
export default OfflineSerializer.extend(DS.EmbeddedRecordsMixin, MapObjectSettingSerializer, {
});
