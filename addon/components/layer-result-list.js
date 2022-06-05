/**
  @module ember-flexberry-gis
 */

import { allSettled } from 'rsvp';

import { assert } from '@ember/debug';
import { A, isArray } from '@ember/array';
import { on } from '@ember/object/evented';
import {
  isBlank, isNone, isEmpty, typeOf
} from '@ember/utils';
import { get, observer, set } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

import Ember from 'ember';
import layout from '../templates/components/layer-result-list';
import LeafletZoomToFeatureMixin from '../mixins/leaflet-zoom-to-feature';

// Url key used to identify transitions from ember-flexberry-gis on other resources.
const isMapLimitKey = 'GISLinked';

/**
  Component for display array of search\identify results

  @class LayerResultListComponent
  @uses LeafletZoomToFeatureMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
 */
export default Component.extend(LeafletZoomToFeatureMixin, {

  /**
  Service for managing map API.
  @property mapApi
  @type MapApiService
  */
  mapApi: service(),

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
    Flag indicates if intersection panel is active.

    @property intersection
    @type Boolean
    @default false
  */
  intersection: false,

  /**
    Flag indicates if layer-result-list used with favorites list.

    @property favoriteMode
    @type Boolean
    @default false
  */
  favoriteMode: false,

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

  /**
    Action button hasListForm display.

    @property hasListForm
    @type boolean
    @default false
  */
  hasListForm: true,

  /**
    Visibility of the export dialog.

    @property exportDialogVisible
    @type boolean
    @default false
   */
  exportDialogVisible: false,

  /**
    Object to search

    @property exportResult
    @type Ember.A()
    @default null
  */
  exportResult: null,

  actions: {
    /**
      Show\hide links list (if present).
      @method actions.toggleLinks
    */
    toggleLinks() {
      this.set('_linksExpanded', !this.get('_linksExpanded'));
    },

    /**
      Process the specified method.
      @method actions.goToListForm
      @param {String} layerId Id layer
      @param {String[]} objectsIdArray Array of id objects
    */
    goToListForm(layerId, objectsIdArray) {
      const goToListFormFunc = this.get('mapApi').getFromApi('goToListForm');
      if (typeof goToListFormFunc === 'function') {
        goToListFormFunc(layerId, objectsIdArray);
      }
    },

    /**
      Action is sended to layer-result-list-action-handler.
      Action shows intersection panel.
      @method actions.findIntersection
      @param feature
    */
    findIntersection(feature) {
      this.sendAction('showIntersectionPanel', feature);
    },

    /**
      Action adds feature to favorites.

      @method actions.findIntersection
      @param feature
    */
    addToFavorite(feature) {
      this.sendAction('addToFavorite', feature);
    },

    /**
      Performs row editing.

      @method actions.editFeature
    */
    editFeature(e) {
      this.sendAction('editFeature', e);
    },

    /**
      Action adds feature to array for comparing geometries.

      @method actions.addToCompareGeometries
      @param feature
    */
    addToCompareGeometries(feature) {
      this.sendAction('addToCompareGeometries', feature);
    },

    /**
      Action zooms to intersection and shows object on map.

      @method actions.zoomToIntersection
      @param feature
    */
    zoomToIntersection(feature) {
      this.sendAction('zoomToIntersection', feature);
    },

    /**
     * Set the parameters of export and show the dialog.
     * @param {object} result Object to search.
     */
    upload(result) {
      this.set('exportResult', result);
      this.set('exportDialogVisible', true);
    },
  },

  didUpdate() {
    const _this = this;
    const $caption = this.$('.title .flexberry-toggler-caption');
    if ($caption.length > 0) {
      $caption.hover(
        function () {
          const $buttons = _this.$(this).parent().parent().parent()
            .children('.feature-result-item-buttons');
          $buttons.removeClass('hidden');
          _this.$(this).addClass('blur');
        },
        function () {
          const $buttons = _this.$(this).parent().parent().parent()
            .children('.feature-result-item-buttons');
          $buttons.hover(
            () => { },
            () => {
              $buttons.addClass('hidden');
              _this.$(this).removeClass('blur');
            }
          );
        }
      );
    }
  },

  /**
     Checks model layer links and adds list and edit forms to result object.

     @method _processLayerLinkForDisplayResults
     @param {Object} searchResults
     @param {Object} displayResult
     @private
   */
  _processLayerLinkForDisplayResults(searchResults, displayResult) {
    const links = get(searchResults, 'layerModel.layerLink');
    const layerLink = links.filter((link) => link.get('allowShow') === true);

    layerLink.forEach((link) => {
      if (!isBlank(link)) {
        const mos = link.get('mapObjectSetting');
        if (!isBlank(mos)) {
          const editForm = mos.get('editForm');
          if (!isBlank(editForm)) {
            const linkParameters = link.get('parameters');

            linkParameters.forEach((param) => {
              if (!isBlank(param)) {
                const queryKey = param.get('queryKey');

                if (!isBlank(queryKey)) {
                  const listForm = mos.get('listForm');
                  if (!isBlank(listForm)) {
                    displayResult.listForms.pushObject({
                      url: listForm,
                      typeName: mos.get('typeName'),
                      queryKey,
                    });
                  }

                  const layerField = param.get('layerField');
                  if (!isBlank(layerField)) {
                    displayResult.editForms.pushObject({
                      url: editForm,
                      typeName: mos.get('typeName'),
                      queryKey,
                      layerField,
                    });
                  }
                }
              }
            });
          }
        }
      }
    });
  },

  /**
    Observer for passed results
    @method _resultObserver
  */
  _resultObserver: on('init', observer('results', function () {
    this.set('_hasError', false);
    this.set('_noData', false);
    this.set('_displayResults', null);

    const results = this.get('results') || A();

    // If results had been cleared.
    if (isBlank(results)) {
      return;
    }

    this.set('_showLoader', true);

    let displayResults = A();

    // Prepare results format for template.
    results.forEach((result) => {
      if (isBlank(result.features)) {
        return;
      }

      result.features.then(
        (features) => {
          if (features.length > 0) {
            const intersectArray = features.filter((item) => {
              item.isIntersect = false;
              if (!isNone(item.intersection)) {
                item.isIntersect = true;
              }

              return !isNone(item.intersection);
            });

            let isIntersect = false;
            if (!isEmpty(intersectArray)) {
              isIntersect = true;
            }

            const hasListFormFunc = this.get('mapApi').getFromApi('hasListForm');
            const layerModel = get(result, 'layerModel');
            let hasListForm;
            if (typeof hasListFormFunc === 'function') {
              hasListForm = hasListFormFunc(layerModel.id);
            }

            let layerIds = A();
            if (hasListForm) {
              layerIds = A(features).map((feature) => {
                const getLayerFeatureIdFunc = this.get('mapApi').getFromApi('getLayerFeatureId');
                if (typeof getLayerFeatureIdFunc === 'function') {
                  return getLayerFeatureIdFunc(layerModel, feature.leafletLayer);
                }

                return get(feature, 'id');
              });
            }

            const displayResult = {
              name: get(layerModel, 'name') || '',
              settings: get(layerModel, 'settingsAsObject.displaySettings.featuresPropertiesSettings'),
              displayProperties: get(layerModel, 'settingsAsObject.displaySettings.featuresPropertiesSettings.displayProperty'),
              listForms: A(),
              editForms: A(),
              features: A(features),
              layerModel,
              hasListForm,
              layerIds,
              dateFormat: get(layerModel, 'settingsAsObject.displaySettings.dateFormat'),
              isIntersect,
            };

            this._processLayerLinkForDisplayResults(result, displayResult);
            displayResults.pushObject(displayResult);
          }
        }
      );
    });
    const getFeatureDisplayProperty = (feature, featuresPropertiesSettings, dateFormat) => {
      const displayPropertyIsCallback = get(featuresPropertiesSettings, 'displayPropertyIsCallback') === true;
      const displayProperty = get(featuresPropertiesSettings, 'displayProperty');

      if (!isArray(displayProperty) && !displayPropertyIsCallback) {
        return '';
      }

      if (typeOf(displayProperty) !== 'string' && displayPropertyIsCallback) {
        return '';
      }

      if (!displayPropertyIsCallback) {
        const featureProperties = get(feature, 'properties') || {};

        featureProperties.forEach((prop) => {
          const value = featureProperties[prop];
          if (value instanceof Date && !isNone(value) && !isEmpty(value) && !isEmpty(dateFormat)) {
            featureProperties[prop] = moment(value).format(dateFormat);
          }
        });

        let displayValue = Ember.none;
        displayProperty.forEach((prop) => {
          if (Object.prototype.hasOwnProperty.call(featureProperties, prop)) {
            const value = featureProperties[prop];
            if (isNone(displayValue) && !isNone(value) && !isEmpty(value) && value.toString().toLowerCase() !== 'null') {
              displayValue = value;
            }
          }
        });

        return displayValue || '';
      }

      const calculateDisplayProperty = eval(`(${displayProperty})`);
      assert(
        'Property \'settings.displaySettings.featuresPropertiesSettings.displayProperty\' '
        + 'is not a valid javascript function',
        typeOf(calculateDisplayProperty) === 'function'
      );

      return calculateDisplayProperty(feature);
    };

    const promises = results.map((result) => result.features);

    allSettled(promises).finally(() => {
      let order = 1;
      displayResults.forEach((result) => {
        result.order = order;
        result.first = result.order === 1;
        result.last = result.order === displayResults.length;
        order += 1;

        result.features = result.features.sort((a, b) => {
          // If displayValue is empty, it should be on the bottom.
          if (isBlank(a.displayValue)) {
            return 1;
          }

          if (isBlank(b.displayValue)) {
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

        if (!isBlank(result.features)) {
          let ownLayerField;
          const objectList = A();

          const { editForms, } = result;
          const { listForms, } = result;

          result.features.forEach((feature) => {
            set(feature, 'displayValue', getFeatureDisplayProperty(feature, result.settings, result.dateFormat));
            set(feature, 'layerModel', get(result, 'layerModel'));
            set(feature, 'editForms', A());
            if (editForms.length === 0) {
              return;
            }

            editForms.forEach((editForm) => {
              const { url, } = editForm;
              const { layerField, } = editForm;
              const { queryKey, } = editForm;
              const { typeName, } = editForm;

              if (isBlank(url) || isBlank(layerField) || isBlank(queryKey)) {
                return;
              }

              const { properties, } = feature;
              let queryValue;

              if (isBlank(ownLayerField)) {
                properties.forEach((p) => {
                  if (Object.prototype.hasOwnProperty.call(properties, p) && layerField.toLowerCase() === (`${p}`).toLowerCase()) {
                    if (isBlank(ownLayerField)) {
                      ownLayerField = p;
                    }
                  }
                });
              }

              if (!isBlank(ownLayerField)) {
                queryValue = properties[ownLayerField];
              }

              if (isBlank(queryValue)) {
                return;
              }

              const params = {};
              set(params, queryKey, queryValue);
              set(params, isMapLimitKey, true);

              feature.editForms.pushObject({
                url: url + L.Util.getParamString(params, url),
                typeName,
              });

              objectList.pushObject(queryValue);
            });
          });

          const shapeIds = this._getFeatureShapeIds(result.features);
          set(result, 'shapeIds', shapeIds);

          const forms = A();
          if (objectList.length === 0 || listForms.length === 0) {
            return;
          }

          listForms.forEach((listForm) => {
            const params = {};

            set(params, isMapLimitKey, true);
            set(params, listForm.queryKey, objectList.join(','));

            forms.pushObject({
              url: listForm.url + L.Util.getParamString(params, listForm.url),
              typeName: listForm.typeName,
            });
          });

          result.listForms = forms;
        }
      });

      displayResults = displayResults.sort((a, b) => {
        // If displayValue is empty, it should be on the bottom.
        if (!a.name) {
          return 1;
        }

        if (!b.name) {
          return -1;
        }

        if (a.name > b.name) {
          return 1;
        }

        if (a.name < b.name) {
          return -1;
        }

        return 0;
      });

      this.set('_displayResults', displayResults);
      this.set('_noData', displayResults.length === 0);
      this.set('_showLoader', false);
      if (this.get('favoriteMode') !== true && Ember.isNone(this.get('share'))) {
        if (displayResults.length === 1) {
          this.send('zoomTo', displayResults.objectAt(0).features);
        }
      } else if (!Ember.isNone(this.get('share'))) {
        if (displayResults.length === 1) {
          this.send('selectFeature', displayResults.objectAt(0).features);
        }
      }
    });
  })),

  /**
    Get an array of layer shapes id.
    @method _getFeatureShapeIds
    @param {Object} features Layer object
    @return {String[]} Array of layer shapes id
  */
  _getFeatureShapeIds(features) {
    const shapeIds = [];
    features.forEach((feature) => {
      let shapeId;
      const getLayerFeatureIdFunc = this.get('mapApi').getFromApi('getLayerFeatureId');
      if (typeof getLayerFeatureIdFunc === 'function') {
        // Need to implement id definition function
        shapeId = getLayerFeatureIdFunc(feature.layerModel, feature.leafletLayer);
      } else {
        shapeId = feature.id;
      }

      shapeIds.push(shapeId);
    });
    return shapeIds;
  },
});
