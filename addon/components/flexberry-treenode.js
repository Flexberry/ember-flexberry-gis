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
import layout from '../templates/components/flexberry-treenode';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's hbs-markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-treenode').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name (null because component hasn't wrapping <div>).
  @property {String} flexberryClassNames.treeNodeExpandCollapseIcon Component's expand/collapse icon CSS-class name ('flexberry-treenode-expand-collapse-icon').
  @property {String} flexberryClassNames.treeNodeHeader Component's header <div> CSS-class name ('flexberry-treenode-header').
  @property {String} flexberryClassNames.treeNodeContent Component's content <div> CSS-class name ('flexberry-treenode-content').
  @readonly
  @static

  @for FlexberryTreenodeComponent
*/
const flexberryClassNamesPrefix = 'flexberry-treenode';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null,
  treeNodePreventExpandCollapse: flexberryClassNamesPrefix + '-prevent-expand-collapse',
  treeNodeExpandCollapseIcon: flexberryClassNamesPrefix + '-expand-collapse-icon',
  treeNodeHeader: flexberryClassNamesPrefix + '-header',
  treeNodeContent: flexberryClassNamesPrefix + '-content'
};

/**
  Flexberry tree node component with [Semantic UI accordion](http://semantic-ui.com/modules/accordion.html) style.
  Component must be used in combination with {{#crossLink "FlexberryTreeComponent"}}flexberry-tree component{{/crossLink}}
  as a wrapper for those tree nodes, which are placed on the same tree level.

  Usage:
  templates/my-form.hbs
  ```handlebars
  {{#flexberry-tree exclusive=false}}
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

  @class FlexberryTreenodeComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses RequiredActionsMixin
  @uses DomActionsMixin
  @uses DynamicPropertiesMixin
  @uses DynamicActionsMixin
  @uses DynamicProxyActionsMixin
  @uses DynamicComponentsMixin
*/
let FlexberryTreenodeComponent = Ember.Component.extend(
  RequiredActionsMixin,
  DomActionsMixin,
  DynamicPropertiesMixin,
  DynamicActionsMixin,
  DynamicProxyActionsMixin,
  DynamicComponentsMixin, {

  /**
    Name of component that will be used to display child nodes subtree.

    @property _subtreeComponentName
    @type String
    @default 'flexberry-tree'
    @private
  */
  _subtreeComponentName: 'flexberry-tree',

  /**
    Name of component's property in which child nodes (defined as JSON objects) are stored.

    @property _subtreeNodesPropertyName
    @type String
    @default 'nodes'
    @private
  */
  _subtreeNodesPropertyName: 'nodes',

  /**
    Object containing dynamicProperties for child nodes subtree component.

    @property _subtreeProperties
    @type Object
    @default null
    @private
  */
  _subtreeProperties: null,

  /**
    Flag: indicates whether some {{#crossLink "FlexberryTreenodeComponent/nodes:property"}}child 'nodes'{{/childNodes}} are defined.

    @property _hasNodes
    @type boolean
    @default null
    @private
  */
  _hasNodes: null,

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
    Tree node's caption (will be displayed in node's header).

    @property caption
    @type String
    @default null
  */
  caption: null,

  /**
    Flag: indicates whether tree node is in readonly mode.
    If true, tree node's data-related UI will be in readonly mode.

    @property readonly
    @type Boolean
    @default false
  */
  readonly: false,

  /**
    Child nodes.
    This property is optional and must be used when there are too many child nodes,
    and you don't want to define them explicitly in the .hbs markup,
    then you can define nodes array somewhere in code & pass defined array to this component's property.

    @property nodes
    @type FlexberryTreenodeObject[]
    @default null
  */
  nodes: null,

  actions: {
    /**
      Handles tree node header's 'click' event.
      Prevents 'click' event from bubbling for leaf nodes.
      Invokes component's {{#crossLink "FlexberryTreenodeComponent/sendingActions.headerClick:method"}}'headerClick'{{/crossLink}} action.
      Invokes component's {{#crossLink "FlexberryTreenodeComponent/sendingActions.beforeExpand:method"}}'beforeExpand'{{/crossLink}} action.
      Invokes component's {{#crossLink "FlexberryTreenodeComponent/sendingActions.beforeCollapse:method"}}'beforeCollapse'{{/crossLink}} action.

      @method actions.onHeaderClick
      @param {Boolean} nodeHasNestedContent Flag: indicates whether clicked node has some nested content or not.
      @param {Object} [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes Inner header element's 'click' event.
    */
    onHeaderClick(nodeHasNestedContent, e) {
      // Send 'headerClick' action anyway.
      this.sendAction('headerClick', {
        originalEvent: e
      });

      // As the 'click' event-target here could be passed any inner element nested inside node's header
      // (even some inner elements of dynamic components nested inside node),
      // that's why we should check for a special class-name in event-target itself & in it's parent elements.
      let $clickTarget = Ember.$(e.target);
      let clickTargetShouldPreventExpandCollapse = $clickTarget.hasClass(flexberryClassNames.treeNodePreventExpandCollapse);
      if (!clickTargetShouldPreventExpandCollapse)  {
        clickTargetShouldPreventExpandCollapse = $clickTarget.parents().hasClass(flexberryClassNames.treeNodePreventExpandCollapse);
      }

      // Prevent node header's click event from bubbling to disable expand/collapse animation in the following situations:
      // if click event-target is element containing special class-name preventing node from expanding/collapsing,
      // if node is leaf (node without nested content).
      if (clickTargetShouldPreventExpandCollapse || !nodeHasNestedContent) {
        e.stopPropagation();

        return;
      }

      let expandedNodeClassName = Ember.$.fn.accordion.settings.className.active;
      if (Ember.$(e.currentTarget).hasClass(expandedNodeClassName)) {
        this.sendAction('beforeCollapse', {
          originalEvent: e
        });
      } else {
        this.sendAction('beforeExpand', {
          originalEvent: e
        });
      }
    }
  },

  /**
    Observers changes in component's property with
    {{#crossLink "FlexberyTreenodeComponent/_subtreeNodesPropertyName:property"}}specified name{{/crossLink}},
    updates {{#crossLink "FlexberyTreenodeComponent/_hasNodes:property"}}'_hasNodes' property{{/crossLink}},
    and {{#crossLink "FlexberyTreenodeComponent/_subtreeProperties:property"}}'_subtreeProperties' property{{/crossLink}}.

    @method _subtreeNodesDidChange
    @private
  */
  _subtreeNodesDidChange: null,

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    // Name of property in which child nodes should be stored.
    let subtreeNodesPropertyName = this.get('_subtreeNodesPropertyName');

    // Initialize properties object, which will be passed to child nodes subtree component.
    this.set('_subtreeProperties', {});

    let subtreeNodesDidChange = () => {
      let nodes = this.get(subtreeNodesPropertyName);

      let subtreeProperties = this.get('_subtreeProperties');
      if (Ember.get(subtreeProperties, subtreeNodesPropertyName) !== subtreeProperties) {
        Ember.set(subtreeProperties, subtreeNodesPropertyName, nodes);
      }

      this.set('_hasNodes', Ember.isArray(nodes) && nodes.length > 0);
    };
    subtreeNodesDidChange();

    this.set('_subtreeNodesDidChange', subtreeNodesDidChange);
    this.addObserver(`${subtreeNodesPropertyName}.[]`, subtreeNodesDidChange);
  },

  /**
    Destroys component.
  */
  willDestroy() {
    this._super(...arguments);

    // Name of property in which child nodes should be stored.
    let subtreeNodesPropertyName = this.get('_subtreeNodesPropertyName');

    let subtreeNodesDidChange = this.get('_subtreeNodesDidChange');
    this.removeObserver(`${subtreeNodesPropertyName}.[]`, subtreeNodesDidChange);
  }

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
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryTreenodeComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryTreenodeComponent;
