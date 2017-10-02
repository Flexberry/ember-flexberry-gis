/**
  @module ember-flexberry-gis
*/

import DS from 'ember-data';
import { Serializer } from 'ember-flexberry-data';
import { OfflineSerializer as LinkParameterSerializer } from '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-link-parameter-offline';

/**
  Link parameter offline serializer.

  @class NewPlatformFlexberryGISLinkParameterOfflineSerializer
  @extends OfflineSerializer
  @uses <a href="https://www.emberjs.com/api/ember-data/2.4/classes/DS.EmbeddedRecordsMixin">DS.EmbeddedRecordsMixin</a>
  @uses NewPlatformFlexberryGISLinkParameterOfflineSerializerMixin
*/
export default Serializer.Offline.extend(DS.EmbeddedRecordsMixin, LinkParameterSerializer, {
});
