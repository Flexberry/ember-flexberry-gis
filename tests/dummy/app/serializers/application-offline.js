/**
  @module ember-flexberry-gis-dummy
*/

import DS from 'ember-data';
import OfflineSerializer from 'ember-flexberry-data/serializers/offline';

/**
  Application offline serializer.

  @class ApplicationOfflineSerializer
  @extends OfflineSerializer
*/
export default OfflineSerializer.extend(DS.EmbeddedRecordsMixin, {
  attrs: {
  }
});
