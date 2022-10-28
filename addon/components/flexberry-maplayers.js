/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import FlexberryTreenodeComponent from 'ember-flexberry/components/flexberry-treenode';
import generateUniqueId from 'ember-flexberry-data/utils/generate-unique-id';
import SlotsMixin from 'ember-block-slots';
import RequiredActionsMixin from 'ember-flexberry/mixins/required-actions';
import DomActionsMixin from 'ember-flexberry/mixins/dom-actions';
import DynamicActionsMixin from 'ember-flexberry/mixins/dynamic-actions';
import DynamicPropertiesMixin from '../mixins/dynamic-properties';
import layout from '../templates/components/flexberry-maplayers';
import { translationMacro as t } from 'ember-i18n';
import CompareLayersMixin from '../mixins/compare-layers';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's hbs-markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-maplayers').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-maplayers').
  @property {String} flexberryClassNames.wrapper Component's placeholder CSS-class name ('flexberry-maplayers-add-button').
  @readonly
  @static

  @for FlexberryMaplayersComponent
*/
const flexberryClassNamesPrefix = 'flexberry-maplayers';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix,
  addButton: flexberryClassNamesPrefix + '-add-button'
};

/**
  Flexberry layers tree component.
  Component must be used in combination with
  {{#crossLink "FlexberryMaplayerComponent"}}flexberry-maplayer component{{/crossLink}},
  because it's only a wrapper for those layers, which are placed on the same tree level.

  Usage with layers explicitly defined in hbs-markup:
  templates/my-form.hbs
  ```handlebars
  {{#flexberry-maplayers}}
    {{#flexberry-maplayer
      name=hbsTreeNodes.0.name
      type=hbsTreeNodes.0.type
      visibility=hbsTreeNodes.0.visibility
      headerClick=(action "onMapLayerHeaderClick" "hbsTreeNodes.0")
      visibilityChange=(action "onMaplayerVisibilityChange" "hbsTreeNodes.0.visibility")
    }}
      {{#flexberry-maplayers}}
        {{#flexberry-maplayer
          name=hbsTreeNodes.0.layers.0.name
          type=hbsTreeNodes.0.layers.0.type
          visibility=hbsTreeNodes.0.layers.0.visibility
          headerClick=(action "onMapLayerHeaderClick" "hbsTreeNodes.0.layers.0")
          visibilityChange=(action "onMaplayerVisibilityChange" "hbsTreeNodes.0.layers.0.visibility")
        }}
          {{#flexberry-maplayers}}
            {{flexberry-maplayer
              name=hbsTreeNodes.0.layers.0.layers.0.name
              type=hbsTreeNodes.0.layers.0.layers.0.type
              visibility=hbsTreeNodes.0.layers.0.layers.0.visibility
              headerClick=(action "onMapLayerHeaderClick" "hbsTreeNodes.0.layers.0.layers.0")
              visibilityChange=(action "onMaplayerVisibilityChange" "hbsTreeNodes.0.layers.0.layers.0.visibility")
            }}
          {{/flexberry-maplayers}}
        {{/flexberry-maplayer}}
        {{flexberry-maplayer
          name=hbsTreeNodes.0.layers.1.name
          type=hbsTreeNodes.0.layers.1.type
          visibility=hbsTreeNodes.0.layers.1.visibility
          headerClick=(action "onMapLayerHeaderClick" "hbsTreeNodes.0.layers.1")
          visibilityChange=(action "onMaplayerVisibilityChange" "hbsTreeNodes.0.layers.1.visibility")
        }}
      {{/flexberry-maplayers}}
    {{/flexberry-maplayer}}
  {{/flexberry-maplayers}}
  ```

  Usage with layers defined as JSON-object:
  templates/my-form.hbs
  ```handlebars
  {{flexberry-maplayers
    layers=(get-with-dynamic-actions this "jsonLayers"
      hierarchyPropertyName="layers"
      dynamicActions=(array
        (hash
          on="visibilityChange"
          actionName="onMaplayerVisibilityChange"
          actionArguments=(array "{% propertyPath %}.visibility")
        )
        (hash
          on="headerClick"
          actionName="onMapLayerHeaderClick"
          actionArguments=(array "{% propertyPath %}")
        )
      )
    )
  }}
  ```

  @class FlexberryMaplayersComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses <a href="https://github.com/ciena-blueplanet/ember-block-slots#usage">SlotsMixin</a>
  @uses RequiredActionsMixin
  @uses DomActionsMixin
  @uses DynamicActionsMixin
  @uses DynamicPropertiesMixin
*/
let FlexberryMaplayersComponent = Ember.Component.extend(
  SlotsMixin,
  RequiredActionsMixin,
  DomActionsMixin,
  DynamicActionsMixin,
  DynamicPropertiesMixin,
  CompareLayersMixin, {

    /**
      Component's required actions names.
      For actions enumerated in this array an assertion exceptions will be thrown,
      if actions handlers are not defined for them.

      @property _requiredActions
      @type String[]
      @default ['add']
    */
    _requiredActionNames: ['add'],

    /**
      Flag: indicates whether map layers tree is placed on root level (hasn't parent layers).

      @property _isRoot
      @type Boolean
      @readonly
      @private
    */
    _isRoot: Ember.computed('parentViewExcludingSlots', function() {
      let parentView = this.get('parentViewExcludingSlots');

      return !(parentView instanceof FlexberryTreenodeComponent);
    }),

    /**
      Flag: indicates whether some {{#crossLink "FlexberryMaplayersComponent/layers:property"}}layers{{/crossLink}} are defined.

      @property _hasLayers
      @type boolean
      @readOnly
      @private
    */
    _hasLayers: Ember.computed('layers.[]', 'layers.@each.isDeleted', function() {
      let layers = this.get('layers');

      return Ember.isArray(layers) && layers.filter((layer) => {
        return !Ember.isNone(layer) && Ember.get(layer, 'isDeleted') !== true;
      }).length > 0;
    }),

    /**
      Flag: indicates whether some nested content for header is defined
      (some yield markup for 'header').

      @property _hasHeader
      @type boolean
      @readOnly
      @private
    */
    _hasHeader: Ember.computed('_slots.[]', '_isRoot', 'readonly', 'showHeader', function() {
      // Yielded {{block-slot "header"}} is defined and current tree is root.
      return (this._isRegistered('header') || !this.get('readonly')) && this.get('_isRoot') && this.get('showHeader');
    }),

    /**
      Flag: indicates whether some nested content is defined
      (some yield markup or {{#crossLink "FlexberryMaplayersComponent/layers:property"}}'layers'{{/crossLink}} are defined).

      @property _hasContent
      @type boolean
      @readOnly
      @private
    */
    _hasContent: Ember.computed('_slots.[]', '_hasLayers', function() {
      // Yielded {{block-slot "content"}} is defined or 'nodes' are defined.
      return this._isRegistered('content') || this.get('_hasLayers');
    }),

    /**
      Flag: indicates whether some nested content for footer is defined
      (some yield markup for 'footer').

      @property _hasFooter
      @type boolean
      @readOnly
      @private
    */
    _hasFooter: Ember.computed('_slots.[]', '_isRoot', 'showFooter', function() {
      // Yielded {{block-slot "header"}} is defined and current tree is root.
      return this._isRegistered('footer') && this.get('_isRoot') && this.get('showFooter');
    }),

    /**
      Reference to 'store' service.

      @property store
      @type <a href="https://emberjs.com/api/ember-data/2.4/classes/DS.Store">DS.Store</a>
      @private
    */
    store: Ember.inject.service('store'),

    /**
      Flag: indicates whether add dialog has been already requested by user or not.

      @property _addDialogHasBeenRequested
      @type boolean
      @private
    */
    _addDialogHasBeenRequested: false,

    /**
      Flag: indicates whether add dialog is visible or not.

      @property _addDialogIsVisible
      @type boolean
      @private
    */
    _addDialogIsVisible: false,

    /**
      Layer model for 'add' dialog.

      @property _addDialogLayer
      @type NewPlatformFlexberryGISMapLayerModel
      @default null
    */
    _addDialogLayer: null,

    /**
      Reference to component's template.
    */
    layout,

    /**
      Reference to component's CSS-classes names.
      Must be also a component's instance property to be available from component's hbs-markup.
    */
    flexberryClassNames,

    /**
      Overridden ['tagName' property](http://emberjs.com/api/classes/Ember.Component.html#property_tagName).
      Is blank to disable component's wrapping <div>.

      @property tagName
      @type String
      @default ''
    */
    tagName: '',

    /**
      Component's CSS-classes names.

      Any other CSS-class names can be added through component's 'class' property.
      ```handlebars
      {{#flexberry-maplayers class="styled"}}
        Layers tree content
      {{/flexberry-maplayers}}
      ```

      @property class
      @type String
      @default ''
    */
    class: '',

    /**
      Component's placeholder.
      Will be displayed if nested layers are not defined.

      @property placeholder
      @type String
      @default t('components.flexberry-maplayers.placeholder')
    */
    placeholder: t('components.flexberry-maplayers.placeholder'),

    /**
      Flag: indicates whether only one layer node can be expanded at the same time.
      If true, all expanded layer nodes will be automatically collapsed, on some other node expand.

      @property exclusive
      @type Boolean
      @default false
    */
    exclusive: false,

    /**
      Flag: indicates whether it is allowed for already expanded layer nodes to collapse.

      @property collapsible
      @type Boolean
      @default true
    */
    collapsible: true,

    /**
      Flag: indicates whether nested layer nodes content opacity should be animated
      (if true, it may cause performance issues with many nested child nodes).

      @property animateChildren
      @type Boolean
      @default false
    */
    animateChildren: false,

    /**
      Layer nodes expand/collapse animation duration in milliseconds.

      @property animationDuration
      @type Number
      @default 350
    */
    duration: 350,

    /**
      Nested layers hierarchy.
      This property is optional and must be used when there are too many child layers,
      and you don't want to define them explicitly in the hbs-markup,
      then you can define layers array somewhere in code & pass defined array to this component's property.

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
      History enabled mode

      @default false
    */
    histEnabled: false,

    /**
      Flag: indicates whether layers tree is in readonly mode.
      If true, layers nodes data-related UI will be in readonly mode.

      @property readonly
      @type Boolean
      @default false
    */
    readonly: false,

    /**
      Flag: indicates whether "header" block-slot can be shown or not.

      @property showHeader
      @type Boolean
      @default true
    */
    showHeader: true,

    /**
      Flag: indicates whether "footer" block-slot can be shown or not.

      @property showFooter
      @type Boolean
      @default true
    */
    showFooter: true,

    /**
      Property contatining sideBySide component.

      @property sideBySide
      @type L.control.sideBySide
      @default null
    */
    sideBySide: null,

    /**
      Proprty containing layer on left side of sideBySide control.

      @property leftLayer
      @type String
      @default null
    */
    leftLayer: null,

    /**
      Proprty containing layer on right side of sideBySide control.

      @property rightLayer
      @type String
      @default null
    */
    rightLayer: null,

    /**
      Proprty containing current active layers.

      @property currentLayers
      @type Array
      @default []
    */
    currentLayers: [],

    /**
      Flag for checkAll visibility

      @property allLayerVisible
      @type Boolean
      @default false
    */
    allLayerVisible: false,

    /**
      Proprty containing raster layers to compare.

      @property rasterLayers
      @type Array
      @default []
    */
    rasterLayers: [],

    /**
     * Number of enabled layers on each side
     */
    compareLayersCount: Ember.computed('compare.side', 'compare.compareState.Left.layerIds.[]', 'compare.compareState.Right.layerIds.[]', function() {
      return this.get(`compare.compareState.${this.get('compare.side')}.layerIds`).length;
    }),

    /**
     * Array of background layers ids for tree filter
     */
    backgroundIds: Ember.computed('backgroundLayers', 'backgroundLayers.[]', function() {
      const backgroundLayers = this.get('backgroundLayers');
      return (backgroundLayers) ? this.get('backgroundLayers').map(l => l.get('id')) : [];
    }),

    /**
      Adds side by side control to map and removes current visible layers.

      @method onCompareLayersEnabled
    */
    onCompareLayersEnabled: Ember.observer('compare.compareLayersEnabled', 'ignoreCompareMode', function() {
      let map = this.get('leafletMap');
      let sbs = this.get('sideBySide');
      if (this.get('compare.compareLayersEnabled') && !this.get('ignoreCompareMode')) {
        let layers = this.get('layers');
        let layersArray = [];
        layers.forEach(layer => {
          if (layer.get('visibility')) {
            layersArray.push(layer);
          }

          layer.side = null;
          layer.set('visibility', false);
        });
        this.set('currentLayers', layersArray);
        if (this.get('selectedBaseLayer')) {
          this.setBgLayerBySide(this.get('selectedBaseLayer'), 'Left', map);
          this.setBgLayerBySide(this.get('selectedBaseLayer'), 'Right', map);
        }

        sbs.addTo(map);
      } else {
        this.destroyCompare(map);
        sbs.remove();

        let layersToAdd = this.get('currentLayers');
        let layers = this.get('layers');
        layers.forEach(layer => {
          const leafletLayer = layer.get('_leafletObject');
          if (leafletLayer && leafletLayer.getContainer && leafletLayer.getContainer()) {
            leafletLayer.getContainer().style.clip = '';
          }

          if (layer.get('settingsAsObject.labelSettings.signMapObjects')) {
            const labelsAdditionalOriginalLayer = layer.get('_leafletObject.additionalZoomLabel');
            if (labelsAdditionalOriginalLayer) {
              labelsAdditionalOriginalLayer.forEach(zoomLabels => {
                if (zoomLabels && zoomLabels.getContainer && zoomLabels.getContainer()) {
                  leafletLayer.getContainer().style.clip = '';
                }
              });
            }

            const labelsOriginalLayer = layer.get('_leafletObject._labelsLayer');
            if (labelsOriginalLayer && labelsOriginalLayer.getContainer && labelsOriginalLayer.getContainer()) {
              leafletLayer.getContainer().style.clip = '';
            }
          }
        });
        layersToAdd.forEach(layer => Ember.set(layer, 'visibility', true));
      }
    }),

    dynamicButtons: [],

    actions: {
      closeOtherCalendar(layerId) {
        this.sendAction('closeOtherCalendar', layerId);
      },

      external(actionName, layer) {
        this.sendAction(actionName, layer);
      },

      onAllLayerVisibilityChanged(e) {
        this.set('allLayerVisible', !this.get('allLayerVisible'));
        let visibility = this.get('allLayerVisible');
        let layers = this.get('layers');
        let setVisibility = function(layers) {
          layers.forEach(layer => {
            layer.set('visibility', visibility);
            if (layer.get('layers')) {
              setVisibility(layer.get('layers'));
            }
          });
        };

        setVisibility(layers);
      },

      onLayerTimeChanged(layer, time) {
        this.sendAction('layerTimeChanged', layer, time);
      },

      /**
        Handles add button's 'click' event.
        Invokes component's {{#crossLink "FlexberryMaplayersComponent/sendingActions.add:method"}}'add'{{/crossLink}} action.

        @method actions.onAddButtonClick
        @param {Object} e [jQuery event object](http://api.jquery.com/category/events/event-object/)
        which describes button's 'click' event.
      */
      onAddButtonClick(e) {
        // Create empty layer model.
        let store = this.get('store');
        let addDialogLayer = store.createRecord('new-platform-flexberry-g-i-s-map-layer', { id: generateUniqueId() });
        this.set('_addDialogLayer', addDialogLayer);

        // Include dialog to markup.
        this.set('_addDialogHasBeenRequested', true);

        // Show dialog.
        this.set('_addDialogIsVisible', true);
      },

      /**
        Handles add dialog's 'approve' action.
        Invokes component's {{#crossLink "FlexberryMaplayersComponent/sendingActions.add:method"}}'add'{{/crossLink}} action.

        @method actions.onAddDialogApprove
        @param {Object} e Action's event object.
        @param {Object} e.layerProperties Object containing properties of new child layer.
      */
      onAddDialogApprove(...args) {
        // Send outer 'add' action.
        this.sendAction('add', ...args);
      }
    },

    /**
      Component's action invoking when user wants to add child layer into layers tree root.

      @method sendingActions.add
      @param {Object} e Action's event object.
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes inner 'add' button's 'click' event.
    */
  }
);

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryMaplayersComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryMaplayersComponent;
