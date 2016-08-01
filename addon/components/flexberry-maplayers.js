/**
  @module ember-flexberry-gis
*/

import FlexberryTreeComponent from './flexberry-tree';

// Use base component's layout without changes.
import layout from '../templates/components/flexberry-tree';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's hbs-markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-maplayers').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name (null).
  @property {Object} flexberryClassNames.baseClassNames Reference to
  {{#crossLink "FlexberryTreeComponent/flexberryClassNames:property"}}base class 'flexberryClassNames'{{/crossLink}}.
  @readonly
  @static

  @for FlexberryMaplayersComponent
*/
const flexberryClassNamesPrefix = 'flexberry-maplayers';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null,
  baseClassNames: FlexberryTreeComponent.flexberryClassNames
};

/**
  Flexberry layers tree based on {{#crossLink "FlexberryTreeComponent"}}flexberry-tree component{{/crossLink}}.
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
  @extends FlexberryTreeComponent
*/
let FlexberryMaplayersComponent = FlexberryTreeComponent.extend({
  /**
    Name of component that will be used to display tree nodes.

    @property _treeNodeComponentName
    @type String
    @default 'flexberry-maplayer'
    @private
  */
  _treeNodeComponentName: 'flexberry-maplayer',

  /**
    Name of component's property in which tree nodes (defined as JSON objects) are stored.

    @property _treeNodesPropertyName
    @type String
    @default 'layers'
    @private
  */
  _treeNodesPropertyName: 'layers',

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
    Component's wrapping <div> CSS-classes names
    (extra to the {{#crossLink "FlexberryTreeComponent/classNames:property"}}base ones{{/crossLink}}).
    Any other CSS-class names can be added through component's 'class' property.
    ```handlebars
    {{#flexberry-maplayers class="styled"}}
      Tree's content
    {{/flexberry-maplayers}}
    ```
    @property classNames
    @type String[]
    @default ['flexberry-maplayers']
  */
  classNames: [flexberryClassNames.wrapper],

  /**
    Map's layers.
    This property is optional and must be used when there are too many child layers,
    and you don't want to define them explicitly in the hbs-markup,
    then you can define layers array somewhere in code & pass defined array to this component's property.

    @property layers
    @type Object[]
    @default null
  */
  layers: null
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryMaplayersComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryMaplayersComponent;
