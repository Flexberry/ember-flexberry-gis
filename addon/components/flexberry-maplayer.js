/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import FlexberryTreenodeComponent from './flexberry-treenode';

// Use base component's layout without changes.
import layout from '../templates/components/flexberry-treenode';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-maplayer').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name (null because component hasn't wrapping <div>).
  @property {String} flexberryClassNames.flexberryMaplayer.visibilityCheckbox Component's visibility chackbox CSS-class name ('flexberry-maplayer-visibility-checkbox').
  @property {String} flexberryClassNames.flexberryMaplayer.typeIcon Component's type icon CSS-class name ('flexberry-maplayer-type-icon').
  @property {String} flexberryClassNames.flexberryMaplayer.flexberryMaplayers.addChildButton Component's 'add' button CSS-class name ('flexberry-maplayer-add-button').
  @property {String} flexberryClassNames.flexberryMaplayer.flexberryMaplayers.editButton Component's 'edit' button CSS-class name ('flexberry-maplayer-edit-button').
  @property {String} flexberryClassNames.flexberryMaplayer.flexberryMaplayers.removeButton Component's 'remove' button CSS-class name ('flexberry-maplayer-remove-button').
  @readonly
  @static

  @for FlexberryMaplayerComponent
*/
const flexberryClassNamesPrefix = 'flexberry-maplayer';
const flexberryClassNames = FlexberryTreenodeComponent.flexberryClassNames;
flexberryClassNames.flexberryMaplayer = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null,
  visibilityCheckbox: flexberryClassNamesPrefix + '-visibility-checkbox',
  typeIcon: flexberryClassNamesPrefix + '-type-icon',
  addChildButton: flexberryClassNamesPrefix + '-add-button',
  editButton: flexberryClassNamesPrefix + '-edit-button',
  removeButton: flexberryClassNamesPrefix + '-remove-button'
};

/**
  Flexberry layers tree component with [Semantic UI accordion](http://semantic-ui.com/modules/accordion.html) style.
  and ["Data Down Actions Up (DDAU)" pattern](https://emberway.io/ember-js-goodbye-mvc-part-1-21777ecfd708) one way bindings.
  Component doesn't mutate passed data by its own, it only invokes actions,
  which signalizes to the route, controller, or another component, that passed data should be mutated.
  Component must be used in combination with {{#crossLink "FlexberryMaplayersComponent"}}flexberry-maplayers component{{/crossLink}}
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
  @extends FlexberryTreenodeComponent
*/
let FlexberryMaplayerComponent = FlexberryTreenodeComponent.extend({
  /**
    Component's required actions names.
    For actions enumerated in this array an assertion exceptions will be thrown,
    if actions handlers are not defined for them.

    @property _requiredActions
    @type String[]
    @default ['changeVisibility', 'addChild', 'edit', 'remove']
  */
  _requiredActionNames: ['changeVisibility', 'addChild', 'edit', 'remove'],

  /**
    Name of component that will be used to display child nodes subtree.

    @property _subtreeComponentName
    @type String
    @default 'flexberry-maplayers'
    @private
  */
  _subtreeComponentName: 'flexberry-maplayers',

  /**
    Name of component's property in which child nodes (defined as JSON objects) are stored.

    @property _subtreeNodesPropertyName
    @type String
    @default 'layers'
    @private
  */
  _subtreeNodesPropertyName: 'layers',

  /**
    Observes & handles any changes in
    {{#crossLink "FlexberryMaplayerComponent/visibility:property"}}'visibility' property{{/crossLink}},
    passes actual visibility value to a related component settings in
    {{#crossLink "FlexberryMaplayerComponent/_innerDynamicComponents:property"}}'_innerDynamicComponents'{{/crossLink}}.

    @method _visibilityDidChange
    @private
  */
  _visibilityDidChange: Ember.on('init', Ember.observer('visibility', function() {
    this.set('_innerDynamicComponents.0.componentProperties.value', this.get('visibility'));
  })),

  /**
    Observes & handles any changes in
    {{#crossLink "FlexberryMaplayerComponent/type:property"}}'type' property{{/crossLink}},
    calculates actual icon class dependent on type & passes actual icon class to a related component settings in
    {{#crossLink "FlexberryMaplayerComponent/_innerDynamicComponents:property"}}'_innerDynamicComponents'{{/crossLink}}.

    @method _typeDidChange
    @private
  */
  _typeDidChange: Ember.on('init', Ember.observer('type', function() {
    let type = this.get('type');

    let iconClass = 'marker icon';
    switch (type) {
      case 'group':
        iconClass = 'folder icon';
        break;
      case 'wms':
      case 'tile':
        iconClass = 'image icon';
        break;
    }

    // Set actual icon class for flexberry-icon.
    this.set('_innerDynamicComponents.1.componentProperties.class', flexberryClassNames.flexberryMaplayer.typeIcon + ' ' + iconClass);

    // Show/hide flexberry-button for add operation.
    let readonly = this.get('readonly') === true;
    this.set('_innerDynamicComponents.2.visible', type === 'group' && !readonly);
  })),

  /**
    Observes & handles any changes in
    {{#crossLink "FlexberryMaplayerComponent/readonly:property"}}'readonly' property{{/crossLink}},
    then changes mode for visibility-checkbox and 'add', 'edit', 'remove' operations buttons visibility in
    {{#crossLink "FlexberryMaplayerComponent/_innerDynamicComponents:property"}}'_innerDynamicComponents'{{/crossLink}}.

    @method _readonlyDidChange
    @private
  */
  _readonlyDidChange: Ember.on('init', Ember.observer('readonly', function() {
    let readonly = this.get('readonly') === true;

    // Change readonly-mode for visibility-checkbox.
    this.set('_innerDynamicComponents.0.componentProperties.readonly', readonly);

    // Show/hide flexberry-buttons for 'add', 'edit', 'remove' operations.
    this.set('_innerDynamicComponents.2.visible', !readonly && this.get('type') === 'group');
    this.set('_innerDynamicComponents.3.visible', !readonly);
    this.set('_innerDynamicComponents.4.visible', !readonly);
  })),

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
    Tree node's caption (will be displayed in node's header).

    @property caption
    @type String
    @default null
    @readOnly
  */
  caption: Ember.computed('name', function() {
    return this.get('name');
  }),

  /**
    Layer's name (will be displayed near node).

    @property name
    @type String
    @default null
  */
  name: null,

  /**
    Layer's type (depending on it icon mark is selected).

    @property type
    @type String
    @default null
  */
  type: null,

  /**
    Layer's visibility.

    @property visibility
    @type Boolean
    @default false
  */
  visibility: false,

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
    Initializes component.
  */
  init() {
    this._super(...arguments);

    // Define additional child components as inner dynamic components (see dynamic-components mixin).
    let innerDynamicComponents = Ember.A([{
      to: 'headerLeft',
      componentName: 'flexberry-ddau-checkbox',
      componentProperties: {
        class: flexberryClassNames.flexberryMaplayer.visibilityCheckbox + ' ' + flexberryClassNames.treeNodePreventExpandCollapse,
        value: false,
        dynamicProxyActions: Ember.A([{
          on: 'change',
          actionName: 'changeVisibility'
        }])
      }
    }, {
      to: 'headerLeft',
      componentName: 'flexberry-icon',
      componentProperties: {
        class: flexberryClassNames.flexberryMaplayer.typeIcon
      }
    }, {
      to: 'headerRight',
      componentName: 'flexberry-button',
      componentProperties: {
        class: flexberryClassNames.flexberryMaplayer.addChildButton + ' ' + flexberryClassNames.treeNodePreventExpandCollapse,
        iconClass: 'plus icon',
        dynamicProxyActions: Ember.A([{
          on: 'click',
          actionName: 'addChild'
        }])
      }
    }, {
      to: 'headerRight',
      componentName: 'flexberry-button',
      componentProperties: {
        class: flexberryClassNames.flexberryMaplayer.editButton + ' ' + flexberryClassNames.treeNodePreventExpandCollapse,
        iconClass: 'edit icon',
        dynamicProxyActions: Ember.A([{
          on: 'click',
          actionName: 'edit'
        }])
      }
    }, {
      to: 'headerRight',
      componentName: 'flexberry-button',
      componentProperties: {
        class: flexberryClassNames.flexberryMaplayer.removeButton + ' ' + flexberryClassNames.treeNodePreventExpandCollapse,
        iconClass: 'trash icon',
        dynamicProxyActions: Ember.A([{
          on: 'click',
          actionName: 'remove'
        }])
      }
    }]);

    this.set('_innerDynamicComponents', innerDynamicComponents);
  },

  /**
    Component's action invoking when layer node's header has been clicked.

    @method sendingActions.headerClick
    @param {Object} e Action's event object.
    @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
    which describes event that triggers this action.
  */

  /**
    Component's action invoking before layer node will be expanded.
    Layer node can be prevented from being expanded with call to action event object's 'originalEvent.stopPropagation()'.

    @method sendingActions.beforeExpand
    @param {Object} e Action's event object.
    @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
    which describes event that triggers node's expanding.
  */

  /**
    Component's action invoking before layer node will be collapsed.
    Layer node can be prevented from being collapsed with call to action event object's 'originalEvent.stopPropagation()'.

    @method sendingActions.beforeCollapse
    @param {Object} e Action's event object.
    @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
    which describes event that triggers node's collapsing.
  */

  /**
    Component's action invoking when layer node's 'visibility' state changed.

    @method sendingActions.changeVisibility
    @param {Object} e Event object from
    {{#crossLink "FlexberryDdauCheckboxComponent/sendingActions.change:method"}}flexberry-ddau-checkbox 'change' action{{/crossLink}}.
  */

  /**
    Component's action invoking when user wants to add child layer into current.

    @method sendingActions.addChild
    @param {Object} e Action's event object.
    @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
    which describes event that triggers this action.
  */

  /**
    Component's action invoking when user wants to edit current layer.

    @method sendingActions.edit
    @param {Object} e Action's event object.
    @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
    which describes event that triggers this action.
  */

  /**
    Component's action invoking when user wants to remove current layer.

    @method sendingActions.remove
    @param {Object} e Action's event object.
    @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
    which describes event that triggers this action.
  */
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryMaplayerComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryMaplayerComponent;
