/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Class for object describing component that must be rendered inside some other (parent) component dynamically.

  @class DynamicComponentObject
  @extends <a href="http://emberjs.com/api/classes/Ember.Object.html">Ember.Object</a>
*/
export default Ember.Object.extend({
  /**
    Component name.
    Will be used as first argument for ['component' helper]().
    Component behind this name must use {{#crossLink "DynamicPropertiesMixin"}}dynamic-properties mixin{{/crossLink}},
    {{#crossLink "DynamicActionsMixin"}}dynamic-actions mixin{{/crossLink}} and
    {{#crossLink "DynamicProxyActionsMixin"}}dynamic-proxy-actions mixin{{/crossLink}}.

    @property componentName
    @type String
    @default null
  */
  componentName: null,

  /**
    Object containing dynamic properties that must be assigned to
    component using {{#crossLink "DynamicPropertiesMixin"}}dynamic-properties mixin{{/crossLink}}.

    @property dynamicProperties
    @type Object
    @default null
  */
  dynamicProperties: null
});
