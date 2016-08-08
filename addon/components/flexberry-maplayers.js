/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import FlexberryTreeComponent from './flexberry-tree';

// Use base component's layout without changes.
import layout from '../templates/components/flexberry-tree';
import { translationMacro as t } from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's hbs-markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.flexberryMaplayers.prefix Component's CSS-class names prefix ('flexberry-maplayers').
  @property {String} flexberryClassNames.flexberryMaplayers.wrapper Component's wrapping <div> CSS-class name (null).
  @property {String} flexberryClassNames.flexberryMaplayers.addChildButton Component's 'add' button CSS-class name ('flexberry-maplayers-add-button').
  @readonly
  @static

  @for FlexberryMaplayersComponent
*/
const flexberryClassNamesPrefix = 'flexberry-maplayers';
const flexberryClassNames = FlexberryTreeComponent.flexberryClassNames;
flexberryClassNames.flexberryMaplayers = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null,
  addChildButton: flexberryClassNamesPrefix + '-add-button'
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
    Component's required actions names.
    For actions enumerated in this array an assertion exceptions will be thrown,
    if actions handlers are not defined for them.

    @property _requiredActions
    @type String[]
    @default ['addChild']
  */
  _requiredActionNames: ['addChild'],

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
    @default '_existingLayers'
    @private
  */
  _treeNodesPropertyName: '_existingLayers',

  /**
    Map's layers filtered by their existence.

    @property _existingLayers
    @type Object[]
    @readOnly
  */
  _existingLayers: Ember.computed('layers.@each.isDeleted', function() {
    let layers = this.get('layers');
    Ember.assert(
      `Wrong type of \`layers\` property: actual type is \`${Ember.typeOf(layers)}\`, ` +
      `but \`Ember.NativeArray\` is expected`,
      Ember.isNone(layers) || Ember.isArray(layers) && Ember.typeOf(layers.filter) === 'function');

    if (!Ember.isArray(layers)) {
      return Ember.A();
    }

    return Ember.A(layers.filter((layer) => {
      return !Ember.isNone(layer) && Ember.get(layer, 'isDeleted') !== true;  
    }));
  }),

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
  classNames: [flexberryClassNames.flexberryMaplayers.wrapper],

  /**
    Component's placeholder.
    Will be displayed if tree nodes are not defined.

    @property placeholder
    @type String
    @default t('components.flexberry-maplayers.placeholder')
  */
  placeholder: t('components.flexberry-maplayers.placeholder'),

  /**
    Map's layers.
    This property is optional and must be used when there are too many child layers,
    and you don't want to define them explicitly in the hbs-markup,
    then you can define layers array somewhere in code & pass defined array to this component's property.

    @property layers
    @type Object[]
    @default null
  */
  layers: null,

  /**
    Observes & handles any changes in
    {{#crossLink "FlexberryMaplayersComponent/readonly:property"}}'readonly' property{{/crossLink}},
    then changes mode for 'add' operation button visibility in
    {{#crossLink "FlexberryMaplayersComponent/_innerDynamicComponents:property"}}'_innerDynamicComponents'{{/crossLink}}.

    @method _readonlyDidChange
    @private
  */
  _readonlyDidChange: Ember.on('init', Ember.observer('readonly', function() {
    let readonly = this.get('readonly') === true;

    // Show/hide flexberry-button for 'add' operation.
    this.set('_innerDynamicComponents.0.visible', !readonly);
  })),

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    // Define additional child components as inner dynamic components (see dynamic-components mixin).
    let innerDynamicComponents = Ember.A([{
      to: 'startToolbarRight',
      componentName: 'flexberry-button',
      componentProperties: {
        class: flexberryClassNames.flexberryMaplayers.addChildButton,
        iconClass: 'plus icon',
        dynamicProxyActions: Ember.A([{
          on: 'click',
          actionName: 'addChild'
        }])
      }
    }]);

    this.set('_innerDynamicComponents', innerDynamicComponents);
  }

  /**
    Component's action invoking when user wants to add child layer into tree's root.

    @method sendingActions.addChild
    @param {Object} e Action's event object.
    @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
    which describes event that triggers this action.
  */
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryMaplayersComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryMaplayersComponent;
