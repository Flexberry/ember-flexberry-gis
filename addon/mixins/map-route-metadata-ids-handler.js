/**
  @module ember-flexberry-gis-dummy
*/

import Ember from 'ember';

/**
  Map edit form mixin which handles metadata ids.
  @class MapRouteMetadataIdsHandlerMixin
*/
export default Ember.Mixin.create({
  /**
    Configuration hash for this route's queryParams. [More info](http://emberjs.com/api/classes/Ember.Route.html#property_queryParams).

    @property queryParams
    @type Object
  */
  queryParams: {
    metadata: {
      refreshModel: false,
      replace: false,
      as: 'metadata'
    }
  },

  /**
    String with metadata ids separated by comma.

    @property metadata
    @type String
    @default null
  */
  metadata: null
});
