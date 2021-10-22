/**
  @module ember-flexberry-gis
*/

import $ from 'jquery';

import Mixin from '@ember/object/mixin';

/**
  Mixin containing initializetion logic for layer link serializer.

  @class NewPlatformFlexberyGISLayerLinkSerializerMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export const Serializer = Mixin.create({
  getAttrs() {
    const parentAttrs = this._super();
    const attrs = {
      mapObjectSetting: { serialize: 'odata-id', deserialize: 'records', },
      layer: { serialize: 'odata-id', deserialize: 'records', },
      parameters: { serialize: false, deserialize: 'records', },
    };

    return $.extend(true, {}, parentAttrs, attrs);
  },

  init() {
    this.set('attrs', this.getAttrs());
    this._super(...arguments);
  },
});
