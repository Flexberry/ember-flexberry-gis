/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import FlexberryLayersTreeComponentMixin from '../mixins/flexberry-layerstree-component';
import layout from '../templates/components/flexberry-layerstreenode';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-layerstreenode').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name (null because component hasn't wrapping <div>).
  @property {String} flexberryClassNames.treeNodeContent Component's content <div> CSS-class name ('flexberry-treenode-content').
  @readonly
  @static

  @for FlexberryLayersTreeNodeComponent
*/
const flexberryClassNamesPrefix = 'flexberry-layerstreenode';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null,
  treeNodeContent: flexberryClassNamesPrefix + '-content'
};

/**
  Flexberry layers tree component with [Semantic UI accordion](http://semantic-ui.com/modules/accordion.html) style
  and ["Data Down Actions Up (DDAU)" pattern](https://emberway.io/ember-js-goodbye-mvc-part-1-21777ecfd708) one way bindings.
  Component doesn't mutate passed data by its own, it only invokes actions,
  which signalizes to the route, controller, or another component, that passed data should be mutated.
  Component must be used in combination with {{#crossLink "FlexberryLayersTreeComponent"}}flexberry-layerstree component{{/crossLink}}
  as a wrapper for those layer tree nodes, which are placed on the same tree level.

  Usage:
  templates/my-form-in-hbs.hbs
  ```handlebars
  {{#flexberry-layerstree}}
    {{#flexberry-layerstreenode
      name=hbsTreeNodes.0.name
      type=hbsTreeNodes.0.type
      visibility=hbsTreeNodes.0.visibility
      headerClick=(action "onLayersTreenodeHeaderClick" "hbsTreeNodes.0")
      visibilityChange=(action "onLayersTreenodeVisibilityChange" "hbsTreeNodes.0.visibility")
    }}
      {{#flexberry-layerstree}}
        {{#flexberry-layerstreenode
          name=hbsTreeNodes.0.layers.0.name
          type=hbsTreeNodes.0.layers.0.type
          visibility=hbsTreeNodes.0.layers.0.visibility
          headerClick=(action "onLayersTreenodeHeaderClick" "hbsTreeNodes.0.layers.0")
          visibilityChange=(action "onLayersTreenodeVisibilityChange" "hbsTreeNodes.0.layers.0.visibility")
        }}
          {{#flexberry-layerstree}}
            {{flexberry-layerstreenode
              name=hbsTreeNodes.0.layers.0.layers.0.name
              type=hbsTreeNodes.0.layers.0.layers.0.type
              visibility=hbsTreeNodes.0.layers.0.layers.0.visibility
              headerClick=(action "onLayersTreenodeHeaderClick" "hbsTreeNodes.0.layers.0.layers.0")
              visibilityChange=(action "onLayersTreenodeVisibilityChange" "hbsTreeNodes.0.layers.0.layers.0.visibility")
            }}
          {{/flexberry-layerstree}}
        {{/flexberry-layerstreenode}}
        {{flexberry-layerstreenode
          name=hbsTreeNodes.0.layers.1.name
          type=hbsTreeNodes.0.layers.1.type
          visibility=hbsTreeNodes.0.layers.1.visibility
          headerClick=(action "onLayersTreenodeHeaderClick" "hbsTreeNodes.0.layers.1")
          visibilityChange=(action "onLayersTreenodeVisibilityChange" "hbsTreeNodes.0.layers.1.visibility")
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
          actionName="onLayersTreenodeVisibilityChange"
          actionArguments=(array "{% propertyPath %}.visibility")
        )
        (hash
          on="headerClick"
          actionName="onLayersTreenodeHeaderClick"
          actionArguments=(array "{% propertyPath %}")
        )
      )
    )
  }}
  ```

  @class FlexberryLayersTreenodeComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses FlexberryLayersTreeComponentMixin
*/
let FlexberryLayersTreeNodeComponent = Ember.Component.extend(FlexberryLayersTreeComponentMixin, {
  /**
    CSS-classes names for a tree node's icon.
    Will be used as <i class=...></i> class attribute if defined & not blank.

    @property _iconClass
    @type boolean
    @readonly
    @private
  */
  _iconClass: Ember.computed('type', function() {
    let type = this.get('type');
    return this.getIconClassByType(type);
  }),

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
    An array of dynamic actions that are set for node.
    Conversion is necessary because names of actions differs for
    {{#crossLink "FlexberryLayersTreeComponent"}}{{/crossLink}} and
    {{#crossLink "FlexberryTreeComponent"}}{{/crossLink}}.

    @property _convertedDynamicActions
    @readonly
    @private
  */
  _convertedDynamicActions: Ember.computed('dynamicActions', function() {
    let dynamicActions = this.get('dynamicActions');

    if (!dynamicActions || !Ember.isArray(dynamicActions)) {
      return null;
    }

    if (dynamicActions.length <= 0) {
      return [];
    }

    let nodesDynamicActions = dynamicActions.map((dynamicAction) => {
      let dynamicActionOn = dynamicAction.on;
      switch (dynamicActionOn) {
        case 'visibilityChange':
          dynamicActionOn = 'checkboxChange';
          break;
        case 'becameVisible':
          dynamicActionOn = 'checkboxCheck';
          break;
        case 'becameInvisible':
          dynamicActionOn = 'checkboxUncheck';
          break;
      }

      dynamicAction.on = dynamicActionOn;
      return dynamicAction;
    });
    return nodesDynamicActions;
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
    Overridden [tag name property](http://emberjs.com/api/classes/Ember.Component.html#property_tagName).
    Is blank to disable component's wrapping <div>.

    @property tagName
    @type String
    @default ''
  */
  tagName:'',

  /**
    Layer's name (will be displayed near node).

    @property name
    @type String
  */
  name: undefined,

  /**
    Layer's type (depending on it icon mark is selected).

    @property type
    @type String
  */
  type: undefined,

  /**
    Layer's visibility.

    @property visibility
    @type Boolean
    @default false
  */
  visibility: false,

  /**
    Layer's settings.

    @property settings
    @type String
  */
  settings: undefined,

  /**
    Layer's coordinate reference system.

    @property coordinateReferenceSystem
    @type String
  */
  coordinateReferenceSystem: undefined,

  /**
    Child layers.
    This property is optional and must be used when there are too many child layers,
    and you don't want to define them explicitly in the .hbs markup,
    then you can define layers array somewhere in code & pass defined array to this component's property.

    @property layers
    @type NewPlatformFlexberryGISMapLayerModel[]
  */
  layers: undefined,

  /**
    Component's action invoking when tree node's header has been clicked.

    @method sendingActions.headerClick
    @param {Object} e Action's event object.
    @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
    which describes event that triggers this action.
  */

  /**
    Component's action invoking before node will be expanded.
    Node can be prevented from being expanded with call to action event object's 'originalEvent.stopPropagation()'.

    @method sendingActions.beforeExpand
    @param {Object} e Action's event object.
    @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
    which describes event that triggers node's expanding.
  */

  /**
    Component's action invoking before node will be collapsed.
    Node can be prevented from being collapsed with call to action event object's 'originalEvent.stopPropagation()'.

    @method sendingActions.beforeCollapse
    @param {Object} e Action's event object.
    @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
    which describes event that triggers node's collapsing.
  */

  /**
    Component's action invoking when tree node's 'visible' state changed.

    @method sendingActions.visiblilityChange
    @param {Object} e Event object from
    {{#crossLink "FlexberryDdauCheckboxComponent/sendingActions.change:method"}}flexberry-ddau-checkbox 'change' action{{/crossLink}}.
  */

  /**
    Component's action invoking when tree node's 'visible' state changed to 'visible=true'.

    @method sendingActions.becameVisible
    @param {Object} e Event object from
    {{#crossLink "FlexberryDdauCheckboxComponent/sendingActions.check:method"}}flexberry-ddau-checkbox 'check' action{{/crossLink}}.
  */

  /**
    Component's action invoking when tree node's 'visible' state changed to 'visible=false'.

    @method sendingActions.becameInvisible
    @param {Object} e Event object from
    {{#crossLink "FlexberryDdauCheckboxComponent/sendingActions.uncheck:method"}}flexberry-ddau-checkbox 'uncheck' action{{/crossLink}}.
  */
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryLayersTreeNodeComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryLayersTreeNodeComponent;
