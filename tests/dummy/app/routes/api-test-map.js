/**
  @module ember-flexberry-gis-dummy
*/

import MapRoute from './map';

/**
  Map edit route.

  @class MapRoute
  @extends EditMapRoute
  @uses EditFormRouteOperationsIndicationMixin, MapRouteCswLoaderMixin
*/
export default MapRoute.extend({
  actions: {
    refreshMap() {
      this.refresh();
    }
  }
});
