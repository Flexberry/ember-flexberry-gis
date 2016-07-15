/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Class for object describing dynamic action binding for those flexberry components,
  which consumes their inner structure as [JSON-object](http://www.json.org/)
  or [Ember-object](http://emberjs.com/api/classes/Ember.Object.html).

  @class FlexberryActionBindingObject
  @extends <a href="http://emberjs.com/api/classes/Ember.Object.html">Ember.Object</a>
  @uses <a href="http://emberjs.com/api/classes/Ember.Copyable.html">Ember.Copyable</a>
*/
let FlexberryActionBindingObject = Ember.Object.extend(Ember.Copyable, {
  /**
    Name of component's action that will play a trigger role
    for {{#crossLink "FlexberryActionBindingObject/actionHandler:property"}}action handler{{/crossLink}}.

    @property on
    @type String
    @default null
  */
  on: null,

  /**
    Handler for {{#crossLink "FlexberryActionBindingObject/on:property"}}action that will be invoked{{/crossLink}}.

    @property actionHandler
    @type Function
    @default null
  */
  actionHandler: null,

  /**
    Additional arguments for {{#crossLink "FlexberryActionBindingObject/actionHandler:property"}}given action handler{{/crossLink}}.

    @property actionArguments
    @type *[]
    @default null
  */
  actionArguments: null,

  /**
    Implements ['copy' method from Ember.Copyable mixin](http://emberjs.com/api/classes/Ember.Copyable.html#method_copy).

    @method copy
    @param {Boolean} deep Flag: indicates whether a deep copy of the object should be made.
    @return FlexberryActionBindingObject Object copy.
  */
  copy(deep) {
    let copy = FlexberryActionBindingObject.create({
      on: Ember.copy(this.get('on')),
      actionHandler: Ember.copy(this.get('actionHandler')),
      actionArguments: Ember.copy(this.get('actionArguments'))
    });

    return copy;
  }
});

export default FlexberryActionBindingObject;
