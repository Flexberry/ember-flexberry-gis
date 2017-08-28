/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

export let Serializer = Ember.Mixin.create({
  getAttrs: function () {
    let parentAttrs = this._super();
    let attrs = {
      mapObjectSetting: { serialize: 'odata-id', deserialize: 'records' },
      layer: { serialize: 'odata-id', deserialize: 'records' },
      linkParameter: { serialize: false, deserialize: 'records' }
    };

    return Ember.$.extend(true, {}, parentAttrs, attrs);
  },

  init: function () {
    this.set('attrs', this.getAttrs());
    this._super(...arguments);
  }
});
