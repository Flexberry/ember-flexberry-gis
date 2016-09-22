/**
  @module ember-flexberry-gis-dummy
*/

import { Projection, Adapter } from 'ember-flexberry-data';
import config from '../config/environment';

/**
  Application adapter.

  @class ApplicationAdapter
  @extends OdataAdapter
  @uses AdapterMixin
*/
export default Adapter.Odata.extend(Projection.AdapterMixin, {
  /**
    Host address to which all requests will be sent.

    @property host
    @type String
    @default config.APP.backendUrls.api
  */
  host: config.APP.backendUrls.api
});
