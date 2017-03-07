/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Mixin containing map layer model serializer properties.

  @class NewPlatformFlexberyGISMapLayerSerializerMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export let Serializer = Ember.Mixin.create({
  attrs: {
    parent: { serialize: 'odata-id', deserialize: 'records' },
    map: { serialize: 'odata-id', deserialize: 'records' },
    layerLink: { serialize: false, deserialize: 'records' }
  },
  primaryKey: '__PrimaryKey'
});
