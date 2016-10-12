/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../../templates/components/map-commands-dialogs/search-settings/geocoder-osm-ru';

/**
  Search settings part of Geocoder OSM.ru layer modal dialog.

  @class GeocoderOsmRuSearchSettingsComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend({
  /**
    Serialized bounding box of leaflet map's current view.

    @property _leafletMapBoundingBox
    @type String
    @default null
  */
  _leafletMapBoundingBox: null,

  /**
    Autocomplete URL related to layer-settings & map's current bounding box.

    @property _autocompleteUrl
    @type String
    @readOnly
    @private
  */
  _autocompleteUrl: Ember.computed('layer.settingsAsObject.autocompleteUrl', '_leafletMapBoundingBox', function() {
    let autocompleteUrl = '';
    let baseUrl = this.get('layer.settingsAsObject.autocompleteUrl');
    if (Ember.isBlank(baseUrl)) {
      return autocompleteUrl;
    } else {
      baseUrl = Ember.$('<a>', { href: baseUrl });
    }

    let leafletMapBoundingBox = this.get('_leafletMapBoundingBox');
    autocompleteUrl = `//${baseUrl.prop('hostname')}` +
      `${baseUrl.prop('port') ? ':' + baseUrl.prop('port') : ''}` +
      `${baseUrl.prop('pathname') ? baseUrl.prop('pathname') : ''}` +
      `${baseUrl.prop('search') ? baseUrl.prop('search') : '?'}q={query}` +
      `${leafletMapBoundingBox ? '&bbox' + leafletMapBoundingBox : ''}`;

    return autocompleteUrl;
  }),

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
    Observes changes in reference to leaflet map.
    Attaches map events handlers.

    @method _leafletMapDidChange
    @private
  */
  _leafletMapDidChange: Ember.on('init', Ember.observer('leafletMap', function() {
    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletMap)) {
      leafletMap.on('moveend', this._onLeafletMapViewChanged, this);
      leafletMap.on('zoomend', this._onLeafletMapViewChanged, this);

      this._onLeafletMapViewChanged();
    }
  })),

  /**
    Handles changes in leaflet map's current view.

    @method _onLeafletMapViewChanged
    @private
  */
  _onLeafletMapViewChanged() {
    this.set('_leafletMapBoundingBox', this.get('leafletMap').getBounds().toBBoxString());
  },

  /**
    Destroys component.
  */
  willDestroyElement() {
    this._super(...arguments);

    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletMap)) {
      leafletMap.off('moveend', this._onLeafletMapViewChanged, this);
      leafletMap.off('zoomend', this._onLeafletMapViewChanged, this);

      this.set('leafletMap', null);
    }
  }
});
