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


  /**
    Observer for passed results
    @method _resultObserver
   */
  _resultObserver: Ember.observer('results', function () {
    this.send('selectFeature', null);
    this.set('_hasError', false);
    this.set('_noData', false);
    this.set('_displayResults', null);

    // If results had been cleared.
    if (!this.get('results')) {
      return;
    }

    this.set('_showLoader', true);
    let results = this.get('results') || [];

    let displayResults = Ember.A();
    results.forEach((result) => {
      let r = {
        name: Ember.get(result, 'layerModel.name') ? Ember.get(result, 'layerModel.name') : '',
        settings: Ember.get(result, 'layerModel.settingsAsObject.displaySettings.featuresPropertiesSettings'),
        displayProperties: Ember.get(result, 'layerModel.settingsAsObject.displaySettings.featuresPropertiesSettings.displayProperty'),
        layerModel: Ember.get(result, 'layerModel')
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

    let getFeatureDisplayProperty = function (feature, featuresPropertiesSettings) {
      let displayPropertyIsCallback = Ember.get(featuresPropertiesSettings, 'displayPropertyIsCallback') === true;
      let displayProperty = Ember.get(featuresPropertiesSettings, 'displayProperty');

      if ((Ember.typeOf(displayProperty) !== 'array' && !displayPropertyIsCallback)) {
        return '';
      }

      if ((Ember.typeOf(displayProperty) !== 'string' && displayPropertyIsCallback)) {
        return '';
      }

      if (!displayPropertyIsCallback) {
        let featureProperties = Ember.get(feature, 'properties') || {};

        let displayValue = Ember.none;
        displayProperty.forEach((prop) => {
          if (featureProperties.hasOwnProperty(prop)) {
            let value = featureProperties[prop];
            if (Ember.isNone(displayValue) && !Ember.isNone(value) && !Ember.isEmpty(value) && value !== "Null") {
              displayValue = value;
            }
          }
        });

        return !Ember.isNone(displayValue) ? displayValue : '';
      }

      let calculateDisplayProperty = eval(`(${displayProperty})`);
      Ember.assert(
        'Property \'settings.displaySettings.featuresPropertiesSettings.displayProperty\' ' +
        'is not a valid java script function',
        Ember.typeOf(calculateDisplayProperty) === 'function');

      return calculateDisplayProperty(feature);
    };

    Ember.RSVP.allSettled(promises).finally(() => {
      let order = 1;
      displayResults.forEach((result) => {
        result.order = order;
        result.first = result.order === 1;
        result.last = result.order === displayResults.length;
        order += 1;

        result.features.forEach((feature) => {
          feature.displayValue = getFeatureDisplayProperty(feature, result.settings);
          feature.layerModel = Ember.get(result, 'layerModel');
        });

        result.features = result.features.sort(function (a, b) {
          // If displayValue is empty, it should be on the bottom.
          if (Ember.isBlank(a.displayValue)) {
            return 1;
          }

          if (Ember.isBlank(b.displayValue)) {
            return -1;
          }

          if (a.displayValue > b.displayValue) {
            return 1;
          }

          if (a.displayValue < b.displayValue) {
            return -1;
          }

          return 0;
        });
      });

      this.set('_displayResults', displayResults);
      this.set('_noData', displayResults.length === 0);
      this.set('_showLoader', false);

      if (displayResults.length === 1) {
        this.send('zoomTo', displayResults.objectAt(0).features);
      }
    });
  }),

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

      // Send action despite of the fact feature changed or not. User can disable layer anytime.
      this.sendAction('featureSelected', feature);
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
          // 'bound.pad(1)' bounds with zoom decreased by 1 point (padding).
          //  That allows to make map's bounds slightly larger than serviceLayer's bounds to make better UI.
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
  }

  /**
    Component's action invoking when feature item was selected.

    @method sendingActions.featureSelected
    @param {Object} feature Describes inner FeatureResultItem's feature object or array of it.
  */
});
