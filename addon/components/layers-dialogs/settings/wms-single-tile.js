/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../../templates/components/layers-dialogs/settings/wms-single-tile';

/**
  Settings-part of WMS single tile layer modal dialog.

  @class WmsSingleTileLayerSettingsComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend({
  /**
    Array containing available info formats.

    @property _availableInfoFormats
    @type String[]
    @private
  */
  _availableInfoFormats: null,

  /**
    Reference to component's template.
  */
  layout,

  /**
    Overridden ['tagName'](http://emberjs.com/api/classes/Ember.Component.html#property_tagName)
    is empty to disable component's wrapping <div>.

    @property tagName
    @type String
    @default ''
  */
  tagName: '',

  /**
    Editing layer deserialized type-related settings.

    @property settings
    @type Object
    @default null
  */
  settings: null,

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    // Initialize available info formats.
    let availableFormats = L.TileLayer.WMS.Format.getExisting();
    this.set('_availableInfoFormats', Ember.A(availableFormats));
  }
});
