/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import RectangleMaptool from './rectangle';

/**
  Identify map tool.

  @class IdentifyMaptool
  @extends RectangleMaptool
*/
export default RectangleMaptool.extend({
  /**
    Tool's cursor CSS-class.

    @property cursor
    @type String
    @default 'help'
  */
  cursor: 'help',

  /**
    Map layers hierarchy.

    @property layers
    @type Object[]
    @default null
  */
  layers: null,

  /**
    Checks whether given layer can be identified.

    @method _layerCanBeIdentified
    @returns {Boolean} Flag: indicates whether given layer can be identified.
    @private
  */
  _layerCanBeIdentified(layer) {
    let layerClassFactory = Ember.getOwner(this).knownForType('layer', Ember.get(layer, 'type'));

    return Ember.A(Ember.get(layerClassFactory, 'operations') || []).contains('identify');
  },

  /**
    Returns flat array of layers satisfying to current identification mode.

    @method _getLayersToIdentify
    @param {Object} options Method options.
    @param {Object[]} options.excludedLayers Layers that must be excluded from identification.
    @returns {Object[]} Flat array of layers satisfying to current identification mode.
    @private
  */
  _getLayersToIdentify({ excludedLayers }) {
    Ember.assert('Method \'_getLayersToIdentify\' must be overridden in some extended identify map tool.', false);
  },

  /**
    Starts identification by array of satisfying layers inside given bounding box.

    @method _startIdentification
    @param {Object} options Method options.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlngbounds">L.LatLngBounds</a>} options.boundingBox Bounds of identification area.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} options.latlng Center of the bounding box.
    @param {Object[]} options.excludedLayers Layers excluded from identification.
    @private
  */
  _startIdentification({ boundingBox, latlng, excludedLayers }) {
    let e = {
      boundingBox: boundingBox,
      latlng: latlng,
      excludedLayers: Ember.A(excludedLayers || []),
      layers: this._getLayersToIdentify({ excludedLayers }),
      results: Ember.A()
    };

    // Fire custom event on leaflet map (if there is layers to identify).
    if (e.layers.length > 0) {
      this.get('map').fire('flexberry-map:identify', e);
    }

    // Promises array could be totally changed in 'flexberry-map:identify' event handlers, we should prevent possible errors.
    e.results = Ember.isArray(e.results) ? e.results : Ember.A();
    let results = Ember.A();
    let promises = Ember.A();

    // Handle each result.
    // Detach promises from already received features.
    e.results.forEach((result) => {
      if (Ember.isNone(result)) {
        return;
      }

      results.pushObject(result);
      let layer = Ember.get(result, 'layer');
      let features = Ember.get(result, 'features');

      if (!(features instanceof Ember.RSVP.Promise)) {
        return;
      }

      promises.pushObject(features);
      features.then((receivedFeatures) => {
        Ember.set(result, 'features', receivedFeatures);
      }).catch((reason) => {
        Ember.set(result, 'features', null);
        Ember.set(result, 'error', reason || new Error('Unknown error'));

        // Log error.
        let i18n = this.get('i18n');
        let errorMessage = i18n.t('maptools.identify.error-message', {
          layerName: Ember.get(layer, 'name')
        });
        Ember.Logger.error(`${errorMessage}: `, reason);
      });
    });

    // Wait for all promises to be settled & call '_finishIdentification' hook.
    Ember.RSVP.allSettled(promises).then(() => {
      e.results = results;
      this._finishIdentification(e);
    });
  },

  /**
    Finishes identification.

    @method _finishIdentification
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlngbounds">L.LatLngBounds</a>} e.boundingBox Bounds of identification area.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the bounding box.
    @param {Object[]} excludedLayers Objects describing those layers which were excluded from identification.
    @param {Object[]} layers Objects describing those layers which are identified.
    @param {Object[]} results Objects describing identification results.
    Every result-object has the following structure: { layer: ..., features: [...] },
    where 'layer' is metadata of layer related to identification result, features is array
    containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects].
    @private
  */
  _finishIdentification(e) {
    let leafletMap = this.get('map');
    leafletMap.openPopup('Identification finished. Results count: ' + e.results.length, e.latlng);
  },

  /**
    Handles map's 'editable:drawing:end' event.

    @method rectangleDrawingDidEnd
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#rectangle">L.Rectangle</a>} e.layer Drawn rectangle layer.
  */
  rectangleDrawingDidEnd({ layer }) {
    // Get center before layer will be removed from map in super-method.
    let latlng = layer.getCenter();

    this._super(...arguments);

    this._startIdentification({
      boundingBox: layer.getBounds(),
      latlng: latlng
    });
  },

  /**
    Enables tool.

    @method enable
    @param {Object} layers Map layers hierarchy.
  */
  enable(layers) {
    this._super(...arguments);

    this.set('layers', layers);
  },

  /**
    Disables tool.

    @method disable
  */
  disable() {
    this._super(...arguments);

    this.set('layers', null);
  }
});
