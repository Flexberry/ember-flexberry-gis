/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Mixin containing map model serializer properties.

  @class NewPlatformFlexberyGISMapSerializerMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export let Serializer = Ember.Mixin.create({
  attrs: {
    rootLayer: { serialize: 'odata-id', deserialize: 'records' }
  },
  primaryKey: '__PrimaryKey'
});
