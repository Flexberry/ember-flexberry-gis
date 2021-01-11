/**
  @module ember-flexberry-gis-dummy
*/

import { Projection } from 'ember-flexberry-data';
import config from '../config/environment';
import GisAdapter from 'ember-flexberry-gis/adapters/odata';

/**
  Application adapter.

  @class ApplicationAdapter
  @extends OdataAdapter
  @uses AdapterMixin
*/
export default GisAdapter.extend(Projection.AdapterMixin, {
  /**
    Host address to which all requests will be sent.

    @property host
    @type String
    @default config.APP.backendUrls.api
  */
  host: config.APP.backendUrls.api
});
