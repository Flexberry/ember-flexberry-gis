/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import FlexberryDdauCheckboxComponent from './flexberry-ddau-checkbox';
import DynamicActionsMixin from '../mixins/dynamic-actions';
import layout from '../templates/components/flexberry-treenode';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-treenode').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name (null because component hasn't wrapping <div>).
  @property {String} flexberryClassNames.treeNodeExpandCollapseIcon Component's expand/collapse icon CSS-class name ('flexberry-treenode-expand-collapse-icon').
  @property {String} flexberryClassNames.treeNodeCheckbox Component's checkbox CSS-class name('flexberry-treenode-checkbox').
  @property {String} flexberryClassNames.treeNodeIcon Component's icon CSS-class name ('flexberry-treenode-icon').
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
  treeNodeExpandCollapseIcon: flexberryClassNamesPrefix + '-expand-collapse-icon',
  treeNodeCheckbox: flexberryClassNamesPrefix + '-checkbox',
  treeNodeIcon: flexberryClassNamesPrefix + '-icon',
  treeNodeHeader: flexberryClassNamesPrefix + '-header',
  treeNodeContent: flexberryClassNamesPrefix + '-content'
};

/**
  Flexberry tree node component with [Semantic UI accordion](http://semantic-ui.com/modules/accordion.html) style
  and ["Data Down Actions Up (DDAU)" pattern](https://emberway.io/ember-js-goodbye-mvc-part-1-21777ecfd708) one way bindings.
  Component doesn't mutate passed data by its own, it only invokes actions,
  which signalizes to the route, controller, or another component, that passed data should be mutated.
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
  @uses DynamicActionsMixin
*/
let FlexberryTreenodeComponent = Ember.Component.extend(DynamicActionsMixin, {
  /**
    Flag: indicates whether some {{#crossLink "FlexberryTreenodeComponent/nodes:property"}}child 'nodes'{{/childNodes}} are defined.

    @property _hasNodes
    @type boolean
    @readonly
    @private
  */
  _hasNodes: Ember.computed('nodes.[]', function() {
    let nodes = this.get('nodes');

    return Ember.isArray(nodes) && nodes.length > 0;
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
  tagName: '',

  /**
    Tree node's caption (will be displayed near node).

    @property caption
    @type String
    @default null
  */
  caption: null,

  // TODO: move inner element's customizations into mixin,
  // which will be able to add custom CSS-classes to component's inner element's
  // by their flexberry-... CSS-class names: ['flexberry-treenode-icon:map icon', 'flexberry-treenode-checkbox:toggle', ...].
  // Some kind of class names bindings for elements with flexberry CSS-class names.
  /**
    CSS classes names for a tree node's icon.
    Will be used as <i class=...></i> class attribute if defined & not blank.

    @property iconClass
    @type String
    @default ''
  */
  iconClass: '',

  /**
    Flag: indicates whether tree node has
    {{#crossLink "FlexberryDdauCheckboxComponent"}}flexberry-ddau-checkbox component{{/crossLink}} or not.

    @property showCheckbox
    @type Boolean
    @default false
  */
  hasCheckbox: false,

  /**
    Flag: indicates whether tree node has child nodes that are displayed by other component.

    @property hasNodesOuter
    @type Boolean
    @default false
  */
  hasNodesOuter: false,

  /**
    Value binded to tree node's
    {{#crossLink "FlexberryDdauCheckboxComponent"}}flexberry-ddau-checkbox component{{/crossLink}}
    (if {{#crossLink "FlexberryTreenodeComponent/hasCheckbox:property"}}flexberry-ddau-checkbox 'hasCheckbox' property{{/crossLink}} is true).

    @property value
    @type Boolean
    @default false
  */
  checkboxValue: false,

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
      Prevents 'click' event from bubbling for leaf nodes & for nodes which were clicked on nested checkboxes.
      Invokes component's {{#crossLink "FlexberryTreenodeComponent/sendingActions.headerClick:method"}}'headerClick'{{/crossLink}} action.
      Invokes component's {{#crossLink "FlexberryTreenodeComponent/sendingActions.beforeExpand:method"}}'beforeExpand'{{/crossLink}} action.
      Invokes component's {{#crossLink "FlexberryTreenodeComponent/sendingActions.beforeCollapse:method"}}'beforeCollapse'{{/crossLink}} action.

      @method actions.onHeaderClick
      @param {Boolean} nodeHasNestedContent Flag: indicates whether clicked node has some nested content or not.
      @param {Object} [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes Inner header element's 'click' event.
    */
    onHeaderClick(nodeHasNestedContent, e) {
      // As the 'click' event target here could be passed either checkbox wrapping <div>,
      // or any inner element nested inside checkbox,
      // that's why we should check not for a class names equality, but only for a class name prefixes equality.
      let clickTargetIsCheckbox = Ember.$(e.target).hasClass({
        withPrefix: FlexberryDdauCheckboxComponent.flexberryClassNames.prefix
      });

      if (!clickTargetIsCheckbox) {
        this.sendAction('headerClick', {
          originalEvent: e
        });
      }

      // Prevent node header's click event from bubbling to disable expand/collapse animation in the following situations:
      // if node was clicked on nested checkbox click,
      // if node is leaf (node without nested content).
      if (clickTargetIsCheckbox || !nodeHasNestedContent) {
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
    },

    /**
      Handles {{#crossLink "FlexberryDdauCheckboxComponent/sendingActions.change:method"}}flexberry-ddau-checkbox 'change' action{{/crossLink}}.
      Invokes component's {{#crossLink "FlexberryTreenodeComponent/sendingActions.checkboxChange:method"}}'checkboxChange'{{/crossLink}} action.

      @method actions.onCheckboxChange
      @param {Object} e Event object from
      {{#crossLink "FlexberryDdauCheckboxComponent/sendingActions.change:method"}}flexberry-ddau-checkbox 'change' action{{/crossLink}}.
    */
    onCheckboxChange(e) {
      this.sendAction('checkboxChange', e);

      // Return false to prevent 'change' action bubbling.
      return false;
    },

    /**
      Handles {{#crossLink "FlexberryDdauCheckboxComponent/sendingActions.check:method"}}flexberry-ddau-checkbox 'check' action{{/crossLink}}.
      Invokes component's {{#crossLink "FlexberryTreenodeComponent/sendingActions.checkboxCheck:method"}}'checkboxCheck'{{/crossLink}} action.

      @method actions.onCheckboxChange
      @param {Object} e Event object from
      {{#crossLink "FlexberryDdauCheckboxComponent/sendingActions.check:method"}}flexberry-ddau-checkbox 'check' action{{/crossLink}}.
    */
    onCheckboxCheck(e) {
      this.sendAction('checkboxCheck', e);

      // Return false to prevent 'check' action bubbling.
      return false;
    },

    /**
      Handles {{#crossLink "FlexberryDdauCheckboxComponent/sendingActions.uncheck:method"}}flexberry-ddau-checkbox 'uncheck' action{{/crossLink}}.
      Invokes component's {{#crossLink "FlexberryTreenodeComponent/sendingActions.checkboxUncheck:method"}}'checkboxUncheck'{{/crossLink}} action.

      @method actions.onCheckboxChange
      @param {Object} e Event object from
      {{#crossLink "FlexberryDdauCheckboxComponent/sendingActions.uncheck:method"}}flexberry-ddau-checkbox 'uncheck' action{{/crossLink}}.
    */
    onCheckboxUncheck(e) {
      this.sendAction('checkboxUncheck', e);

      // Return false to prevent 'uncheck' action bubbling.
      return false;
    }
  },

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
    Component's action invoking when tree node's {{#crossLink "FlexberryDdauCheckboxComponent"}}checkbox{{/crossLink}}
    was clicked and it's 'checked' state changed.

    @method sendingActions.checkboxChange
    @param {Object} e Event object from
    {{#crossLink "FlexberryDdauCheckboxComponent/sendingActions.change:method"}}flexberry-ddau-checkbox 'change' action{{/crossLink}}.
  */

  /**
    Component's action invoking when tree node's {{#crossLink "FlexberryDdauCheckboxComponent"}}checkbox{{/crossLink}}
    was clicked and it's 'checked' state changed to 'checked=true'.

    @method sendingActions.checkboxCheck
    @param {Object} e Event object from
    {{#crossLink "FlexberryDdauCheckboxComponent/sendingActions.check:method"}}flexberry-ddau-checkbox 'check' action{{/crossLink}}.
  */

  /**
    Component's action invoking when tree node's {{#crossLink "FlexberryDdauCheckboxComponent"}}checkbox{{/crossLink}}
    was clicked and it's 'checked' state changed to 'checked=false'.

    @method sendingActions.checkboxUncheck
    @param {Object} e Event object from
    {{#crossLink "FlexberryDdauCheckboxComponent/sendingActions.uncheck:method"}}flexberry-ddau-checkbox 'uncheck' action{{/crossLink}}.
  */
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryTreenodeComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryTreenodeComponent;
