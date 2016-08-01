/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Class for object describing proxy-actions, for those child components that were
  dynamically embedded into some parent component, and actions they are sending
  must be catched and resended by parent component with some other action names
  and maybe with some additional arguments.

  @class DynamicProxyActionObject
  @extends <a href="http://emberjs.com/api/classes/Ember.Object.html">Ember.Object</a>
*/
export default Ember.Object.extend({
  /**
    Name of child component's action which must be proxied (resended from parent component)
    with the {{#crossLink "DynamicProxyActionObject/actionName:property"}specified action name{{/crossLink}}.

    @property on
    @type String
    @default null
  */
  on: null,

  /**
    Name of the action which will be sent from parent component when child component triggers it's action
    specified in {{#crossLink "DynamicProxyActionObject/on:property"}}'on'{{/crossLink}} property.

    @property actionName
    @type String
    @default null
  */
  actionName: null,

  /**
    Additional arguments which will be added in the beginning of arguments array
    of the {{#crossLink "DynamicProxyActionObject/on:property"}}specified child component's action{{/crossLink}},
    before it will be resended from parent component with the
    {{#crossLink "DynamicProxyActionObject/actionName:property"}specified name{{/crossLink}}.

    @property actionArguments
    @type any[]
    @default null
  */
  actionArguments: null
});
