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
    mapLayer: { serialize: false, deserialize: 'records' }
  },
  /**
  * Field name where object identifier is kept.
  */
  primaryKey: '__PrimaryKey'
});
