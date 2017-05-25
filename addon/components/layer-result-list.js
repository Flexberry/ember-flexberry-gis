/**
  @module ember-flexberry-gis
 */

import Ember from 'ember';
import layout from '../templates/components/layer-result-list';

/**
  Component for display array of search\identify results

  @class LayerResultListComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
 */
export default Ember.Component.extend({

  /**
    Flag: indicates when results contains no data
    @property _noData
    @type boolean
    @default false
   */
  _noData: false,

  /**
    Flag: indicates when one or more results.features promises rejected
    @property _hasError
    @type boolean
    @default false
   */
  _hasError: false,

  /**
    Current selected feature
    @property _selectedFeature
    @type GeoJSON feature
    @default null
   */
  _selectedFeature: null,

  classNames: ['layer-result-list'],

  layout,

  /**
    FeatureGroup for place layer from selectedFeature
    @property serviceLayer
    @type L.FeatureGroup
    @default null
   */
  serviceLayer: null,

  /**
    Leaflet map object for zoom and pan
    @property leafletMap
    @type L.Map
    @default null
   */
  leafletMap: null,

  /**
    Ready results for display without promise

    @property _displayResults
    @type Ember.A()
    @default null
  */
  _displayResults: null,

  /**
    Array of results for display, each result contains object with following properties
    layerModel - MapLayer model
    features - promise for array of GeoJSON features
    @property results
    @type Ember.A()
    @default null
   */
  results: null,

  actions: {
    /**
        Handles inner FeatureResultItem's bubbled 'selectFeature' action.
        Invokes component's {{#crossLink "FeatureResultItem/sendingActions.selectFeature:method"}}'selectFeature'{{/crossLink}} action.

        @method actions.selectFeature
        @param {Object} feature Describes inner FeatureResultItem's feature object or array of it.
    */
    selectFeature(feature) {
      let selectedFeature = this.get('_selectedFeature');
      let serviceLayer = this.get('serviceLayer');

      if (selectedFeature !== feature) {
        if (!Ember.isNone(serviceLayer)) {
          serviceLayer.clearLayers();

          if (Ember.isArray(feature)) {
            feature.forEach((item) => this._selectFeature(item));
          } else {
            this._selectFeature(feature);
          }
        }

        this.set('_selectedFeature', feature);
      }
    },

    /**
      Select passed feature and zoom map to its layer bounds
      @method actions.zoomTo
      @param {Object} feature Describes inner FeatureResultItem's feature object or array of it.
     */
    zoomTo(feature) {
      let serviceLayer = this.get('serviceLayer');
      if (!Ember.isNone(serviceLayer)) {
        this.send('selectFeature', feature);

        let bounds;
        if (typeof (serviceLayer.getBounds) === 'function') {
          bounds = serviceLayer.getBounds();
        } else {
          let featureGroup = L.featureGroup(serviceLayer.getLayers());
          if (featureGroup) {
            bounds = featureGroup.getBounds();
          }
        }

        if (!Ember.isBlank(bounds)) {
          this.get('leafletMap').fitBounds(bounds.pad(1));
        }
      }
    },

    /**
      Select passed feature and pan map to its layer centroid
      @method actions.panTo
      @param {Object} feature Describes inner FeatureResultItem's feature object or array of it.
     */
    panTo(feature) {
      let latLng;
      if (typeof (feature.leafletLayer.getBounds) === 'function') {
        latLng = feature.leafletLayer.getBounds().getCenter();
      } else {
        latLng = feature.leafletLayer.getLatLng();
      }

      // TODO: pass action with panTo latLng outside
      this.get('leafletMap').panTo(latLng);
      this.send('selectFeature', feature);
    }
  },

  /**
    Set selected feature and add its layer to serviceLayer on map.
    @method _selectFeature
    @param {Object} feature Describes inner FeatureResultItem's feature object or array of it.
    @private
   */
  _selectFeature(feature) {
    let serviceLayer = this.get('serviceLayer');
    if (!Ember.isNone(feature)) {
      serviceLayer.addLayer(feature.leafletLayer);
    }
  },

  /**
    Observer for passed results
    @method _resultObserver
   */
  _resultObserver: Ember.observer('results', function () {
    this.send('selectFeature', null);
    this.set('_hasError', false);
    this.set('_noData', false);
    this.set('_displayResults', null);

    // если это не поиск, а очистка результатов
    if (!this.get('results')) {
      return;
    }

    this.set('_showLoader', true);
    let results = this.get('results') || [];

    let displayResults = Ember.A();
    results.forEach((result) => {
      let r = {
        name: Ember.get(result, 'layerModel.name') ? Ember.get(result, 'layerModel.name') : '',
        settings: Ember.get(result, 'layerModel.settingsAsObject.searchSettings.featuresPropertiesSettings'),
        sortField: Ember.get(result, 'layerModel.settingsAsObject.searchSettings.featuresPropertiesSettings.displayProperty')
      };

      result.features.then(
        (features) => {
          if (features.length > 0) {
            r.features = features;
            displayResults.pushObject(r);
          }
        }
      );
    });

    let promises = results.map((result) => {
      return result.features;
    });
    Ember.RSVP.allSettled(promises).finally(() => {
      let order = 1;
      displayResults.forEach((result) => {
        result.order = order;
        result.first = result.order === 1;
        result.last = result.order === displayResults.length;
        order += 1;

        if (!Ember.isNone(result.sortField) && result.sortField) {
          var sort = 'properties.' + result.sortField;
          result.features = result.features.sort(function (a, b) {
            if (Ember.get(a, sort) > Ember.get(b, sort)) {
              return 1;
            }

            if (Ember.get(a, sort) < Ember.get(b, sort)) {
              return -1;
            }

            return 0;
          });
        }
      });

      this.set('_displayResults', displayResults);
      this.set('_noData', displayResults.length === 0);
      this.set('_showLoader', false);
    });
  })
});
