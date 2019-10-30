/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/map-tools/zoom-in';
import { translationMacro as t } from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-zoom-in-map-tool').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-zoom-in-map-tool').
  @readonly
  @static

  @for ZoomInMapToolComponent
*/
const flexberryClassNamesPrefix = 'flexberry-zoom-in-map-tool';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix
};

/**
  Flexberry zoom-in map-tool component.
  Component must be used in combination with {{#crossLink "FlexberryMaptoolbarComponent"}}flexberry-maptoolbar component{{/crossLink}}
  as a wrapper.

  Usage:
  templates/my-map-form.hbs
  ```handlebars
  {{#flexberry-maptoolbar}}
    {{map-tools/zoom-in leafletMap=leafletMap}}
  {{/flexberry-maptoolbar}}
  ```

  @class ZoomInMapToolComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses <a href="https://github.com/ciena-blueplanet/ember-block-slots#usage">SlotsMixin</a>
*/
let ZoomInMapToolComponent = Ember.Component.extend({
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
      Map tool's additional CSS-class.

      @property class
      @type String
      @default null
    */
    class: null,

    /**
      Map tool's caption.

      @property caption
      @type String
      @default t('components.map-tools.zoom-in.caption')
    */
    caption: t('components.map-tools.zoom-in.caption'),

    /**
      Map tool's tooltip text.
      Will be added as wrapper's element 'title' attribute.

      @property tooltip
      @default t('components.map-tools.zoom-in.tooltip')
    */
    tooltip: t('components.map-tools.zoom-in.tooltip'),

    /**
      Map tool's icon CSS-class names.

      @property iconClass
      @type String
      @default 'zoom icon'
    */
    iconClass: 'zoom icon'
  }
);

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
ZoomInMapToolComponent.reopenClass({
  flexberryClassNames
});

export default ZoomInMapToolComponent;
