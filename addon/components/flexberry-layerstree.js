/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/flexberry-layerstree';
import FlexberryTreeComponent from './flexberry-tree';
import FlexberryLayersTreenodeComponent from './flexberry-layerstreenode';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-layerstree').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-layerstree').
  @readonly
  @static
*/
const flexberryClassNamesPrefix = 'flexberry-layerstree';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix
};

/**
  Flexberry layers tree component with [Semantic UI accordion](http://semantic-ui.com/modules/accordion.html) style
  and ["Data Down Actions UP (DDAU)" pattern](https://emberway.io/ember-js-goodbye-mvc-part-1-21777ecfd708) one way bindings.
  Component doesn't mutate passed data by its own, it only invokes actions,
  which signalizes to the route, controller, or another component, that passed data should be mutated.
  Component must be used in combination with {{#crossLink "FlexberryLayersTreenodeComponent"}}flexberry-layerstreenode component{{/crossLink}},
  because it's only a wrapper for those tree layers, which are placed on the same tree level.

  Usage:
  templates/my-form-in-hbs.hbs
  ```handlebars
  {{#flexberry-layerstree}}
    {{#flexberry-layerstreenode
      name="hbsLayer1 (it is not a leaf)"
      type="wms"
      visibility=true
    }}
      {{#flexberry-layerstree}}
        {{#flexberry-layerstreenode
          name="hbsLayer1.1 (it is not a leaf)"
          type="tile"
          visibility=true
        }}
          {{#flexberry-layerstree}}
            {{flexberry-layerstreenode
              name="hbsLayer1.1.1 (it is a leaf)"
              type="wms"
              visibility=true
            }}
          {{/flexberry-layerstree}}
        {{/flexberry-layerstreenode}}
        {{flexberry-layerstreenode
          name="hbsLayer1.2 (it is a leaf)"
          type="wms"
          visibility=true
        }}
      {{/flexberry-layerstree}}
    {{/flexberry-layerstreenode}}
  {{/flexberry-layerstree}}
  ```

  templates/my-form-in-json.hbs
  ```handlebars
  {{flexberry-layerstree
    layers=(get-with-dynamic-actions this "jsonLayersTreeNodes"
      hierarchyPropertyName="layers"
      dynamicActions=(array
        (hash
          on="visibilityChange"
          actionName="onTreenodeVisibilityChange"
          actionArguments=(array "{% propertyPath %}.visibility")
        )
        (hash
          on="headerClick"
          actionName="onTreenodeHeaderClick"
          actionArguments=(array "{% propertyPath %}")
        )
      )
    )
  }}
  ```

  @class FlexberryLayersTreeComponent
  @extends FlexberryTreeComponent
*/
let FlexberryLayersTreeComponent = FlexberryTreeComponent.extend({
  /**
    Flag: indicates whether some {{#crossLink "FlexberryLayersTreeComponent/layers:property"}}tree 'layers'{{/crossLink}} are defined.

    @property _hasLayers
    @type boolean
    @readonly
    @private
  */
  _hasLayers: Ember.computed('layers.[]', function() {
    let layers = this.get('layers');

    return Ember.isArray(layers) && layers.length > 0;
  }),

  /**
    Flag: indicates whether tree isn't placed inside {{#crossLink "FlexberryLayersTreeComponent"}}flexberry-layerstreenode component{{/crossLink}}.

    @property _isNotInsideTreeNode
    @type Boolean
    @readonly
    @private
  */
  _isNotInsideTreeNode: Ember.computed('parentView', function() {
    let parentView = this.get('parentView');

    return !(parentView instanceof FlexberryLayersTreenodeComponent);
  }),

  /**
    Reference to component's template.
  */
  layout,

  /**
    Reference to component's CSS-classes names.
    Must be also a component's instance property to be available from component's .hbs template.
  */
  flexberryClassNames,

  /**
    Component's wrapping <div> CSS-classes names
    (extra to the {{#crossLink "FlexberryTreeComponent/classNames:property"}}base ones{{/crossLink}}).

    Any other CSS-class names can be added through component's 'class' property.
    ```handlebars
    {{#flexberry-layerstree class="styled"}}
      Tree's content
    {{/flexberry-layerstree}}
    ```

    @property classNames
    @type String[]
    @default ['flexberry-layerstree', 'flexberry-tree', 'accordion']
  */
  classNames: [flexberryClassNames.wrapper],

  /**
    Map's layers.
    This property is optional and must be used when there are too many child layers,
    and you don't want to define them explicitly in the .hbs markup,
    then you can define layers array somewhere in code & pass defined array to this component's property.

    @property layers
    @type NewPlatformFlexberryGISMapLayerModel[]
    @default undefined
  */
  layers: undefined
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryLayersTreeComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryLayersTreeComponent;
