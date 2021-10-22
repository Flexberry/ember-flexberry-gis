import config from '../config/environment';
import GisAdapter from 'ember-flexberry-gis/adapters/odata';
import AdapterMixin from 'ember-flexberry-data/mixins/adapter';

/**
  Application adapter.

  @class ApplicationAdapter
  @extends OdataAdapter
  @uses AdapterMixin
*/
export default GisAdapter.extend(AdapterMixin, {
  /**
    Host address to which all requests will be sent.

    @property host
    @type String
    @default config.APP.backendUrls.api
  */
  host: config.APP.backendUrls.api
});
