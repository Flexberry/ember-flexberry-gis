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

import layout from '../templates/components/flexberry-maplayer';

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
  DynamicPropertiesMixin, {

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
      Flag: indicates whether some {{#crossLink "FlexberryMaplayerComponent/layers:property"}}'layers'{{/childNodes}} are defined.

      @property _hasLayers
      @type boolean
      @readOnly
      @private
    */
    _hasLayers: Ember.computed('layers.[]', 'layers.@each.isDeleted', function () {
      let layers = this.get('layers');

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

    _hasContent: Ember.computed('_slots.[]', '_hasLayers', 'legendCanBeDisplayed', '_canChangeOpacity', function () {
      // Yielded {{block-slot "content"}} is defined or 'nodes' are defined.
      return this._isRegistered('content') || this.get('_hasLayers') || this.get('legendCanBeDisplayed') || this.get('_canChangeOpacity');
    }),

    /**
      Flag: displays whether layer's opacity can be changed

      @property _canChangeOpacity
      @type bool
      @readOnly
      @private
    */
    _canChangeOpacity: Ember.computed('_hasLayers', 'type', function () {
      return this.get('_hasLayers') !== true && this.get('type') !== 'group';
    }),

    /**
      Formatted layer's opacity display value.

      @property _opacityDisplayValue
      @type string
      @readOnly
      @private
    */
    _opacityDisplayValue: Ember.computed('opacity', function () {
      let opacity = this.get('opacity');

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
    _layerClassFactory: Ember.computed('type', function () {
      return Ember.getOwner(this).knownForType('layer', this.get('type'));
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
      Flag: indicates whether fir bouds operation is allowed for layer.

      @property _fitBoundsOperationIsAvailable
      @type boolean
      @readOnly
      @private
    */
    _fitBoundsOperationIsAvailable: Ember.computed('_hasLayers', 'type', function () {
      return this.get('_hasLayers') || this.get('type') !== 'group';
    }),

    /**
      Flag: indicates whether attributes operation is allowed for layer.

      @property _attributesOperationIsAvailable
      @type boolean
      @readOnly
      @private
    */
    _attributesOperationIsAvailable: Ember.computed('_layerClassFactory', function () {
      let layerClassFactory = this.get('_layerClassFactory');

      return Ember.A(Ember.get(layerClassFactory, 'operations') || []).contains('attributes');
    }),

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
      Leaflet layer related to layer model.

      @property _leafletObject
      @type <a href="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>
      @private
    */
    _leafletObject: null,

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
      Layer model.

      @property model
      @type {NewPlatformFlexberryGISMapLayerModel}
      @default null
    */
    model: null,

    /**
      Layer model copy.

      @property modelCopy
      @type {NewPlatformFlexberryGISMapLayerModel}
      @default null
    */
    modelCopy: null,

    /**
      Layer's type (depending on it icon mark is selected).

      @property type
      @type String
      @default null
    */
    type: null,

    /**
      Layer's name (will be displayed near node).

      @property name
      @type String
      @default null
    */
    name: null,

    /**
      Layer's CRS (coordinate reference system).

      @property coordinateReferenceSystem
      @type String
      @default null
    */
    coordinateReferenceSystem: null,

    /**
      Layer's bounding box.

      @property boundingBox
      @type Object
      @default null
    */
    boundingBox: null,

    /**
      Layer's serialized type-related settings.

      @property type
      @type String
      @default null
    */
    settings: null,

    /**
      Layer's settings as JSON-object.

      @property settingsAsObject
      @type String
      @default null
    */
    settingsAsObject: null,

    /**
      Layer's visibility.

      @property visibility
      @type Boolean
      @default false
    */
    visibility: false,

    /**
      Layer's opacity.

      @property opacity
      @type Number
      @default 1
    */
    opacity: 1,

    /**
      Flag: indicates whether layer's legend can be displayed.

      @property legendCanBeDisplayed
      @type Boolean
      @default false
    */
    legendCanBeDisplayed: false,

    /**
      Child layers.
      This property is optional and must be used when there are too many child layers,
      and you don't want to define them explicitly in the .hbs markup,
      then you can define layers array somewhere in code & pass defined array to this component's property.

      @property layers
      @type NewPlatformFlexberryGISMapLayerModel[]
      @default null
    */
    layers: null,

    /**
      Available CSW connections.

      @property cswConnections
      @type Object[]
      @default null
    */
    cswConnections: null,

    /**
      Leaflet map.

      @property leafletMap
      @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
      @default null
    */
    leafletMap: null,

    /**
      Flag: indicates whether layer node is in readonly mode.
      If true, layer node's data-related UI will be in readonly mode.

      @property readonly
      @type Boolean
      @default false
    */
    readonly: false,

    /**
      Flag: indicates whether layer node has been expanded once.

      @property hasBeenExpanded
      @type Boolean
      @default false
    */
    hasBeenExpanded: false,

    actions: {
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
        Handles add button's 'click' event.
        Invokes component's {{#crossLink "FlexberryMaplayersComponent/sendingActions.add:method"}}'add'{{/crossLink}} action.

        @method actions.onAddButtonClick
        @param {Object} e [jQuery event object](http://api.jquery.com/category/events/event-object/)
        which describes button's 'click' event.
      */
      onAddButtonClick(e) {
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
      },

      /**
        Handles copy button's 'click' event.
        Invokes component's {{#crossLink "FlexberryMaplayersComponent/sendingActions.copy:method"}}'copy'{{/crossLink}} action.

        @method actions.onCopyButtonClick
        @param {Object} e [jQuery event object](http://api.jquery.com/category/events/event-object/)
        which describes button's 'click' event.
      */
      onCopyButtonClick(e) {
        // Include dialog to markup.
        this.set('_copyDialogHasBeenRequested', true);

        let layerModel = this.get('model');
        if (Ember.isNone(layerModel)) {
          Ember.Logger.error('Property \'model\' isn\'t defined in \'flexberry-maplayer\' component, so \'copy\' dialog can\'t be shown');
          return;
        }

        if (Ember.typeOf(layerModel.copy) !== 'function') {
          Ember.Logger.error('Property \'model\' in \'flexberry-maplayer\' component doesn\'t implement \'copy\' method, so \'copy\' dialog can\'t be shown');
          return;
        }

        layerModel.copy().then((layerModelCopy) => {
          this.set('modelCopy', layerModelCopy);

          // Show dialog.
          this.set('_copyDialogIsVisible', true);
        }).catch((error) => {
          let message = error.message || error + '';
          Ember.Logger.error('Error happend while copying \'model\' in \'flexberry-maplayer\' component (' + message + '), so \'copy\' dialog can\'t be shown');
        });
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
        let layer = this.get('modelCopy');
        layer.setProperties(layerProperties);

        // Send outer 'copy' action.
        this.sendAction('copy', { layerProperties, layer });
      },

      /**
        Handles edit button's 'click' event.
        Shows component's edit dialog.

        @method actions.onEditButtonClick
        @param {Object} [jQuery event object](http://api.jquery.com/category/events/event-object/)
        which describes button's 'click' event.
      */
      onEditButtonClick() {
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
      },

      /**
        Handles remove button's 'click' event.
        Shows component's remove dialog.

        @method actions.onRemoveButtonClick
        @param {Object} [jQuery event object](http://api.jquery.com/category/events/event-object/)
        which describes button's 'click' event.
      */
      onRemoveButtonClick() {
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
      }
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
