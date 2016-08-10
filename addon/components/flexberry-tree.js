/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import RequiredActionsMixin from '../mixins/required-actions';
import DomActionsMixin from '../mixins/dom-actions';
import DynamicPropertiesMixin from '../mixins/dynamic-properties';
import DynamicActionsMixin from '../mixins/dynamic-actions';
import DynamicProxyActionsMixin from '../mixins/dynamic-proxy-actions';
import DynamicComponentsMixin from '../mixins/dynamic-components';
import layout from '../templates/components/flexberry-tree';
import { translationMacro as t } from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's hbs-markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-tree').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-tree').
  @readonly
  @static

  @for FlexberryTreenodeComponent
*/
const flexberryClassNamesPrefix = 'flexberry-tree';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix,
  startToolbar: flexberryClassNamesPrefix + '-start-toolbar',
  endToolbar: flexberryClassNamesPrefix + '-end-toolbar',
  placeholder: flexberryClassNamesPrefix + '-placeholder'
};

/**
  Flexberry tree component with [Semantic UI accordion](http://semantic-ui.com/modules/accordion.html) style.
  Component must be used in combination with {{#crossLink "FlexberryTreenodeComponent"}}flexberry-treenode component{{/crossLink}},
  because it's only a wrapper for those tree nodes, which are placed on the same tree level.

  Usage:
  templates/my-form.hbs
  ```handlebars
  {{#flexberry-tree}}
    {{#flexberry-treenode caption="Node 1 (with child nodes)"}}
      Node 1 custom content

      {{#flexberry-tree}}
        {{flexberry-treenode caption="Node 1.1 (leaf node)"}}

        {{#flexberry-treenode caption="Node 1.2 (with child nodes)"}}
          Node 1.2 custom content

          {{#flexberry-tree}}
            {{#flexberry-treenode caption="Node 1.2.1 (with child nodes)"}}
              Node 1.2.1 custom content

              {{#flexberry-tree}}
                {{flexberry-treenode caption="Node 1.2.1.1 (leaf node)"}}
              {{/flexberry-tree}}
            {{/flexberry-treenode}}

            {{flexberry-treenode caption="Node 1.2.2 (leaf node)"}}
          {{/flexberry-tree}}
        {{/flexberry-treenode}}
      {{/flexberry-tree}}
    {{/flexberry-treenode}}

    {{flexberry-treenode caption="Node 2 (leaf node)"}}
  {{/flexberry-tree}}
  ```

  @class FlexberryTreeComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses RequiredActionsMixin
  @uses DomActionsMixin
  @uses DynamicPropertiesMixin
  @uses DynamicActionsMixin
  @uses DynamicProxyActionsMixin
  @uses DynamicComponentsMixin
*/
let FlexberryTreeComponent = Ember.Component.extend(
  RequiredActionsMixin,
  DomActionsMixin,
  DynamicPropertiesMixin,
  DynamicActionsMixin,
  DynamicProxyActionsMixin,
  DynamicComponentsMixin, {

  /**
    Name of component that will be used to display tree nodes.

    @property _treeNodeComponentName
    @type String
    @default 'flexberry-layerstreenode'
    @private
  */
  _treeNodeComponentName: 'flexberry-treenode',

  /**
    Name of component's property in which tree nodes (defined as JSON objects) are stored.

    @property _treeNodesPropertyName
    @type String
    @default 'nodes'
    @private
  */
  _treeNodesPropertyName: 'nodes',

  /**
    Flag: indicates whether tree isn't placed inside {{#crossLink "FlexberryTreenodeComponent"}}flexberry-treenode component{{/crossLink}}.

    @property _isNotInsideTreeNode
    @type Boolean
    @readonly
    @private
  */
  _isNotInsideTreeNode: Ember.computed('targetObject', '_treeNodeComponentName', function() {
    let targetObject = this.get('targetObject');
    let treeNodeComponentName = this.get('_treeNodeComponentName');
    let treeNodeComponentClass = Ember.getOwner(this)._lookupFactory(`component:${treeNodeComponentName}`);

    return !(targetObject instanceof treeNodeComponentClass);
  }),

  /**
    Flag: indicates whether some {{#crossLink "FlexberryTreeComponent/nodes:property"}}tree 'nodes'{{/childNodes}} are defined.

    @property _hasNodes
    @type boolean
    @default null
    @private
  */
  _hasNodes: null,

  /**
    Flag: indicates whether tree start toolbar has some nested components.

    @property _startToolbarHasComponents
    @type boolean
    @readOnly
    @private
  */
  _startToolbarHasComponents: Ember.computed(
    '_dynamicComponents.startToolbarLeft.[]',
    '_dynamicComponents.startToolbarLeft.@each.visible',
    '_dynamicComponents.startToolbarRight.[]',
    '_dynamicComponents.startToolbarRight.@each.visible',
    function() {
      let leftPartHasComponents = this.get('_dynamicComponents.startToolbarLeft.length') > 0 &&
        this.get('_dynamicComponents.startToolbarLeft').every((dynamicComponent) => {
          return dynamicComponent.visible !== false;
        });
      let rightPartHasComponents = this.get('_dynamicComponents.startToolbarRight.length') > 0 &&
        this.get('_dynamicComponents.startToolbarRight').every((dynamicComponent) => {
          return dynamicComponent.visible !== false;
        });

      return leftPartHasComponents || rightPartHasComponents;
    }
  ),

  /**
    Flag: indicates whether tree end toolbar has some nested components.

    @property _endToolbarHasComponents
    @type boolean
    @readOnly
    @private
  */
  _endToolbarHasComponents: Ember.computed(
    '_dynamicComponents.endToolbarLeft.[]',
    '_dynamicComponents.endToolbarLeft.@each.visible',
    '_dynamicComponents.endToolbarRight.[]',
    '_dynamicComponents.endToolbarRight.@each.visible',
    function() {
      let leftPartHasComponents = this.get('_dynamicComponents.endToolbarLeft.length') > 0 &&
        this.get('_dynamicComponents.endToolbarLeft').every((dynamicComponent) => {
          return dynamicComponent.visible !== false;
        });
      let rightPartHasComponents = this.get('_dynamicComponents.endToolbarRight.length') > 0 &&
        this.get('_dynamicComponents.endToolbarRight').every((dynamicComponent) => {
          return dynamicComponent.visible !== false;
        });

      return leftPartHasComponents || rightPartHasComponents;
    }
  ),

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
    Component's wrapping <div> CSS-classes names.

    Any other CSS-class names can be added through component's 'class' property.
    ```handlebars
    {{#flexberry-tree class="styled"}}
      Tree's content
    {{/flexberry-tree}}
    ```

    @property classNames
    @type String[]
    @default ['flexberry-tree', 'accordion']
  */
  classNames: [flexberryClassNames.wrapper, 'accordion'],

  /**
    Component's wrapping <div>
    <a href="http://emberjs.com/api/classes/Ember.Component.html#property_classNameBindings">CSS-classes names bindings</a>.

    @property classNameBindings
    @type String[]
    @default ['_isNotInsideTreeNode:ui']
  */
  classNameBindings: ['_isNotInsideTreeNode:ui'],

  /**
    Component's placeholder.
    Will be displayed if tree nodes are not defined.

    @property placeholder
    @type String
    @default t('components.flexberry-tree.placeholder')
  */
  placeholder: t('components.flexberry-tree.placeholder'),

  /**
    Flag: indicates whether only one tree node can be expanded at the same time.
    If true, all expanded tree nodes will be automatically collapsed, on some other node expand.

    @property exclusive
    @type Boolean
    @default false
  */
  exclusive: false,

  /**
    Flag: indicates whether it is allowed for already expanded tree nodes to collapse.

    @property collapsible
    @type Boolean
    @default true
  */
  collapsible: true,

  /**
    Flag: indicates whether nested child nodes content opacity should be animated
    (if true, it may cause performance issues with many nested child nodes).

    @property animateChildren
    @type Boolean
    @default false
  */
  animateChildren: false,

  /**
    Tree nodes expand/collapse animation duration in milliseconds.

    @property animationDuration
    @type Number
    @default 350
  */
  duration: 350,

  /**
    Flag: indicates whether tree is in readonly mode.
    If true, tree nodes data-related UI will be in readonly mode.

    @property readonly
    @type Boolean
    @default false
  */
  readonly: false,

  /**
    Tree nodes.
    This property is optional and must be used when there are too many child nodes,
    and you don't want to define them explicitly in the .hbs markup,
    then you can define nodes array somewhere in code & pass defined array to this component's property.

    @property nodes
    @type FlexberryTreenodeObject[]
    @default null
  */
  nodes: null,

  /**
    Initializes [Semantic UI accordion](http://semantic-ui.com/modules/accordion.html) on component's wrapping <div>
    depending on following component's accordion-related properties:
    {{crossLink "FlexberryTreeComponent/exclusive:property"}}'exclusive'{{/crossLink}},
    {{crossLink "FlexberryTreeComponent/collapsible:property"}}'collapsible'{{/crossLink}},
    {{crossLink "FlexberryTreeComponent/animateChildren:property"}}'animateChildren'{{/crossLink}},
    {{crossLink "FlexberryTreeComponent/duration:property"}}'duration'{{/crossLink}}

    @method _initializeAccordion
    @private
  */
  _initializeAccordion() {
    let isNotInsideTreeNode = this.get('_isNotInsideTreeNode');
    if (isNotInsideTreeNode) {
      this.$().accordion({
        exclusive: this.get('exclusive'),
        collapsible: this.get('collapsible'),
        animateChildren: this.get('animateChildren'),
        duration: this.get('duration')
      });
    }
  },

  /**
    Destroys [Semantic UI accordion](http://semantic-ui.com/modules/accordion.html) on component's wrapping <div>.

    @method _destroyAccordion
    @private
  */
  _destroyAccordion() {
    let isNotInsideTreeNode = this.get('_isNotInsideTreeNode');
    if (isNotInsideTreeNode) {
      this.$().accordion('destroy');
    }
  },

  /**
    Collapses component's parent node.

    @method _collapseParentNode
    @private
  */
  _collapseParentNode() {
    let isNotInsideTreeNode = this.get('_isNotInsideTreeNode');
    if (isNotInsideTreeNode) {
      return;
    }

    let treeNodeComponentName = this.get('_treeNodeComponentName');
    let treeNodeComponent = Ember.getOwner(this)._lookupFactory(`component:${treeNodeComponentName}`);
    let expandedTreeNodeClass = Ember.$.fn.accordion.settings.className.active;

    let $parentNodeContent = Ember.$(this.$().parents(`.${treeNodeComponent.flexberryClassNames.treeNodeContent}`)[0]);
    if ($parentNodeContent.hasClass(expandedTreeNodeClass)) {
      $parentNodeContent.removeClass(expandedTreeNodeClass);
    }

    let $parentNodeHeader = Ember.$($parentNodeContent.prev(`.${treeNodeComponent.flexberryClassNames.treeNodeHeader}`)[0]);
    if ($parentNodeHeader.hasClass(expandedTreeNodeClass)) {
      $parentNodeHeader.removeClass(expandedTreeNodeClass);
    }
  },

  /**
    Reinitializes [Semantic UI accordion](http://semantic-ui.com/modules/accordion.html) on component's wrapping <div>
    when following component's accordion-related properties changed:
    {{crossLink "FlexberryTreeComponent/exclusive:property"}}'exclusive'{{/crossLink}},
    {{crossLink "FlexberryTreeComponent/collapsible:property"}}'collapsible'{{/crossLink}},
    {{crossLink "FlexberryTreeComponent/animateChildren:property"}}'animateChildren'{{/crossLink}},
    {{crossLink "FlexberryTreeComponent/duration:property"}}'duration'{{/crossLink}}

    @method _accordionPropertiesDidChange
    @private
  */
  _accordionPropertiesDidChange: Ember.observer(
    'exclusive',
    'collapsible',
    'animateChildren',
    'duration',
    function() {
      // Reinitialize Semantic UI accordion module to change it's settings.
      this._initializeAccordion();
  }),

  /**
    Observers changes in component's property with
    {{#crossLink "FlexberyTreeComponent/_treeNodesPropertyName:property"}}specified name{{/crossLink}},
    updates {{#crossLink "FlexberyTreeComponent/_hasNodes:property"}}'_hasNodes' property{{/crossLink}}.

    @method _treeNodesDidChange
    @private
  */
  _treeNodesDidChange: null,

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    // Name of property in which child nodes should be stored.
    let treeNodesPropertyName = this.get('_treeNodesPropertyName');

    let treeNodesDidChange = () => {
      let nodes = this.get(treeNodesPropertyName);

      this.set('_hasNodes', Ember.isArray(nodes) && nodes.length > 0);
    };
    treeNodesDidChange();

    this.set('_treeNodesDidChange', treeNodesDidChange);
    this.addObserver(`${treeNodesPropertyName}.[]`, treeNodesDidChange);
  },

  /**
    Destroys component.
  */
  willDestroy() {
    this._super(...arguments);

    // Name of property in which child nodes should be stored.
    let treeNodesPropertyName = this.get('_treeNodesPropertyName');

    let treeNodesDidChange = this.get('_treeNodesDidChange');
    this.removeObserver(`${treeNodesPropertyName}.[]`, treeNodesDidChange);
  },

  /**
    Initializes DOM-related component's properties.
  */
  didInsertElement() {
    this._super(...arguments);

    // Initialize Semantic UI accordion.
    this._initializeAccordion();
  },

  /**
    Destroys DOM-related component's properties.
  */
  willDestroyElement() {
    this._super(...arguments);

    // Destroy Semantic UI accordion.
    this._destroyAccordion();

    // Collapse parent node (if tree is destroyed then parent node hasn't child nodes anymore).
    this._collapseParentNode();
  }
});


// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryTreeComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryTreeComponent;
