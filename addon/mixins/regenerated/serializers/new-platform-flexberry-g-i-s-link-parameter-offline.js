/**
  @module ember-flexberry-gis
*/

import $ from 'jquery';

import Mixin from '@ember/object/mixin';

/**
  Mixin containing initializetion logic for link parameter offline serializer.

  @class NewPlatformFlexberyGISLinkParameterOfflineSerializerMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export const OfflineSerializer = Mixin.create({
  getAttrs() {
    const parentAttrs = this._super();
    const attrs = {
      layerLink: { serialize: 'id', deserialize: 'records', },
    };

    return $.extend(true, {}, parentAttrs, attrs);
  },

  init() {
    this.set('attrs', this.getAttrs());
    this._super(...arguments);
  },
});
