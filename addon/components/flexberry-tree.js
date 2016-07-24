/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import FlexberryTreenodeComponent from './flexberry-treenode';
import DynamicActionsMixin from '../mixins/dynamic-actions';
import layout from '../templates/components/flexberry-tree';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

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
  wrapper: flexberryClassNamesPrefix
};

/**
  Flexberry tree component with [Semantic UI accordion](http://semantic-ui.com/modules/accordion.html) style
  and ["Data Down Actions UP (DDAU)" pattern](https://emberway.io/ember-js-goodbye-mvc-part-1-21777ecfd708) one way bindings.
  Component doesn't mutate passed data by its own, it only invokes actions,
  which signalizes to the route, controller, or another component, that passed data should be mutated.
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
  @uses DynamicActionsMixin
*/
let FlexberryTreeComponent = Ember.Component.extend(DynamicActionsMixin, {
  /**
    Flag: indicates whether tree isn't placed inside {{#crossLink "FlexberryTreenodeComponent"}}flexberry-treenode component{{/crossLink}}.

    @property _isNotInsideTreeNode
    @type Boolean
    @readonly
    @private
  */
  _isNotInsideTreeNode: Ember.computed('parentView', function() {
    let parentView = this.get('parentView');

    return !(parentView instanceof FlexberryTreenodeComponent);
  }),

  /**
    Flag: indicates whether some {{#crossLink "FlexberryTreeComponent/nodes:property"}}tree 'nodes'{{/childNodes}} are defined.

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
  }
});


// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryTreeComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryTreeComponent;
