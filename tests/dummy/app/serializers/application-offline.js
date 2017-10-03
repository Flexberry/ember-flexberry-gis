/**
  @module ember-flexberry-gis-dummy
*/

import DS from 'ember-data';
import { Serializer } from 'ember-flexberry-data';

/**
  Application offline serializer.

  @class ApplicationOfflineSerializer
  @extends OfflineSerializer
*/
export default Serializer.Offline.extend(DS.EmbeddedRecordsMixin, {
  attrs: {
  }
});
