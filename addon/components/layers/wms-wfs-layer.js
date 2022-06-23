/**
  @module ember-flexberry-gis
*/

import { getOwner, setOwner } from '@ember/application';
import { isNone } from '@ember/utils';
import { set, observer } from '@ember/object';
import $ from 'jquery';
import WmsLayerComponent from './wms-layer';
import WfsLayerComponent from './wfs-layer';

/**
  WMS-WFS layer component for leaflet map.

  @class WmsWfsLayerComponent
  @extends WmsLayerComponent
*/
export default WmsLayerComponent.extend({
  /**
    Inner WFS layer.
    Needed for identification (always invisible, won't be added to map).

    @property _wfsLayer
  */
  _wfsLayer: null,

  /**
    Returns promise with the properties object of inner wfs layer.

    @method _getAttributesOptions
    @private
  */
  _getAttributesOptions() {
    let resultingAttribitesOptions;

    return this._super(...arguments).then((attributesOptions) => {
      resultingAttribitesOptions = attributesOptions;

      return attributesOptions;
    }).then(() => {
      // еще бы перезагружать сам слой при добавлении/удалении/изменении
      // слой уже создан, нет смысла делать еще один, нужно только загрузить в него объекты
      // увеличим свои шансы загрузить нужный объект (например тот, что мы только что проидентифицировали)
      // p.s. до этого грузились все объекты по showExisting, но с maxFeatures = 1000 и часто нужного объекта не было
      this.get('_wfsLayer._leafletObject').options.continueLoading = true;
      this.get('_wfsLayer._leafletObject').showLayerObjects = true;
      return this.get('_wfsLayer').continueLoad(this.get('_wfsLayer._leafletObject'));
    }).then(() => {
      set(resultingAttribitesOptions, 'object', this.get('_wfsLayer._leafletObject'));
      set(resultingAttribitesOptions, 'settings.readonly', this.get('wfs.readonly'));

      return resultingAttribitesOptions;
    });
  },

  /**
    Sets wfs layer's filter, when wms filter was changed.
  */
  filterObserver: observer('options.filter', function () {
    const filter = this.get('options.filter');
    this.set('_wfsLayer.options.filter', filter);
  }),

  /**
    Returns leaflet layer for filter component.

    @method getLeafletObject
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|
      <a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  getLeafletObject() {
    const options = $.extend(this.get('_wfsLayer.options') || {}, { showExisting: false, });
    return this.get('_wfsLayer').createVectorLayer(options).then((layer) => layer);
  },

  /**
    Handles 'flexberry-map:identify' event of leaflet map.

    @method identify
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlngbounds">L.LatLngBounds</a>} options.boundingBox Bounds of identification area.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the bounding box.
    @param {Object[]} layers Objects describing those layers which must be identified.
    @param {Object[]} results Objects describing identification results.
    Every result-object has the following structure: { layer: ..., features: [...] },
    where 'layer' is metadata of layer related to identification result, features is array
    containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
    or a promise returning such array.
  */
  identify() {
    const innerWfsLayer = this.get('_wfsLayer');
    if (!isNone(innerWfsLayer)) {
      return innerWfsLayer.identify(...arguments);
    }
  },

  /**
    Handles 'flexberry-map:query' event of leaflet map.

    @method _query
    @param {Object[]} layerLinks Array containing metadata for query
    @param {Object} e Event object.
    @param {Object} queryFilter Object with query filter paramteres
    @param {Object[]} results.features Array containing leaflet layers objects
    or a promise returning such array.
  */
  query() {
    const innerWfsLayer = this.get('_wfsLayer');
    if (!isNone(innerWfsLayer)) {
      return innerWfsLayer.query(...arguments);
    }
  },

  /**
    Handles 'flexberry-map:search' event of leaflet map.

    @method search
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the search area.
    @param {Object[]} layer Object describing layer that must be searched.
    @param {Object} searchOptions Search options related to layer type.
    @param {Object} results Hash containing search results.
    @param {Object[]} results.features Array containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
    or a promise returning such array.
  */
  search() {
    const innerWfsLayer = this.get('_wfsLayer');
    if (!isNone(innerWfsLayer)) {
      return innerWfsLayer.search(...arguments);
    }
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    const innerWfsLayerProperties = {
      leafletMap: this.get('leafletMap'),
      leafletContainer: this.get('leafletContainer'),
      layerModel: this.get('layerModel'),
      index: this.get('index'),
      visibility: false,
      dynamicProperties: this.get('wfs'),
      renderer: {},
    };

    // Set creating component's owner to avoid possible lookup exceptions.
    const owner = getOwner(this);
    setOwner(innerWfsLayerProperties, owner);

    // Create inner WFS-layer which is needed for identification (always invisible, won't be added to map).
    this.set('_wfsLayer', WfsLayerComponent.create(innerWfsLayerProperties));
    this.filterObserver();
  },

  /**
    Destroys component.
  */
  willDestroyElement() {
    this._super(...arguments);

    const innerWfsLayer = this.get('_wfsLayer');
    if (!isNone(innerWfsLayer)) {
      innerWfsLayer.destroy();
      this.set('_wfsLayer', null);
    }
  },
});
