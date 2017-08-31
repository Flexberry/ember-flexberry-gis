/**
  @module ember-flexberry-gis-dummy
*/

import { Adapter } from 'ember-flexberry-data';
import config from '../config/environment';

/**
  Application offline adapter.

  @class ApplicationOfflineAdapter
  @extends OfflineAdapter
  @uses AdapterMixin
*/
export default Adapter.Offline.extend({
  /**
    Offline dadabase name.

    @property dbName
    @type String
    @default config.APP.offline.dbName
  */
  dbName: config.APP.offline.dbName,
});
