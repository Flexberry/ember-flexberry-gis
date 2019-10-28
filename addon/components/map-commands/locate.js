/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/map-commands/locate';
import {
  translationMacro as t
} from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.
  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-locate-map-command').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-locate-map-command').
  @readonly
  @static
  @for  LocateMapCommandComponent
*/
const flexberryClassNamesPrefix = 'flexberry-locate-map-command';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix
};

/**
  Flexberry flexberry-locate-map-command component.
  Component must be used in combination with {{#crossLink "FlexberryMaptoolbarComponent"}}flexberry-maptoolbar component{{/crossLink}}
  as a wrapper.
  Usage:
  templates/my-map-form.hbs
  ```handlebars
  {{#flexberry-maptoolbar}}
    {{map-commands/locate leafletMap=leafletMap}}
  {{/flexberry-maptoolbar}}
  ```
  @class FullExtentMapCommandComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses <a href="https://github.com/ciena-blueplanet/ember-block-slots#usage">SlotsMixin</a>
*/
let LocateMapCommandComponent = Ember.Component.extend({
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
    Overridden ['tagName'](http://emberjs.com/api/classes/Ember.Component.html#property_tagName)
    to disable a component's wrapping element.
    @property tagName
    @type String
    @default ''
  */
  tagName: '',

  /**
    Map command's additional CSS-class.
    @property class
    @type String
    @default null
  */
  class: null,

  /**
    Map command's caption.
    @property caption
    @type String
    @default t('components.map-commands.locate.caption')
  */
  caption: t('components.map-commands.locate.caption'),

  /**
    Map command's tooltip text.
    Will be added as wrapper's element 'title' attribute.
    @property tooltip
    @default t('components.map-commands.locate.tooltip')
  */
  tooltip: t('components.map-commands.locate.tooltip'),

  /**
    Map command's icon CSS-class names.
    @property iconClass
    @type String
    @default 'bullseye icon'
  */
  iconClass: 'bullseye icon',
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
LocateMapCommandComponent.reopenClass({
  flexberryClassNames
});

export default LocateMapCommandComponent;
