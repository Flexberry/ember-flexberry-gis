/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/feature-result-item';
import { translationMacro as t } from 'ember-i18n';

/**
  Component for display GeoJSON feature object details

  @class FeatureResultItemComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
 */
export default Ember.Component.extend({

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
  classNameBindings: ['isActive:active'],

  /**
    Flag indicates if intersection panel is active.

    @property intersection
    @type Boolean
    @default false
  */
  intersection: false,

  /**
    Flag indicates if feature is in favorire list.

    @property intersection
    @type Boolean
    @default false
  */
  favoriteMode: false,

  /**
    Flag: indicates whether to display detailed feature info.

    @property _infoExpanded
    @type boolean
    @default false
   */
  _infoExpanded: false,

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
    Flag: indicates whether to display detailed feature info.

    @property expanded
    @type boolean
    @readonly
   */
  expanded: Ember.computed('infoExpanded', '_infoExpanded', function () {
    return this.get('infoExpanded') || this.get('_infoExpanded');
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
    Initializes DOM-related component's properties.
  */
  didInsertElement() {
    this._super(...arguments);
    const hasEditFormFunc = this.get('mapApi').getFromApi('hasEditForm');

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
        function() {
          let $toolbar = _this.$(this).parent().children('.feature-result-item-toolbar');
          $toolbar.removeClass('hidden');
          _this.$(this).addClass('hidden');
        },
        function() {
          let $toolbar = _this.$(this).parent().children('.feature-result-item-toolbar');
          $toolbar.hover(
            () => {},
            () => {
              $toolbar.addClass('hidden');
              _this.$(this).removeClass('hidden');
            });
        }
      );
    }

    let $more = this.$('.icon.item.more');
    if ($more.length > 0) {
      $more.hover(
        function() {
          let $submenu = _this.$(this).parent().children('.more.submenu');
          $submenu.removeClass('hidden');
        },
        function() {
          let $submenu = _this.$(this).parent().children('.more.submenu');
          $submenu.hover(
            () => {},
            () => {
              $submenu.addClass('hidden');
            });
        }
      );
    }
  },

  actions: {
    /**
      Performs row editing.

      @method actions.onRowEdit
      @param {Object} tabModel Related tab.
      @param {Object} rowId Editing row identifier.
    */
    onRowEdit() {
      let feature = this.get('feature');
      let editedProperty = feature.properties;

      let dataItems = {
        mode: 'Edit',
        items: [{
          data: Object.assign({}, editedProperty),
          initialData: editedProperty,
          layer: feature.leafletLayer,
        }]
      };

      this.sendAction('editFeature', {
        dataItems: dataItems,
        layerModel: null
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
      this.sendAction('panTo', this.get('feature'));
    },

    /**
      Invokes {{#crossLink "FeatureResultItemComponent/sendingActions.zoomTo:method"}}'zoomTo' action{{/crossLink}}.
      @method actions.zoomTo
     */
    zoomTo() {
      this.sendAction('zoomTo', this.get('feature'));
    },

    /**
      Show\hide detailed feature info
      @method actions.showInfo
     */
    showInfo() {
      this.set('_infoExpanded', !this.get('_infoExpanded'));
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
      this.sendAction('findIntersection', this.get('feature'));
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
    }
  }

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
