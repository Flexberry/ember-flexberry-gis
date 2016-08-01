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
  @property {String} flexberryClassNames.visibilityCheckbox Component's visibility chackbox CSS-class name ('flexberry-maplayer-visibility-checkbox').
  @property {String} flexberryClassNames.typeIcon Component's type icon CSS-class name ('flexberry-maplayer-type-icon').
  @property {Object} flexberryClassNames.baseClassNames Reference to
  {{#crossLink "FlexberryTreenodeComponent/flexberryClassNames:property"}}base class 'flexberryClassNames'{{/crossLink}}.
  @readonly
  @static

  @for FlexberryMaplayerComponent
*/
const flexberryClassNamesPrefix = 'flexberry-maplayer';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null,
  visibilityCheckbox: flexberryClassNamesPrefix + '-visibility-checkbox',
  typeIcon: flexberryClassNamesPrefix + '-type-icon',
  baseClassNames: FlexberryTreenodeComponent.flexberryClassNames
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
    Dynamic properties for layer node's visibility checkbox.

    @property _visibilityCheckboxProperties
    @type Object
    @default null
    @private
  */
  _visibilityCheckboxProperties: null,

  /**
    Observes & handles any changes in
    {{#crossLink "FlexberryMaplayerComponent/visibility:property"}}'visibility' property{{/crossLink}},
    passes actual visibility value to a
    {{#crossLink "FlexberryMaplayerComponent/_visibilityCheckboxProperties:property"}}'_visibilityCheckboxProperties'{{/crossLink}}.

    @method _visibilityDidChange
    @private
  */
  _visibilityDidChange: Ember.on('init', Ember.observer('visibility', function() {
    this.set('_visibilityCheckboxProperties.value', this.get('visibility'));
  })),

  /**
    Dynamic properties for layer node's icon (related to layer type).

    @property _typeIconProperties
    @type Object
    @default null
    @private
  */
  _typeIconProperties: null,

  /**
    Observes & handles any changes in
    {{#crossLink "FlexberryMaplayerComponent/type:property"}}'type' property{{/crossLink}},
    calculates actual icon class dependent on type & passes calculated icon class to a
    {{#crossLink "FlexberryMaplayerComponent/_typeIconProperties:property"}}'_typeIconProperties'{{/crossLink}}.

    @method _visibilityDidChange
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

    this.set('_typeIconProperties.class', flexberryClassNames.typeIcon + ' ' + iconClass);
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

  dynamicComponents: null,

  /**
    Tree node's caption (will be displayed in node's header).

    @property caption
    @type String
    @default null
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

  init() {
    this._super(...arguments);

    // Add default components to layer nodes header.
    let visibilityCheckboxProperties = {
      class: flexberryClassNames.visibilityCheckbox + ' ' + FlexberryTreenodeComponent.flexberryClassNames.treeNodePreventExpandCollapse,
      value: false,
      dynamicProxyActions: Ember.A([{
        on: 'change',
        actionName: 'visibilityChange'
      }, {
        on: 'check',
        actionName: 'becameVisible'
      }, {
        on: 'uncheck',
        actionName: 'becameInvisible'
      }])
    };
    this.set('_visibilityCheckboxProperties', visibilityCheckboxProperties);

    let typeIconProperties = {
      class: flexberryClassNames.typeIcon
    };
    this.set('_typeIconProperties', typeIconProperties);

    let dynamicComponents = this.get('dynamicComponents');
    if (!Ember.isArray(dynamicComponents)) {
      dynamicComponents = Ember.A();
      this.set('dynamicComponents', dynamicComponents);
    }

    dynamicComponents.insertAt(0, {
      to: 'headerStart',
      componentName: 'flexberry-ddau-checkbox',
      componentProperties: visibilityCheckboxProperties
    });

    dynamicComponents.insertAt(1, {
      to: 'headerStart',
      componentName: 'flexberry-icon',
      componentProperties: typeIconProperties
    });
  }

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

    @method sendingActions.visiblilityChange
    @param {Object} e Event object from
    {{#crossLink "FlexberryDdauCheckboxComponent/sendingActions.change:method"}}flexberry-ddau-checkbox 'change' action{{/crossLink}}.
  */

  /**
    Component's action invoking when layer node's 'visibility' state changed to 'visibility=true'.

    @method sendingActions.becameVisible
    @param {Object} e Event object from
    {{#crossLink "FlexberryDdauCheckboxComponent/sendingActions.check:method"}}flexberry-ddau-checkbox 'check' action{{/crossLink}}.
  */

  /**
    Component's action invoking when layer node's 'visibility' state changed to 'visibility=false'.

    @method sendingActions.becameInvisible
    @param {Object} e Event object from
    {{#crossLink "FlexberryDdauCheckboxComponent/sendingActions.uncheck:method"}}flexberry-ddau-checkbox 'uncheck' action{{/crossLink}}.
  */
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryMaplayerComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryMaplayerComponent;
