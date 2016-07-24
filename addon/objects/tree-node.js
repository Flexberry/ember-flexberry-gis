/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Class for object describing properties of the
  {{#crossLink "FlexberryTreenodeComponent"}}flexberry-treenode component{{/crossLink}}.
  All class properties are related to the same component's properties.

  @class TreeNodeObject
  @extends <a href="http://emberjs.com/api/classes/Ember.Object.html">Ember.Object</a>
*/
export default Ember.Object.extend({
  /**
    Tree node's caption.

    @property caption
    @type String
    @default null
  */
  caption: null,

  /**
    CSS-classes names for a tree node's icon.
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
    Component's dynamic actions.
    Related to component's property inherited from
    {{#crossLink "DynamicActionsMixin/dynamicActions:property"}}dynamic-actions mixin{{/crossLink}}.

    @property dynamicActions
    @type DynamicActionObject[]
    @default null
  */
  dynamicActions: null,

  /**
    Child nodes.

    @property nodes
    @type TreeNodeObject[]
    @default null
  */
  nodes: null
});
