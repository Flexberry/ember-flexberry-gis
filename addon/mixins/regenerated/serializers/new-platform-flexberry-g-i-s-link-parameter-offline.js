/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Mixin containing initializetion logic for link parameter offline serializer.

  @class NewPlatformFlexberyGISLinkParameterOfflineSerializerMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export let OfflineSerializer = Ember.Mixin.create({
  getAttrs: function () {
    let parentAttrs = this._super();
    let attrs = {
      layerLink: { serialize: 'id', deserialize: 'records' }
    };

    return Ember.$.extend(true, {}, parentAttrs, attrs);
  },

  init: function () {
    this.set('attrs', this.getAttrs());
    this._super(...arguments);
  }
});
