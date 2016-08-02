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
    Name of parent component's {{#crossLink "DynamicComponentsPlaceholderComponent"}}'dynamic-components-placeholder'{{/crossLink}}
    placed somewhere in it's markup to which dynamic component must be added.

    @property to
    @type String
    @default null
  */
  to: null,

  /**
    Flag: indicates whether component is visible (should be included in defined place markup) or not.
    It is useful when you want to remove your component from markup (for example in readonly mode or in some other situations).

    @property visible
    @type Boolean
    @default true
  */
  visible: true,

  /**
    Component name.
    Will be used as first argument for ['component' helper](http://emberjs.com/api/classes/Ember.Templates.helpers.html#method_component).
    Component behind this name must use at least {{#crossLink "DynamicPropertiesMixin"}}dynamic-properties mixin{{/crossLink}},
    and optionally {{#crossLink "DynamicActionsMixin"}}dynamic-actions mixin{{/crossLink}} &
    {{#crossLink "DynamicProxyActionsMixin"}}dynamic-proxy-actions mixin{{/crossLink}}.

    @property componentName
    @type String
    @default null
  */
  componentName: null,

  /**
    Object containing properties that must be passed to
    component using {{#crossLink "DynamicPropertiesMixin"}}dynamic-properties mixin{{/crossLink}}
    through it's {#crossLink "DynamicPropertiesMixin:dynamicProperties"}}'dynamicProperties' property{{/crossLink}}.

    @property componentProperties
    @type Object
    @default null
  */
  componentProperties: null,
});
