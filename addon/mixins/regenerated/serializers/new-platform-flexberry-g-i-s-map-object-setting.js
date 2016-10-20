import Ember from 'ember';

export let Serializer = Ember.Mixin.create({
  attrs: {
    defaultMap: { serialize: 'odata-id', deserialize: 'records' },
    layerLink: { serialize: false, deserialize: 'records' }
  },
  /**
  * Field name where object identifier is kept.
  */
  primaryKey: '__PrimaryKey'
});
