/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Clipboard for operations `copy`, `cut` and `paste` with geo objects.

  @class GeoObjectsClipboardService
  @extends <a href="http://emberjs.com/api/classes/Ember.Service.html">Ember.Service</a>
  @uses <a href="http://emberjs.com/api/classes/Ember.Evented.html">Ember.Evented</a>
*/
export default Ember.Service.extend(Ember.Evented, {
  /**
    All original copied geo objects.

    @private
    @property __copy
    @type Array
    @default []
  */
  __copy: Ember.A(),

  /**
    All original cut out geo objects.

    @private
    @property __cut
    @type Array
    @default []
  */
  __cut: Ember.A(),

  /**
    All copied geo objects.

    @private
    @property _copy
    @type Array
    @default []
  */
  _copy: Ember.A(),

  /**
    All cut out geo objects.

    @private
    @property _cut
    @type Array
    @default []
  */
  _cut: Ember.A(),

  /**
    The contents of the clipboard.

    @property clipboard
    @type Array
    @default []
  */
  content: Ember.computed.union('_copy', '_cut'),

  /**
    Clipboard is empty.

    @property isEmpty
    @type Boolean
    @default true
  */
  isEmpty: Ember.computed.equal('content.length', 0),

  /**
    Copy the geo object to clipboard.

    @method copy
    @param {Object} geoObject
  */
  copy(geoObject) {
    let index = this.get('__cut').indexOf(geoObject);
    if (index !== -1) {
      this.get('__cut').removeAt(index);
      this.get('_cut').removeAt(index);
    }

    index = this.get('__copy').indexOf(geoObject);
    if (index === -1) {
      let length = this.get('__copy.length');
      let geoJSON = geoObject.leafletLayer.toGeoJSON();
      let type = geoObject.type || geoJSON.type;
      let geometry = geoObject.geometry || geoJSON.geometry;
      let properties = geoObject.properties || geoJSON.properties;

      this.get('_copy').insertAt(length, { type, geometry, properties });
      this.get('__copy').insertAt(length, geoObject);
    }
  },

  /**
    Cut the geo object to clipboard.

    @method cut
    @param {Object} geoObject
  */
  cut(geoObject) {
    let index = this.get('__copy').indexOf(geoObject);
    if (index !== -1) {
      this.get('_copy').removeAt(index);
      this.get('__copy').removeAt(index);
    }

    index = this.get('__cut').indexOf(geoObject);
    if (index === -1) {
      let length = this.get('__cut.length');
      let geoJSON = geoObject.leafletLayer.toGeoJSON();
      let type = geoObject.type || geoJSON.type;
      let geometry = geoObject.geometry || geoJSON.geometry;
      let properties = geoObject.properties || geoJSON.properties;

      this.get('_cut').insertAt(length, { type, geometry, properties });
      this.get('__cut').insertAt(length, geoObject);
    }
  },

  /**
    Paste the geo object from clipboard.

    @method paste
    @param {Object} geoObject
  */
  paste(geoObject) {
    let index = this.get('_copy').indexOf(geoObject);
    if (index === -1) {
      index = this.get('_cut').indexOf(geoObject);
      if (index === -1) {
        throw new Error('Geo object not found in clipboard.');
      } else {
        this.trigger('paste', this.get('__cut').objectAt(index));
        this.get('__cut').removeAt(index);
        this.get('_cut').removeAt(index);
      }
    } else {
      this.get('__copy').removeAt(index);
      this.get('_copy').removeAt(index);
    }
  },
});
