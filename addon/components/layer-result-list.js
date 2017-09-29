/**
  @module ember-flexberry-gis
 */

import Ember from 'ember';
import layout from '../templates/components/layer-result-list';

// Url key used to identify transitions from ember-flexberry-gis on other resources.
const isMapLimitKey = 'GISLinked';

/**
  Component for display array of search\identify results

  @class LayerResultListComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
 */
export default Ember.Component.extend({

  /**
    Component's wrapping <div> CSS-classes names.

    Any other CSS-class names can be added through component's 'class' property.
    ```handlebars
    {{layer-result-list class="my-class"}}
    ```

    @property classNames
    @type String[]
    @default ['layer-result-list']
  */
  classNames: ['layer-result-list'],

  /**
    Reference to component's template.
  */
  layout,

  /**
    FeatureGroup to display layer from selectedFeature.

    @property serviceLayer
    @type L.FeatureGroup
    @default null
  */
  serviceLayer: null,

  /**
    Leaflet map object for zoom and pan.

    @property leafletMap
    @type L.Map
    @default null
  */
  leafletMap: null,

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
    Ready results for display without promise.

    @property _displayResults
    @type Ember.A()
    @default null
  */
  _displayResults: null,

  /**
    Flag: indicates when results contains no data.

    @property _noData
    @type boolean
    @default false
  */
  _noData: false,

  /**
    Flag: indicates when one or more results.features promises rejected.

    @property _hasError
    @type boolean
    @default false
  */
  _hasError: false,

  /**
    Current selected feature.

    @property _selectedFeature
    @type GeoJSON feature
    @default null
  */
  _selectedFeature: null,

  /**
    Flag: indicates whether to display links list (if present).

    @property _linksExpanded
    @type boolean
    @default false
   */
  _linksExpanded: false,

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
    },

    /**
      Show\hide links list (if present).
      @method actions.toggleLinks
     */
    toggleLinks() {
      this.set('_linksExpanded', !this.get('_linksExpanded'));
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

    let results = this.get('results') || Ember.A();

    // If results had been cleared.
    if (Ember.isBlank(results)) {
      return;
    }

    this.set('_showLoader', true);

    let displayResults = Ember.A();

    // Prepare results format for template.
    results.forEach((result) => {
      let r = {
        name: Ember.get(result, 'layerModel.name') || '',
        settings: Ember.get(result, 'layerModel.settingsAsObject.displaySettings.featuresPropertiesSettings'),
        displayProperties: Ember.get(result, 'layerModel.settingsAsObject.displaySettings.featuresPropertiesSettings.displayProperty'),
        listForms: Ember.A(),
        editForms: Ember.A(),
        features: Ember.A(),
        layerModel: Ember.get(result, 'layerModel')
      };

      let links = Ember.get(result, 'layerModel.layerLink');
      let layerLink = links.filter(link => link.get('allowShow') === true);

      layerLink.forEach((link) => {
        if (!Ember.isBlank(link)) {
          let mos = link.get('mapObjectSetting');
          if (!Ember.isBlank(mos)) {
            let editForm = mos.get('editForm');
            if (!Ember.isBlank(editForm)) {
              let linkParameters = link.get('parameters');

              linkParameters.forEach((param) => {
                if (!Ember.isBlank(param)) {
                  let queryKey = param.get('queryKey');

                  if (!Ember.isBlank(queryKey)) {
                    let listForm = mos.get('listForm');
                    if (!Ember.isBlank(listForm)) {
                      r.listForms.pushObject({
                        url: listForm,
                        typeName: mos.get('typeName'),
                        queryKey: queryKey
                      });
                    }

                    let layerField = param.get('layerField');
                    if (!Ember.isBlank(layerField)) {
                      r.editForms.pushObject({
                        url: editForm,
                        typeName: mos.get('typeName'),
                        queryKey: queryKey,
                        layerField: layerField
                      });
                    }
                  }
                }
              });
            }
          }
        }
      });

      result.features.then(
        (features) => {
          if (features.length > 0) {
            r.features = Ember.A(features);
            displayResults.pushObject(r);
          }
        }
      );
    });

    let getFeatureDisplayProperty = (feature, featuresPropertiesSettings) => {
      let displayPropertyIsCallback = Ember.get(featuresPropertiesSettings, 'displayPropertyIsCallback') === true;
      let displayProperty = Ember.get(featuresPropertiesSettings, 'displayProperty');

      if (!Ember.isArray(displayProperty) && !displayPropertyIsCallback) {
        return '';
      }

      if (Ember.typeOf(displayProperty) !== 'string' && displayPropertyIsCallback) {
        return '';
      }

      if (!displayPropertyIsCallback) {
        let featureProperties = Ember.get(feature, 'properties') || {};

        let displayValue = Ember.none;
        displayProperty.forEach((prop) => {
          if (featureProperties.hasOwnProperty(prop)) {
            let value = featureProperties[prop];
            if (Ember.isNone(displayValue) && !Ember.isNone(value) && !Ember.isEmpty(value) && value.toString().toLowerCase() !== 'null') {
              displayValue = value;
            }
          }
        });

        return displayValue || '';
      }

      let calculateDisplayProperty = eval(`(${displayProperty})`);
      Ember.assert(
        'Property \'settings.displaySettings.featuresPropertiesSettings.displayProperty\' ' +
        'is not a valid javascript function',
        Ember.typeOf(calculateDisplayProperty) === 'function');

      return calculateDisplayProperty(feature);
    };

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

        result.features = result.features.sort((a, b) => {
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

        if (!Ember.isBlank(result.features)) {
          let ownLayerField;
          let objectList = Ember.A();

          let editForms = result.editForms;
          let listForms = result.listForms;

          result.features.forEach((feature) => {
            feature.displayValue = getFeatureDisplayProperty(feature, result.settings);
            feature.layerModel = Ember.get(result, 'layerModel');
            feature.editForms = Ember.A();

            if (editForms.length === 0) {
              return;
            }

            editForms.forEach((editForm) => {
              let url = editForm.url;
              let layerField = editForm.layerField;
              let queryKey = editForm.queryKey;
              let typeName = editForm.typeName;

              if (Ember.isBlank(url) || Ember.isBlank(layerField) || Ember.isBlank(queryKey)) {
                return;
              }

              let properties = feature.properties;
              let queryValue;

              if (Ember.isBlank(ownLayerField)) {
                for (var p in properties) {
                  if (properties.hasOwnProperty(p) && layerField.toLowerCase() === (p + '').toLowerCase()) {
                    ownLayerField = p;
                    break;
                  }
                }
              }

              if (!Ember.isBlank(ownLayerField)) {
                queryValue = properties[ownLayerField];
              }

              if (Ember.isBlank(queryValue)) {
                return;
              }

              let params = {};
              Ember.set(params, queryKey, queryValue);
              Ember.set(params, isMapLimitKey, true);

              feature.editForms.pushObject({
                url: url + L.Util.getParamString(params, url),
                typeName: typeName
              });

              objectList.pushObject(queryValue);
            });
          });

          let forms = Ember.A();
          if (objectList.length === 0 || listForms.length === 0) {
            return;
          }

          listForms.forEach((listForm) => {
            let params = {};

            Ember.set(params, isMapLimitKey, true);
            Ember.set(params, listForm.queryKey, objectList.join(','));

            forms.pushObject({
              url: listForm.url + L.Util.getParamString(params, listForm.url),
              typeName: listForm.typeName
            });
          });

          result.listForms = forms;
        }
      });

      this.set('_displayResults', displayResults);
      this.set('_noData', displayResults.length === 0);
      this.set('_showLoader', false);

      if (displayResults.length === 1) {
        this.send('zoomTo', displayResults.objectAt(0).features);
      }
    });
  })
  /**
    Component's action invoking when feature item was selected.

    @method sendingActions.featureSelected
    @param {Object} feature Describes inner FeatureResultItem's feature object or array of it.
  */
});
