/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Class for object describing properties of {{#crossLink "FlexberryTreenodeComponent"}}flexberry-treenode component{{/crossLink}}.
  All class properties are related to same properties of {{#crossLink "FlexberryTreenodeComponent"}}flexberry-treenode component{{/crossLink}}.

  @class FlexberryTreenodeObject
  @extends <a href="http://emberjs.com/api/classes/Ember.Object.html">Ember.Object</a>
  @uses <a href="http://emberjs.com/api/classes/Ember.Copyable.html">Ember.Copyable</a>
*/
let FlexberryTreenodeObject = Ember.Object.extend({
  /**
    Tree node's caption (will be displayed near node).

    @property caption
    @type String
    @default null
  */
  caption: null,

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
    Node actions bindings.

    @property actionBindings
    @type FlexberryActionBindingObject[]
    @default null
  */
  actionBindings: null,

  /**
    Child nodes.

    @property nodes
    @type FlexberryTreenodeObject[]
    @default null
  */
  nodes: null,

  /**
    Implements ['copy' method from Ember.Copyable mixin](http://emberjs.com/api/classes/Ember.Copyable.html#method_copy).

    @method copy
    @param {Boolean} deep Flag: indicates whether a deep copy of the object should be made.
    @return FlexberryTreenodeObject Object copy.
  */
  copy(deep) {
    let copy = FlexberryTreenodeObject.create({
      caption: Ember.copy(this.get('caption')),
      iconClass: Ember.copy(this.get('iconClass')),
      hasCheckbox: Ember.copy(this.get('hasCheckbox')),
      checkboxValue: Ember.copy(this.get('checkboxValue')),
      readonly: Ember.copy(this.get('readonly')),
      actionBindings: Ember.copy(this.get('actionBindings')),
      nodes: Ember.copy(this.get('nodes'))
    });

    return copy;
  }
});

export default FlexberryTreenodeObject;
