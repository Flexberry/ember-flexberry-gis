/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../../templates/components/map-commands-dialogs/search-settings/wfs';

/**
  Search settings part of WFS layer modal dialog.

  @class WFSSearchSettingsComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend({

  _searchPropertiesArray: Ember.computed('searchProperties', function () {
    let props = [];
    let searchProperties = this.get('searchProperties');
    for (var property in searchProperties) {
      if (searchProperties.hasOwnProperty(property)) {
        props.push(searchProperties[property]);
      }
    }

    return props;
  }),

  actions: {
    onChange(selectedText) {
      let searchProperties = this.get('searchProperties');
      for (var property in searchProperties) {
        if (searchProperties[property] === selectedText) {
          this.set('settings.propertyName', property);
        }
      }
    }
  },

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
    Editing layer deserialized search settings.

    @property settings
    @type Object
    @default null
  */
  settings: null,

  /**
    Map layer within which search must be executed.

    @property layer
    @type Object
    @default null
  */
  layer: null,

  /**
    Map layers hierarchy.

    @property layers
    @type Object[]
    @default null
  */
  layers: null,

  /**
    Leaflet map.

    @property leafletMap
    @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
    @default null
  */
  leafletMap: null,

  /**
    Object with properties for which user can do search

    @property searchProperties
    @type Object
    @default null
   */
  searchProperties: null
});
