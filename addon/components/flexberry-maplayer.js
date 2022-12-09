/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import FlexberryTreenodeComponent from 'ember-flexberry/components/flexberry-treenode';

import SlotsMixin from 'ember-block-slots';
import RequiredActionsMixin from 'ember-flexberry/mixins/required-actions';
import DomActionsMixin from 'ember-flexberry/mixins/dom-actions';
import DynamicActionsMixin from 'ember-flexberry/mixins/dynamic-actions';
import DynamicPropertiesMixin from '../mixins/dynamic-properties';
import { copyLayer } from '../utils/copy-layer';
import generateUniqueId from 'ember-flexberry-data/utils/generate-unique-id';

import openCloseSubmenu from 'ember-flexberry-gis/utils/open-close-sub-menu';
import layout from '../templates/components/flexberry-maplayer';
import {
  translationMacro as t
} from 'ember-i18n';
import CompareLayerMixin from '../mixins/compare-layers';
/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's hbs-markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-maplayer').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name (null because component hasn't wrapping <div>).
  @property {String} flexberryClassNames.visibilityCheckbox Component's visibility chackbox CSS-class name ('flexberry-maplayer-visibility-checkbox').
  @property {String} flexberryClassNames.typeIcon Component's type icon CSS-class name ('flexberry-maplayer-type-icon').
  @property {String} flexberryClassNames.addButton Component's 'add' button CSS-class name ('flexberry-maplayer-add-button').
  @property {String} flexberryClassNames.editButton Component's 'edit' button CSS-class name ('flexberry-maplayer-edit-button').
  @property {String} flexberryClassNames.removeButton Component's 'remove' button CSS-class name ('flexberry-maplayer-remove-button').
  @property {String} flexberryClassNames.caption Component's 'name' label CSS-class name ('flexberry-maplayer-caption-label').
  @property {String} flexberryClassNames.preventExpandCollapse Component's CSS-class name to prevent nodes expand/collapse animation ('flexberry-treenode-prevent-expand-collapse').
  @readonly
  @static

  @for FlexberryMaplayerComponent
*/
const flexberryClassNamesPrefix = 'flexberry-maplayer';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null,
  visibilityCheckbox: flexberryClassNamesPrefix + '-visibility-checkbox',
  opacitySlider: flexberryClassNamesPrefix + '-opacity-slider',
  opacityLabel: flexberryClassNamesPrefix + '-opacity-label',
  typeIcon: flexberryClassNamesPrefix + '-type-icon',
  addButton: flexberryClassNamesPrefix + '-add-button',
  copyButton: flexberryClassNamesPrefix + '-copy-button',
  editButton: flexberryClassNamesPrefix + '-edit-button',
  removeButton: flexberryClassNamesPrefix + '-remove-button',
  boundsButton: flexberryClassNamesPrefix + '-bounds-button',
  attributesButton: flexberryClassNamesPrefix + '-attributes-button',
  loadButton: flexberryClassNamesPrefix + '-load-button',
  caption: flexberryClassNamesPrefix + '-caption-label',
  legendToggler: flexberryClassNamesPrefix + '-legend-toggler',
  preventExpandCollapse: FlexberryTreenodeComponent.flexberryClassNames.preventExpandCollapse,
};

/**
  Flexberry layers tree component with [Semantic UI accordion](http://semantic-ui.com/modules/accordion.html) style.
  and ["Data Down Actions Up (DDAU)" pattern](https://emberway.io/ember-js-goodbye-mvc-part-1-21777ecfd708) one way bindings.
  Component doesn't mutate passed data by its own, it only invokes actions,
  which signalizes to the route, controller, or another component, that passed data should be mutated.
  Component must be used in combination with {{#crossLink "FlexberryMaplayersComponent"}}'flexberry-maplayers' component{{/crossLink}}
  as a wrapper for those layers, which are placed on the same tree level.

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

  @class FlexberryMaplayerComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses <a href="https://github.com/ciena-blueplanet/ember-block-slots#usage">SlotsMixin</a>
  @uses RequiredActionsMixin
  @uses DomActionsMixin
  @uses DynamicActionsMixin
  @uses DynamicPropertiesMixin
*/
let FlexberryMaplayerComponent = Ember.Component.extend(
  SlotsMixin,
  RequiredActionsMixin,
  DomActionsMixin,
  DynamicActionsMixin,
  DynamicPropertiesMixin,
  CompareLayerMixin, {

    dynamicButtons: [],

    /**
      Service for managing map API.
      @property mapApi
      @type MapApiService
    */
    mapApi: Ember.inject.service(),

    /**
      Layer copy's name postfix

      @property copyPostfix
      @type String
      @default t('components.layers-dialogs.copy.layer-name-postfix')
    */
    copyPostfix: t('components.layers-dialogs.copy.layer-name-postfix'),

    /**
      Component's required actions names.
      For actions enumerated in this array an assertion exceptions will be thrown,
      if actions handlers are not defined for them.

      @property _requiredActions
      @type String[]
      @default ['changeVisibility', 'changeOpacity', 'add', 'copy', 'edit', 'remove', 'fitBounds']
    */
    _requiredActionNames: ['changeVisibility', 'changeOpacity', 'add', 'copy', 'edit', 'remove', 'fitBounds'],

    /**
      Used to identify this component on the page by component name.
      @property componentName
      @type String
      @readonly
    */
    componentName: Ember.computed('elementId', function () {
      return 'treenode' + this.get('elementId');
    }),

    /**
      Flag: indicates whether some {{#crossLink "FlexberryMaplayerComponent/layers:property"}}'layers'{{/childNodes}} are defined.

      @property _hasLayers
      @type boolean
      @readOnly
      @private
    */
    _hasLayers: Ember.computed('layer.layers.[]', 'layer.layers.@each.isDeleted', function () {
      let layers = this.get('layer.layers');

      return Ember.isArray(layers) && layers.filter((layer) => {
        return !Ember.isNone(layer) && Ember.get(layer, 'isDeleted') !== true;
      }).length > 0;
    }),

    /**
      Flag: indicates whether some nested content is defined.
      (some yield markup or {{#crossLink "FlexberryMaplayersComponent/layers:property"}}'layers'{{/crossLink}} are defined).

      @property _hasContent
      @type boolean
      @readOnly
      @private
    */

    _hasContent: Ember.computed('_slots.[]', '_hasLayers', 'layer.legendCanBeDisplayed', '_canChangeOpacity', function () {
      // Yielded {{block-slot "content"}} is defined or 'nodes' are defined.
      return this._isRegistered('content') || this.get('_hasLayers') || this.get('layer.legendCanBeDisplayed') || this.get('_canChangeOpacity');
    }),

    /**
      Flag: displays whether layer's opacity can be changed

      @property _canChangeOpacity
      @type bool
      @readOnly
      @private
    */
    _canChangeOpacity: Ember.computed('_hasLayers', 'layer.type', function () {
      return this.get('_hasLayers') !== true && this.get('layer.type') !== 'group';
    }),

    /**
      Formatted layer's opacity display value.

      @property _opacityDisplayValue
      @type string
      @readOnly
      @private
    */
    _opacityDisplayValue: Ember.computed('layer.settingsAsObject.opacity', function () {
      let opacity = this.get('layer.settingsAsObject.opacity');

      let result = opacity !== 0 && opacity > 0.01 ? Math.round(opacity * 100) : 0;
      return result.toString() + '%';
    }),

    /**
      Layer class factory related to current layer type.

      @property _layerClassFactory
      @type Object
      @readOnly
      @private
    */
    _layerClassFactory: Ember.computed('layer.type', function () {
      return Ember.getOwner(this).knownForType('layer', this.get('layer.type'));
    }),

    /**
      CSS-class name for layer type related icon.

      @property _typeIconClass
      @type String
      @readOnly
      @private
    */
    _typeIconClass: Ember.computed('_layerClassFactory', function () {
      let layerClassFactory = this.get('_layerClassFactory');

      return Ember.get(layerClassFactory, 'iconClass');
    }),

    /**
      Flag: indicates whether add feature operation is allowed by api function for layer.

      @property _addFeatureIsAvailableApi
      @type boolean
      @readOnly
      @private
    */
    _addFeatureIsAvailableApi: Ember.computed('layer', function () {
      const layerId = this.get('layer.id');
      if (!Ember.isNone(layerId)) {
        const canAddLayerFeatureFunc = this.get('mapApi').getFromApi('canAddLayerFeature');
        if (typeof canAddLayerFeatureFunc === 'function') {
          return canAddLayerFeatureFunc(layerId);
        }
      }

      return true;
    }),

    /**
      Flag: indicates whether edit layer operation is allowed by api function.

      @property _editLayerIsAvailableApi
      @type boolean
      @readOnly
      @private
    */
    _editLayerIsAvailableApi: Ember.computed('layer', function () {
      const layerId = this.get('layer.id');
      if (!Ember.isNone(layerId)) {
        const canEditLayerFunc = this.get('mapApi').getFromApi('canEditLayer');
        if (typeof canEditLayerFunc === 'function') {
          return canEditLayerFunc(layerId);
        }
      }

      return true;
    }),

    /**
      Flag: indicates whether delete layer operation is allowed by api function.

      @property _addOperationIsAvailableApi
      @type boolean
      @readOnly
      @private
    */
    _deleteLayerIsAvailableApi: Ember.computed('layer', function () {
      const layerId = this.get('layer.id');
      if (!Ember.isNone(layerId)) {
        const canDeleteLayerFunc = this.get('mapApi').getFromApi('canDeleteLayer');
        if (typeof canDeleteLayerFunc === 'function') {
          return canDeleteLayerFunc(layerId);
        }
      }

      return true;
    }),

    /**
      Flag: indicates whether load layer data operation is allowed by api function.

      @property _loadLayerDataIsAvailableApi
      @type boolean
      @readOnly
      @private
    */
    _loadLayerDataIsAvailableApi: Ember.computed('layer', function () {
      const layerId = this.get('layer.id');
      if (!Ember.isNone(layerId)) {
        const canLoadLayerDataFunc = this.get('mapApi').getFromApi('canLoadLayerData');
        if (typeof canLoadLayerDataFunc === 'function') {
          return canLoadLayerDataFunc(layerId);
        }
      }

      return true;
    }),

    /**
      Flag: indicates whether add operation is allowed for layer.

      @property _addOperationIsAvailable
      @type boolean
      @readOnly
      @private
    */
    _addOperationIsAvailable: Ember.computed('_layerClassFactory', function () {
      let layerClassFactory = this.get('_layerClassFactory');

      return Ember.A(Ember.get(layerClassFactory, 'operations') || []).contains('add');
    }),

    /**
      Flag: indicates whether fir bounds operation is allowed for layer.

      @property _fitBoundsOperationIsAvailable
      @type boolean
      @readOnly
      @private
    */
    _fitBoundsOperationIsAvailable: Ember.computed('_hasLayers', 'layer.type', function () {
      return this.get('_hasLayers') || this.get('layer.type') !== 'group';
    }),

    /**
      Flag: indicates whether edit/add operation is allowed for layer.

      @property _editOperationIsAvailable
      @type boolean
      @readOnly
      @private
    */
    _editOperationIsAvailable: Ember.computed('_layerClassFactory', 'layer.layerInitialized', function () {
      let layerClassFactory = this.get('_layerClassFactory');

      return Ember.A(Ember.get(layerClassFactory, 'operations') || []).includes('editFeatures') && this.get('layer.layerInitialized');
    }),

    /**
      Flag: indicates whether attributes operation is allowed for layer.

      @property _attributesOperationIsAvailable
      @type boolean
      @readOnly
      @private
    */
    _attributesOperationIsAvailable: Ember.computed('_layerClassFactory', 'layer.layerInitialized', function () {
      let layerClassFactory = this.get('_layerClassFactory');

      return Ember.A(Ember.get(layerClassFactory, 'operations') || []).includes('attributes') && this.get('layer.layerInitialized');
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
      Flag: indicates whether edit dialog has been already requested by user or not.

      @property _editDialogHasBeenRequested
      @type boolean
      @private
    */
    _editDialogHasBeenRequested: false,

    /**
      Flag: indicates whether copy dialog has been already requested by user or not.

      @property _copyDialogHasBeenRequested
      @type boolean
      @private
    */
    _copyDialogHasBeenRequested: false,

    /**
      Flag: indicates whether remove dialog has been already requested by user or not.

      @property _removeDialogHasBeenRequested
      @type boolean
      @private
    */
    _removeDialogHasBeenRequested: false,

    /**
      Flag: indicates whether add dialog is visible or not.

      @property _addDialogIsVisible
      @type boolean
      @private
    */
    _addDialogIsVisible: false,

    /**
      Flag: indicates whether edit dialog is visible or not.

      @property _editDialogIsVisible
      @type boolean
      @private
    */
    _editDialogIsVisible: false,

    /**
      Flag: indicates whether copy dialog is visible or not.

      @property _copyDialogIsVisible
      @type boolean
      @private
    */
    _copyDialogIsVisible: false,

    /**
      Flag: indicates whether remove dialog is visible or not.

      @property _removeDialogIsVisible
      @type boolean
      @private
    */
    _removeDialogIsVisible: false,

    /**
      Layer model for 'add' dialog.

      @property _addDialogLayer
      @type NewPlatformFlexberryGISMapLayerModel
      @default null
    */
    _addDialogLayer: null,

    /**
      Layer model for 'copy' dialog.

      @property _copyDialogLayer
      @type NewPlatformFlexberryGISMapLayerModel
      @default null
    */
    _copyDialogLayer: null,

    /**
      Layer model for 'edit' dialog.

      @property _editDialogLayer
      @type NewPlatformFlexberryGISMapLayerModel
      @default null
    */
    _editDialogLayer: null,

    /**
      Layer model for 'remove' dialog.

      @property _removeDialogLayer
      @type NewPlatformFlexberryGISMapLayerModel
      @default null
    */
    _removeDialogLayer: null,

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
      Flag: indicates whether create new layer is avaliable by rights

      @property createNewLayerAccess
      @type Boolean
      @readonly
    */
    createNewLayerAccess: Ember.computed('access', 'access.createAccess', 'readonly', function () {
      let createAccess = this.get('access.createAccess');
      let readonly = this.get('readonly');

      return !readonly && createAccess;
    }),

    /**
      Flag: indicates whether layer model is in readonly mode.

      @property readonlyModel
      @type Boolean
      @readonly
    */
    readonlyModel: Ember.computed('access', 'access.accessibleModel.[]', 'readonly', 'layer', function () {
      let accessibleModel = this.get('access.accessibleModel');
      let layer = this.get('layer');
      let readonly = this.get('readonly');

      let access = !Ember.isNone(layer) && !Ember.isNone(accessibleModel) && Ember.isArray(accessibleModel) && Ember.A(accessibleModel).contains(layer.id);

      return readonly || !access;
    }),

    /**
      Flag: indicates whether layer's objects is in readonly mode.

      @property readonlyData
      @type Boolean
      @readonly
    */
    readonlyData: Ember.computed('access', 'access.accessibleData.[]', 'readonly', 'layer', function () {
      let accessibleData = this.get('access.accessibleData');
      let layer = this.get('layer');
      let readonly = this.get('readonly');

      let access = !Ember.isNone(layer) && !Ember.isNone(accessibleData) && Ember.isArray(accessibleData) && Ember.A(accessibleData).contains(layer.id);

      return readonly || !access;
    }),

    /**
      Flag: indicates whether layer has access for loading.

      @property readonlyData
      @type Boolean
      @readonly
    */
    presenceLayerInGeoportal: Ember.computed('access', 'readonly', 'layer', function () {
      let presenceLayerInGeoportal = this.get('access.presenceLayerInGeoportal');
      if (!Ember.isNone(presenceLayerInGeoportal)) {
        let layer = this.get('layer');
        let readonly = this.get('readonly');

        let mapLayerId = Object.keys(presenceLayerInGeoportal).find(key => key === layer.id);

        let access = !Ember.isNone(layer) && !Ember.isNone(presenceLayerInGeoportal) && !Ember.isNone(mapLayerId);

        return !readonly || access;
      }

      return false;
    }),

    /**
      Flag: indicates whether layer node has been expanded once.

      @property hasBeenExpanded
      @type Boolean
      @default false
    */
    hasBeenExpanded: false,

    /**
      Flag: indicates whether submenu is visible.

      @property isSubmenu
      @type boolean
      @default false
    */
    isSubmenu: false,

    /**
      Flag: indicates whether layer is group.

      @property isSubmenu
      @type boolean
      @default false
    */
    isGroup: false,

    /**
      CSS class 'disabled' if layer is group.

      @property disabled
      @type String
      @default ''
    */
    disabled: '',

    maxDate: Ember.computed(function () {
      let date = new Date(new Date().toDateString());
      date.setDate(date.getDate() + 1);
      return date;
    }),

    /**
     * Value for checkbox in compare mode.
     * Should be true, if layer is enabled on any side.
     * @type Bool
     */
    comparedLayerEnable: Ember.computed('compare.side',
    'compare.compareState.Left.childLayersEnabled',
    'compare.compareState.Right.childLayersEnabled',
    'compare.compareState.Left.groupLayersEnabled',
    'compare.compareState.Right.groupLayersEnabled', function() {
      const side = this.get('compare.side');
      const oppositeSide = this.getOppositeSide(side);
      const groupSideSettings = this.get(`compare.compareState.${side}.groupLayersEnabled`);
      const childSideSettings = this.get(`compare.compareState.${side}.childLayersEnabled`);
      const oppositeChildSideSettings = this.get(`compare.compareState.${oppositeSide}.childLayersEnabled`);
      const layer = this.get('layer');
      if (this.get('isGroup')) {
        return !!groupSideSettings.find(id => id === layer.get('id'));
      }

      return !![...childSideSettings, ...oppositeChildSideSettings].find(l => l.id === this.get('layer.id'));
    }),

    /**
     * Readonly for checkbox.
     * Should be true, if layer is enabled on the opposite side.
     * @type Bool
     */
    isLayerSelectedOnOtherSide: Ember.computed('compare.side',
    'compare.compareState.Left.childLayersEnabled.[]',
    'compare.compareState.Right.childLayersEnabled.[]', function() {
      const oppositeSide = this.getOppositeSide(this.get('compare.side'));
      const oppositechildSideSettings = this.get(`compare.compareState.${oppositeSide}.childLayersEnabled`);
      return (!!oppositechildSideSettings.find(l => l.id === this.get('layer.id')));
    }),

    /**
      Initializes DOM-related component's properties.
    */
    didInsertElement() {
      if (this.get('layer.type') === 'group') {
        this.set('isGroup', true);
        this.set('disabled', 'disabled');
      }

      if (!this.get('readonly')) {
        let _this = this;
        let $captionBlock = Ember.$('.ui.tab.treeview .flexberry-treenode-caption-block');
        if ($captionBlock.length > 0) {
          $captionBlock.hover(
            function () {
              let $toolbar = Ember.$(this).children('.flexberry-treenode-buttons-block');
              $toolbar.removeClass('hidden');
              Ember.$(this).children('.flexberry-maplayer-caption-label').addClass('blur');
            },
            function () {
              let $toolbar = Ember.$(this).children('.flexberry-treenode-buttons-block');
              $toolbar.addClass('hidden');
              Ember.$(this).children('.flexberry-maplayer-caption-label').removeClass('blur');
              _this.set('isSubmenu', false);
            });
        }
      }
    },

    actions: {
      onLayerTimeChange() {
        this.sendAction('layerTimeChanged', this.get('layer'), this.get('layer.archTime'));
      },

      external(actionName) {
        this.set('isSubmenu', false);
        this.sendAction('external', actionName, this.get('layer'));
      },

      /**
        Handles click on checkbox.
        @method action.onChange
        @param {Object} e event args.
      */
      onChange(e) {
        let layer = this.get('layer');
        let map = this.get('leafletMap');
        if (this.get('isGroup')) {
          this.setGroupLayerBySide(layer, this.get('compare.side'), map);
        } else {
          this.setChildLayerBySide(layer, this.get('compare.side'), map);
        }
      },

      /**
        Show\hide submenu

        @method actions.onSubmenu
      */
      onSubmenu() {
        let component = Ember.$('.' + this.get('componentName'));
        let moreButton = Ember.$('.more.floated.button', component);
        let elements = Ember.$('.more.submenu.hidden', component);
        openCloseSubmenu(this, moreButton, elements, 2);
      },

      onAddCompare() {
        //добавление в зависимости от стороны
      },
      /**
        Handles {{#crossLink "FlexberryTreenodeComponent/sendingActions.headerClick:method"}}'flexberry-treenode' component's 'headerClick' action{{/crossLink}}.
        Invokes component's {{#crossLink "FlexberryMaplayerComponent/sendingActions.headerClick:method"}}'headerClick' action{{/crossLink}}.

        @method actions.onHeaderClick
        @param {Object} e Event object from
        {{#crossLink "FlexberryTreenodeComponent/sendingActions.headerClick:method"}}'flexberry-treenode' component's 'headerClick' action{{/crossLink}}.
      */
      onHeaderClick(...args) {
        this.sendAction('headerClick', ...args);
      },

      /**
        Handles {{#crossLink "FlexberryTreenodeComponent/sendingActions.beforeExpand:method"}}'flexberry-treenode' component's 'beforeExpand' action{{/crossLink}}.
        Invokes component's {{#crossLink "FlexberryMaplayerComponent/sendingActions.beforeExpand:method"}}'beforeExpand' action{{/crossLink}}.

        @method actions.onHeaderClick
        @param {Object} e Event object from
        {{#crossLink "FlexberryTreenodeComponent/sendingActions.beforeExpand:method"}}'flexberry-treenode' component's 'beforeExpand' action{{/crossLink}}.
      */
      onBeforeExpand(...args) {
        // Set has been expanded flag once.
        let hasBeenExpanded = this.set('hasBeenExpanded');
        if (!hasBeenExpanded) {
          this.set('hasBeenExpanded', true);
        }

        this.sendAction('beforeExpand', ...args);
      },

      /**
        Handles {{#crossLink "FlexberryTreenodeComponent/sendingActions.beforeCollapse:method"}}'flexberry-treenode' component's 'beforeCollapse' action{{/crossLink}}.
        Invokes component's {{#crossLink "FlexberryMaplayerComponent/sendingActions.beforeCollapse:method"}}'beforeCollapse' action{{/crossLink}}.

        @method actions.onHeaderClick
        @param {Object} e Event object from
        {{#crossLink "FlexberryTreenodeComponent/sendingActions.beforeCollapse:method"}}'flexberry-treenode' component's 'beforeCollapse' action{{/crossLink}}.
      */
      onBeforeCollapse(...args) {
        this.sendAction('beforeCollapse', ...args);
      },

      /**
        Handles {{#crossLink "FlexberryDdauCheckboxComponent/sendingActions.change:method"}}'flexberry-ddau-checkbox' component's 'change' action{{/crossLink}}.
        Invokes component's {{#crossLink "FlexberryMaplayerComponent/sendingActions.changeVisibility:method"}}'changeVisibility'action{{/crossLink}}.

        @method actions.onVisibilityCheckboxChange
        @param {Object} e eventObject Event object from {{#crossLink "FlexberryDdauCheckbox/sendingActions.change:method"}}'flexberry-ddau-checkbox' component's 'change' action{{/crossLink}}.
      */
      onVisibilityCheckboxChange(...args) {
        this.sendAction('changeVisibility', ...args);
      },

      /**
        Handles {{#crossLink "FlexberryDdauSliderComponent/sendingActions.change:method"}}'flexberry-ddau-slider' component's 'change' action{{/crossLink}}.
        Invokes component's {{#crossLink "FlexberryMaplayerComponent/sendingActions.changeVisibility:method"}}'changeOpacity'action{{/crossLink}}.

        @method actions.onOpacitySliderChange
        @param {Object} e eventObject Event object from {{#crossLink "FlexberryDdauSlider/sendingActions.change:method"}}'flexberry-ddau-slider' component's 'change' action{{/crossLink}}.
      */
      onOpacitySliderChange(...args) {
        this.sendAction('changeOpacity', ...args);
      },

      /**
        Invokes component's {{#crossLink "FlexberryMaplayerComponent/sendingActions.fitBounds:method"}}'fitBounds' action{{/crossLink}}.

        @method actions.onBoundsButtonClick
        @param {Object} e [jQuery event object](http://api.jquery.com/category/events/event-object/)
        which describes button's 'click' event.
      */
      onBoundsButtonClick(...args) {
        this.sendAction('fitBounds', ...args);
      },

      /**
        Handles attributes button's 'click' event.
        Invokes component's {{#crossLink "FlexberryMaplayersComponent/sendingActions.attributes:method"}}'attributes'{{/crossLink}} action.

        @method actions.onAttributesButtonClick
        @param {Object} e [jQuery event object](http://api.jquery.com/category/events/event-object/)
        which describes button's 'click' event.
      */
      onAttributesButtonClick(...args) {
        this.sendAction('attributesEdit', ...args);
      },

      /**
        Handles create feature button's 'click' event.
        Invokes component's {{#crossLink "FlexberryMaplayersComponent/sendingActions.attributes:method"}}'attributes'{{/crossLink}} action.

        @method actions.onFeatureCreateButtonClick
        @param {Object} e [jQuery event object](http://api.jquery.com/category/events/event-object/)
        which describes button's 'click' event.
      */
      onFeatureCreateButtonClick(...args) {
        this.sendAction('featureEdit', ...args);
      },

      /**
        Handles add button's 'click' event.
        Invokes component's {{#crossLink "FlexberryMaplayersComponent/sendingActions.add:method"}}'add'{{/crossLink}} action.

        @method actions.onAddButtonClick
        @param {Object} e [jQuery event object](http://api.jquery.com/category/events/event-object/)
        which describes button's 'click' event.
      */
      onAddButtonClick(e) {
        // Create empty layer.
        let store = this.get('store');
        this.set('_addDialogLayer', store.createRecord('new-platform-flexberry-g-i-s-map-layer', { id: generateUniqueId() }));

        // Include dialog to markup.
        this.set('_addDialogHasBeenRequested', true);

        // Show dialog.
        this.set('_addDialogIsVisible', true);
      },

      /**
        Handles add dialog's 'approve' action.
        Invokes component's {{#crossLink "FlexberryMaplayerComponent/sendingActions.add:method"}}'add'{{/crossLink}} action.

        @method actions.onAddDialogApprove
        @param {Object} e Action's event object.
        @param {Object} e.layerProperties Object containing properties of new child layer.
      */
      onAddDialogApprove(...args) {
        // Send outer 'add' action.
        this.sendAction('add', ...args);
        this.set('_addDialogHasBeenRequested', false);
      },

      /**
        Handles add dialog's 'deny' action.

        @method actions.onAddDialogDeny
      */
      onAddDialogDeny() {
        this.set('_addDialogHasBeenRequested', false);
      },

      /**
        Handles copy button's 'click' event.
        Invokes component's {{#crossLink "FlexberryMaplayersComponent/sendingActions.copy:method"}}'copy'{{/crossLink}} action.

        @method actions.onCopyButtonClick
        @param {Object} e [jQuery event object](http://api.jquery.com/category/events/event-object/)
        which describes button's 'click' event.
      */
      onCopyButtonClick(e) {
        // Create layer copy.
        this.createLayerCopy('_copyDialogLayer');
        this.set('_copyDialogLayer.name', `${this.get('_copyDialogLayer.name')} ${this.get('copyPostfix')}`);

        // Include dialog to markup.
        this.set('_copyDialogHasBeenRequested', true);

        // Show dialog.
        this.set('_copyDialogIsVisible', true);
      },

      /**
        Handles copy dialog's 'approve' action.
        Invokes component's {{#crossLink "FlexberryMaplayerComponent/sendingActions.copy:method"}}'copy'{{/crossLink}} action.

        @method actions.onCopyDialogApprove
        @param {Object} e Action's event object.
        @param {Object} e.layerProperties Object containing properties of layer copy.
      */
      onCopyDialogApprove(...args) {
        let { layerProperties } = args[args.length - 1];
        let layer = this.get('_copyDialogLayer');
        layer.setProperties(layerProperties);

        // Send outer 'copy' action.
        this.sendAction('copy', { layerProperties, layer });
        this.set('_copyDialogHasBeenRequested', false);
      },

      /**
        Handles copy dialog's 'deny' action.

        @method actions.onCopyDialogDeny
      */
      onCopyDialogDeny() {
        this.set('_copyDialogHasBeenRequested', false);
      },

      /**
        Handles edit button's 'click' event.
        Shows component's edit dialog.

        @method actions.onEditButtonClick
        @param {Object} [jQuery event object](http://api.jquery.com/category/events/event-object/)
        which describes button's 'click' event.
      */
      onEditButtonClick() {
        // Create layer copy.
        this.createLayerCopy('_editDialogLayer', true);

        // Include dialog to markup.
        this.set('_editDialogHasBeenRequested', true);

        // Show dialog.
        this.set('_editDialogIsVisible', true);
      },

      /**
        Handles edit dialog's 'approve' action.
        Invokes component's {{#crossLink "FlexberryMaplayerComponent/sendingActions.add:method"}}'edit'{{/crossLink}} action.

        @method actions.onEditDialogApprove
        @param {Object} e Action's event object.
        @param {Object} e.layerProperties Object containing edited layer properties, which must be merged to layer on action.
      */
      onEditDialogApprove(...args) {
        // Send outer 'edit' action.
        this.sendAction('edit', ...args);
        this.set('_editDialogHasBeenRequested', false);
      },

      /**
        Handles edit dialog's 'deny' action.

        @method actions.onEditDialogDeny
      */
      onEditDialogDeny() {
        this.set('_editDialogHasBeenRequested', false);
      },

      /**
        Handles remove button's 'click' event.
        Shows component's remove dialog.

        @method actions.onRemoveButtonClick
        @param {Object} [jQuery event object](http://api.jquery.com/category/events/event-object/)
        which describes button's 'click' event.
      */
      onRemoveButtonClick() {
        // Create layer copy.
        this.createLayerCopy('_removeDialogLayer', true);

        // Include dialog to markup.
        this.set('_removeDialogHasBeenRequested', true);

        // Show dialog.
        this.set('_removeDialogIsVisible', true);
      },

      /**
        Handles remove dialog's 'approve' action.
        Invokes component's {{#crossLink "FlexberryMaplayerComponent/sendingActions.remove:method"}}'remove'{{/crossLink}} action.

        @method actions.onRemoveDialogApprove
      */
      onRemoveDialogApprove(...args) {
        // Send outer 'remove' action.
        this.sendAction('remove', ...args);
        this.set('_removeDialogHasBeenRequested', false);
      },

      /**
        Handles remove dialog's 'deny' action.

        @method actions.onRemoveDialogDeny
      */
      onRemoveDialogDeny() {
        this.set('_removeDialogHasBeenRequested', false);
      },

      closeOtherCalendar() {
        this.sendAction('closeOtherCalendar', this.get('layer.id'));
      },

      onLoadButtonClick() {
        if (!Ember.isNone(this.get('presenceLayerInGeoportal'))) {
          this.sendAction('onLoad');
        }
      }
    },

    /**
      Creates layer's copy.

      @method createLayerCopy
      @param {String} resultPropertyName Property name for layer's copy.
      @param {Boolean} ignoreLinks Indicates whether copying links.
    */
    createLayerCopy(resultPropertyName, ignoreLinks) {
      let store = this.get('store');
      let layer = this.get('layer');

      this.set(resultPropertyName, copyLayer(layer, store, ignoreLinks));
    },

    /**
      Component's action invoking when layer node's header has been clicked.

      @method sendingActions.headerClick
      @param {Object} e Event object from
      {{#crossLink "FlexberryTreenodeComponent/sendingActions.headerClick:method"}}'flexberry-treenode' component's 'headerClick' action{{/crossLink}}.
    */

    /**
      Component's action invoking before layer node will be expanded.
      Layer node can be prevented from being expanded with call to action event object's 'originalEvent.stopPropagation()'.

      @method sendingActions.beforeExpand
      @param {Object} e Event object from
      {{#crossLink "FlexberryTreenodeComponent/sendingActions.beforeExpand:method"}}'flexberry-treenode' component's 'beforeExpand' action{{/crossLink}}.
    */

    /**
      Component's action invoking before layer node will be collapsed.
      Layer node can be prevented from being collapsed with call to action event object's 'originalEvent.stopPropagation()'.

      @method sendingActions.beforeCollapse
      @param {Object} e Event object from
      {{#crossLink "FlexberryTreenodeComponent/sendingActions.beforeCollpse:method"}}'flexberry-treenode' component's 'beforeCollpse' action{{/crossLink}}.
    */

    /**
      Component's action invoking when layer node's 'visibility' state changed.

      @method sendingActions.changeVisibility
      @param {Object} e Event object from
      {{#crossLink "FlexberryDdauCheckboxComponent/sendingActions.change:method"}}flexberry-ddau-checkbox 'change' action{{/crossLink}}.
    */

    /**
      Component's action invoking when layer node's 'opacity' value changed.

      @method sendingActions.changeOpacity
      @param {Object} e eventObject Event object from {{#crossLink "FlexberryDdauSlider/sendingActions.change:method"}}'flexberry-ddau-slider' component's 'change' action{{/crossLink}}.
      {{#crossLink "FlexberryDdauSliderComponent/sendingActions.change:method"}}'flexberry-ddau-slider' component's 'change' action{{/crossLink}}.
    */

    /**
      Component's action invoking when layer node's 'extent' button clicked.

      @method sendingActions.fitBounds
      @param {Object} e [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes button's 'click' event.
    */

    /**
      Component's action invoking when user wants to add child layer into current.

      @method sendingActions.add
      @param {Object} e Action's event object.
      @param {Object} e.layerProperties Object containing properties of new child layer.
    */

    /**
      Component's action invoking when user wants to copy current layer.

      @method sendingActions.copy
      @param {Object} e Action's event object.
      @param {Object} e.layerProperties Object containing copied layer properties.
      @param {Object} e.layer Object containing copied layer model.
    */

    /**
      Component's action invoking when user wants to edit current layer.

      @method sendingActions.edit
      @param {Object} e Action's event object.
      @param {Object} e.layerProperties Object containing edited layer properties, which must be merged to layer on action.
    */

    /**
      Component's action invoking when user wants to remove current layer.

      @method sendingActions.remove
      @param {Object} e Action's event object.
    */

    /**
      Component's action invoking when user wants to look at attributes of current layer.

      @method sendingActions.attributesEdit
      @param {Object} e Action's event object.
    */
  }
);

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryMaplayerComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryMaplayerComponent;
