import Ember from 'ember';

export let Serializer = Ember.Mixin.create({
  attrs: {
    layer: { serialize: 'odata-id', deserialize: 'records' },
    mapObjectSetting: { serialize: 'odata-id', deserialize: 'records' },
    linkParameter: { serialize: false, deserialize: 'records' }
  },
  /**
  * Field name where object identifier is kept.
  */
  primaryKey: '__PrimaryKey'
});
