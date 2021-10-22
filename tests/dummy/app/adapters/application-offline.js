import OfflineAdapter from 'ember-flexberry-data/adapters/offline';
import config from '../config/environment';

/**
  Application offline adapter.

  @class ApplicationOfflineAdapter
  @extends OfflineAdapter
  @uses AdapterMixin
*/
export default OfflineAdapter.extend({
  /**
    Offline dadabase name.

    @property dbName
    @type String
    @default config.APP.offline.dbName
  */
  dbName: config.APP.offline.dbName,
});
