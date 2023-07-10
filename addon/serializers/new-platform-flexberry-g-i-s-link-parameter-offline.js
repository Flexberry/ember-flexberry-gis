/**
  @module ember-flexberry-gis
*/

import { OfflineSerializer as LinkParameterSerializer } from
  '../mixins/regenerated/serializers/new-platform-flexberry-g-i-s-link-parameter-offline';
import __ApplicationSerializer from './application-offline';

/**
  Link parameter offline serializer.
  @class NewPlatformFlexberryGISLinkParameterOfflineSerializer
  @extends OfflineSerializer
  @uses <a href="https://www.emberjs.com/api/ember-data/2.4/classes/DS.EmbeddedRecordsMixin">DS.EmbeddedRecordsMixin</a>
  @uses NewPlatformFlexberryGISLinkParameterOfflineSerializerMixin
*/
export default __ApplicationSerializer.extend(LinkParameterSerializer, {
});
