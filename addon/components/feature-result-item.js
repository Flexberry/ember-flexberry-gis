/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/feature-result-item';
import { translationMacro as t } from 'ember-i18n';
import openCloseSubmenu from 'ember-flexberry-gis/utils/open-close-sub-menu';
import { zoomToBounds } from '../utils/zoom-to-bounds';
import ResultFeatureInitializer from '../mixins/result-feature-initializer';
/**
  Component for display GeoJSON feature object details

  @class FeatureResultItemComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
 */
export default Ember.Component.extend(ResultFeatureInitializer, {

  /**
    Service for managing map API.
    @property mapApi
    @type MapApiService
  */
  mapApi: Ember.inject.service(),

  /**
    Flag indicates whether to show all coordinates.
    @property mapApi
    @type MapApiService
  */
  showAllCords: false,

  /**
    Loader
    @property _showLoader
    @type boolean
  */
  _showLoader: false,

  /**
    Map command's caption.
    @property caption
    @type String
    @default t('components.flexberry-layers-intersections-panel.show-cords')
  */
  cordsActionCaption: t('components.flexberry-layers-intersections-panel.show-cords'),

  /**
    Component's wrapping <div> CSS-classes names.

    Any other CSS-class names can be added through component's 'class' property.
    ```handlebars
    {{feature-result-item class="my-class"}}
    ```

    @property classNames
    @type String[]
    @default ['item', 'feature-result-item']
  */
  classNames: ['item', 'feature-result-item'],

  /**
    Components class names bindings.

    @property classNameBindings
    @type String[]
    @default ['isActive:active']
  */
  classNameBindings: ['isActive:active', 'featureIsHL:highlight'],

  featureIsHL: Ember.computed('highlightable', 'feature.highlight', function () {
    return this.get('feature.highlight') && this.get('highlightable');
  }),

  /**
    Flag indicates if intersection panel is active.

    @property intersection
    @type Boolean
    @default false
  */
  intersection: false,

  /**
    Flag indicates if feature is in favorire list.

    @property favoriteMode
    @type Boolean
    @default false
  */
  favoriteMode: false,

  /**
    Flag indicates if user can add feature to favourite

    @property allowFavorite
    @type Boolean
    @default false
  */
  allowFavorite: false,

  /**
    Flag: indicates whether to display detailed feature info.

    @property infoExpanded
    @type boolean
    @default false
   */
  infoExpanded: false,

  /**
    Flag: indicates whether to display links list (if present).

    @property _linksExpanded
    @type boolean
    @default false
   */
  _linksExpanded: false,

  /**
    Property to represent feature.

    @property displayProperty
    @type string
    @private
   */
  displayProperty: null,

  /**
    Feature properties excluded from being displayed in info table.

    @property _excludedProperties
    @type String[]
    @readOnly
    @private
   */
  _excludedProperties: Ember.computed('displaySettings', function () {
    return this.get('displaySettings.excludedProperties');
  }),

  /**
    Features localized properties to being displayed in info table.

    @property _localizedProperties
    @type Object
    @readOnly
    @private
  */
  _localizedProperties: Ember.computed('displaySettings', 'i18n.locale', function () {
    let currentLocale = this.get('i18n.locale');
    let localizedProperties = this.get(`displaySettings.localizedProperties.${currentLocale}`) || {};
    return localizedProperties;
  }),

  /**
    Flag: indicates whether component is active.

    @property isActive
    @type boolean
    @readonly
   */
  isActive: Ember.computed('selectedFeature', 'feature', function () {
    return this.get('selectedFeature') === this.get('feature');
  }),

  /**
    flag to enable scrolling of the list of results

    @property activeScroll
    @type Boolean
    @default false
  */
  activeScroll: false,

  /**
    Observes and handles changes in feature.highlight state
    Changes the border style of feature on the map

    @method highlightObserver
    @private
  */
  highlightObserver: Ember.observer('feature.highlight', function () {
    if (this.feature.highlight) {
      this.feature.leafletLayer.setStyle({
        color: '#3388FF',
        fillColor: 'salmon'
      });
    } else {
      this.feature.leafletLayer.setStyle(this.get('defaultFeatureStyle'));
    }
  }),

  /**
    Reference to component's template.
  */
  layout,

  /**
   Settings for display feature info.

   @property displaySettings
   @type object
   @default null
  */
  displaySettings: null,

  /**
   Search and identification results object
   @property resultObject
   @type Object
   @default null
  */
  resultObject: null,

  /**
   Setting indicating whether an component can be highlighted in layer-result-list (Only for upper layer features)

   @property highlightable
   @type bool
   @default false
  */
  highlightable: false,

  /**
   Default feature.leaflet.style settings. (Uses for restore state after click events)

   @property defaultFeatureStyle
   @type Object
   @default null
  */
  defaultFeatureStyle: null,

  /**
    Feature's metadata.

    @property feature
    @type GeoJSON feature object
  */
  feature: null,

  /**
    Current selected feature.

    @property feature
    @type GeoJSON feature object
  */
  selectedFeature: null,

  /**
    Action button hasEditForm display.

    @property hasEditForm
    @type boolean
    @default false
  */
  hasEditForm: false,

  /**
    Flag: indicates whether submenu is visible.

    @property isSubmenu
    @type boolean
    @default false
  */
  isSubmenu: false,

  /**
    Initializes DOM-related component's properties.
  */
  didInsertElement() {
    this._super(...arguments);
    const hasEditFormFunc = this.get('mapApi').getFromApi('hasEditForm');
    this.prepareFeatureForHighlighting(this.get('highlightable'));

    if (typeof hasEditFormFunc === 'function') {
      const layerId = this.get('feature.layerModel.id');

      let shapeId;
      const getLayerFeatureIdFunc = this.get('mapApi').getFromApi('getLayerFeatureId');
      if (typeof getLayerFeatureIdFunc === 'function') {
        const layer = this.get('feature.layerModel');
        const shape = this.get('feature');

        //Need to implement id definition function
        shapeId = getLayerFeatureIdFunc(layer, shape.leafletLayer);
      } else {
        shapeId = this.get('feature.id');
      }

      const hasEditForm = hasEditFormFunc(layerId, shapeId);
      this.set('featureId', shapeId);
      this.set('hasEditForm', hasEditForm);
    }

    let _this = this;
    let $caption = this.$('.feature-result-item-caption');
    if ($caption.length > 0) {
      $caption.hover(
        function () {
          let $toolbar = _this.$(this).parent().children('.feature-result-item-toolbar');
          $toolbar.removeClass('hidden');
          _this.$(this).addClass('blur');
        },
        function () {
          let $toolbar = _this.$(this).parent().children('.feature-result-item-toolbar');
          $toolbar.hover(
            () => { },
            () => {
              $toolbar.addClass('hidden');
              _this.$(this).removeClass('blur');
              _this.set('isSubmenu', false);
            });
        }
      );
    }
  },

  willDestroyElement() {
    this._super(...arguments);
    let leafletMap = this.get('mapApi').getFromApi('leafletMap');
    leafletMap.off('flexberry-map:edit-feature:end', this._updateFeatureResultItem, this);
    leafletMap.off('flexberry-map:edit-feature:fail', this._updateFeatureResultItem, this);
  },

  /**
    Preparation feature for highlighting.

    @method prepareFeatureForHighlighting
  */
  prepareFeatureForHighlighting(highlightable) {
    let feature = this.get('feature');
    if (!highlightable || !feature) {
      return;
    }

    let leafletMap = this.get('mapApi').getFromApi('leafletMap');
    leafletMap.on('flexberry-map:edit-feature:end', this._updateFeatureResultItem, this);
    leafletMap.on('flexberry-map:edit-feature:fail', this._updateFeatureResultItem, this);
    this.set('defaultFeatureStyle', Object.assign({}, feature.leafletLayer.options));

    if (feature.geometry && feature.geometry.type &&
      (feature.geometry.type === 'Point' || feature.geometry.type === 'MultiPoint' ||
        feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString')) {
      let layerTolerance = feature.layerModel.get('_leafletObject.options.renderer.options.tolerance');
      if (Ember.isPresent(layerTolerance) && layerTolerance === 0) {
        Ember.set(feature.layerModel.get('_leafletObject.options.renderer.options'), 'tolerance', 3);
      }
    }

    L.DomEvent.on(feature.leafletLayer, 'click', (e) => {
      this.send('highlightFeature', feature);
      e.originalEvent.stopPropagation();
    });
  },

  /**
    Collecting settings for executing a zoomToBounds function

    @method getLayerPropsForZoom
  */
  getLayerPropsForZoom() {
    let leafletMap = this.get('mapApi').getFromApi('leafletMap');
    let bounds;
    let feature = this.get('feature');

    if (feature.leafletLayer instanceof L.Marker) {
      let featureGroup = L.featureGroup().addLayer(feature.leafletLayer);
      bounds = featureGroup.getBounds();
    } else {
      bounds = feature.leafletLayer.getBounds();
    }

    let minZoom = Ember.get(feature.leafletLayer, 'minZoom');
    let maxZoom = Ember.get(feature.leafletLayer, 'maxZoom');
    return { bounds, leafletMap, minZoom, maxZoom };
  },

  didRender() {
    this._super(...arguments);
    if (this.get('activeScroll')) {
      let layerResultList = this.$(this.element).closest('.layer-result-list')[0]; // scroll element
      let group = this.$(this.element).closest('.feature-result-item-group')[0]; // parent of highlighted element
      layerResultList.scrollTo({
        top: group.offsetTop + this.$(this.element)[0].offsetTop - layerResultList.offsetTop,
        left: 0,
        behavior: 'smooth'
      });
    }

    this.set('activeScroll', false);
  },

  actions: {
    /**
      Highlight feature-result-items

      @method actions.highlightFeature
      @param {Object} clickedFeature feature for which the "highlight" state changes
      @param {Boolean} activeScroll flag to enable scrolling of the list of results
    */
    highlightFeature(clickedFeature, activeScroll = true) {
      if (!activeScroll) {
        this.sendAction('clearHighlights', this.get('feature'));
        Ember.set(clickedFeature, 'highlight', true);
        return;
      }

      // The layer-result-list component has a zoomToAll option
      // that causes the feature.highlight state to change, which is not correct.
      let selectedAllFeaturesInResult = !this.get('resultObject.features').find(e => e.highlight === false) &&
        this.get('resultObject.features.length') > 1 ? true : false;

      // We can turn off the highlight if there was only one previous highlighted element
      Ember.set(clickedFeature, 'highlight', selectedAllFeaturesInResult ? true : !clickedFeature.highlight);
      this.sendAction('clearHighlights', clickedFeature); // clear other highlight states of feature-result-items in _displayResults.
      Ember.set(this.get('resultObject'), 'expanded', true);
      if (clickedFeature.highlight) {
        this.set('activeScroll', true);
        if (!this.get('infoExpanded')) { // open feature-result-item properties
          this.set('infoExpanded', true);
          this.set('_linksExpanded', true);
        }
      }
    },
    /**
      Show\hide submenu

      @method actions.onSubmenu
    */
    onSubmenu() {
      let component = this.get('element');
      let moreButton = component.getElementsByClassName('icon item more');
      let elements = component.getElementsByClassName('more submenu hidden');
      openCloseSubmenu(this, moreButton, elements, 4, 0);
    },

    /**
      Performs row editing.

      @method actions.onRowEdit
    */
    onRowEdit() {
      let feature = this.get('feature');
      let layerModel = feature.layerModel;
      let getAttributesOptions = Ember.get(layerModel, '_attributesOptions');

      if (Ember.isNone(getAttributesOptions)) {
        return;
      }

      let mapModelApi = this.get('mapApi').getFromApi('mapModel');
      let id = mapModelApi._getLayerFeatureId(layerModel, feature.leafletLayer);

      this.set('_showLoader', true);

      getAttributesOptions().then(({ object, settings }) => {
        let name = Ember.get(layerModel, 'name');

        // редактируемый объект должен быть загружен
        object.statusLoadLayer = true;

        let { bounds, leafletMap, minZoom, maxZoom } = this.getLayerPropsForZoom();
        zoomToBounds(bounds, leafletMap, minZoom, maxZoom);
        if (Ember.isNone(object.promiseLoadLayer) || !(object.promiseLoadLayer instanceof Ember.RSVP.Promise)) {
          object.promiseLoadLayer = Ember.RSVP.resolve();
        }

        object.promiseLoadLayer.then(() => {
          object.statusLoadLayer = false;
          object.promiseLoadLayer = null;

          this.set('_showLoader', false);

          let layers = object._layers;
          let layerObject = Object.values(layers).find(layer => {
            return mapModelApi._getLayerFeatureId(layerModel, layer) === id;
          });

          if (!layerObject) {
            console.error('Object not found');
            return;
          }

          let editedProperty = layerObject.feature.properties;

          let dataItems = {
            mode: 'Edit',
            items: [{
              data: Object.assign({}, editedProperty),
              initialData: editedProperty,
              layer: layerObject,
            }]
          };

          leafletMap.removeLayer(feature.leafletLayer);
          this.sendAction('editFeature', {
            isFavorite: feature.properties.isFavorite,
            dataItems: dataItems,
            layerModel: { name: name, leafletObject: object, settings, layerModel }
          });
        });
      });
    },

    /**
      Handles click on show/hide all intersection coordinates.
      @method actions.toggleShowAllCords
    */
    toggleShowAllCords() {
      if (this.get('showAllCords')) {
        this.toggleProperty('showAllCords');
        this.set('cordsActionCaption', t('components.flexberry-layers-intersections-panel.show-cords'));
      } else {
        this.toggleProperty('showAllCords');
        this.set('cordsActionCaption', t('components.flexberry-layers-intersections-panel.hide-cords'));
      }
    },

    /**
      Invokes {{#crossLink "FeatureResultItemComponent/sendingActions.selectFeature:method"}}'selectFeature' action{{/crossLink}}.
      @method actions.selectFeature
    */
    selectFeature() {
      this.sendAction('selectFeature', this.get('feature'));
    },

    /**
      Invokes {{#crossLink "FeatureResultItemComponent/sendingActions.panTo:method"}}'panTo' action{{/crossLink}}.
      @method actions.panTo
     */
    panTo() {
      if (this.get('highlightable')) {
        this.send('highlightFeature', this.get('feature'), false);
      }

      this.sendAction('panTo', this.get('feature'));
    },

    /**
      Invokes {{#crossLink "FeatureResultItemComponent/sendingActions.zoomTo:method"}}'zoomTo' action{{/crossLink}}.
      @method actions.zoomTo
     */
    zoomTo() {
      if (this.get('highlightable')) {
        this.send('highlightFeature', this.get('feature'), false);
        let { bounds, leafletMap, minZoom, maxZoom } = this.getLayerPropsForZoom();
        zoomToBounds(bounds, leafletMap, minZoom, maxZoom);
      } else {
        this.sendAction('zoomTo', this.get('feature'));
      }
    },

    /**
      Show\hide detailed feature info
      @method actions.showInfo
     */
    showInfo() {
      this.set('infoExpanded', !this.get('infoExpanded'));
      this.set('_linksExpanded', false);
    },

    /**
      Show\hide links list (if present).
      @method actions.toggleLinks
     */
    toggleLinks() {
      this.set('_linksExpanded', !this.get('_linksExpanded'));
    },

    /**
      Process the specified method.
      @method actions.goToEditForm
      @param {String} layerId Id layer
      @param {String[]} objectId Array Id object
    */
    goToEditForm(layerId, objectId) {
      const goToEditFormFunc = this.get('mapApi').getFromApi('goToEditForm');
      if (typeof goToEditFormFunc === 'function') {
        goToEditFormFunc(layerId, objectId);
      }
    },

    /**
      Show\hide panel for seraching intersections.
      Action is sended to layer-result-list.
      @method actions.findIntersection
    */
    findIntersection() {
      this.set('isSubmenu', false);
      this.sendAction('findIntersection', this.get('feature'));
    },

    /**
     * Action for search satellites
     * @method actions.findIntersection
     */
    searchSatellites() {
      this.set('isSubmenu', false);
      this.sendAction('searchSatellites', this.get('feature'));
    },

    /**
      Add feature to favorites list
      Action is sended to layer-result-list.
      @method actions.addToFavorite
    */
    addToFavorite() {
      this.sendAction('addToFavorite', this.get('feature'));
    },

    /**
      Handles click on checkbox.
      Action is sended to layer-result-list.
      @method actions.addToCompareGeometries
    */
    addToCompareGeometries() {
      this.sendAction('addToCompareGeometries', this.get('feature'));
    },

    /**
      Pans and zooms to intersection object.
      @method actions.panToIntersection
     */
    panToIntersection() {
      this.sendAction('zoomTo', this.get('feature'));
      this.sendAction('panTo', this.get('feature'));
    },

    /**
      Zooms to intersection and add intersection object on map.
      @method actions.zoomToIntersection
      */
    zoomToIntersection() {
      this.sendAction('zoomTo', this.get('feature'));
      this.sendAction('zoomToIntersection', this.get('feature'));
    },

  },

  /**
   * This method update feature result item when feature is edited
   * @param {Object} editedLayer This parameter contains layer (object) which the was edited.
   */
  _updateFeatureResultItem(editedLayer) {
    let editedLayerId = null;
    let editedFeature = null;
    let editedFeatureId = null;

    if (editedLayer && editedLayer.layers) {
      editedLayerId = editedLayer.layerModel.layerModel.id;
      editedFeature = editedLayer.layers[0];
      editedFeatureId = editedFeature.feature.id;
    }

    let feature = this.get('feature');
    let leafletMap = this.get('mapApi').getFromApi('leafletMap');
    let resultObject = this.get('resultObject'); // parent result object from layer-result-list

    if (editedLayer && editedLayerId ===  resultObject.layerModel.id && editedFeature && editedFeatureId === feature.id) {
      // on successfull edit
      Object.keys(editedFeature.feature.properties).forEach(attribute => {
        if (attribute === 'primarykey') {
          return;
        }

        Ember.set(feature.properties, attribute, editedFeature.feature.properties[attribute]);
      });
      Ember.set(feature, 'displayValue', this.getFeatureDisplayProperty(feature,
                                                                        resultObject.settings,
                                                                        resultObject.dateFormat,
                                                                        resultObject.dateTimeFormat,
                                                                        resultObject.layerModel));
      feature.leafletLayer.setLatLngs(editedFeature.getLatLngs()); // Update feature geometry
      this.rerender(); // force component re-render to recalculate #each-in helper
    }

    if (!leafletMap.hasLayer(feature.leafletLayer)) {
      leafletMap.addLayer(feature.leafletLayer); // return back featureLayer with identification/search results
    }
  },

  /**
    Component's action invoking for select feature
    @method sendingActions.selectFeature
    @param {GeoJSON object} feature Feature for select
   */

  /**
    Component's action invoking for feature zooming
    @method sendingActions.zoomTo
    @param {GeoJSON object} feature Feature for select
   */

  /**
    Component's action invoking for feature pan
    @method sendingActions.panTo
    @param {GeoJSON object} feature Feature for select
   */

});
