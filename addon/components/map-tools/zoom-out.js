/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/map-tools/zoom-out';
import { translationMacro as t } from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-zoom-out-map-tool').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-zoom-out-map-tool').
  @readonly
  @static

  @for ZoomOutMapToolComponent
*/
const flexberryClassNamesPrefix = 'flexberry-zoom-out-map-tool';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix
};

/**
  Flexberry zoom-out map-tool component.
  Component must be used in combination with {{#crossLink "FlexberryMaptoolbarComponent"}}flexberry-maptoolbar component{{/crossLink}}
  as a wrapper.

  Usage:
  templates/my-map-form.hbs
  ```handlebars
  {{#flexberry-maptoolbar}}
    {{map-tools/zoom-out leafletMap=leafletMap}}
  {{/flexberry-maptoolbar}}
  ```

  @class ZoomOutMapToolComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses <a href="https://github.com/ciena-blueplanet/ember-block-slots#usage">SlotsMixin</a>
*/
let ZoomOutMapToolComponent = Ember.Component.extend({
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
      @default t('components.map-tools.zoom-out.caption')
    */
    caption: t('components.map-tools.zoom-out.caption'),

    /**
      Map tool's tooltip text.
      Will be added as wrapper's element 'title' attribute.

      @property tooltip
      @default t('components.map-tools.zoom-out.tooltip')
    */
    tooltip: t('components.map-tools.zoom-out.tooltip'),

    /**
      Map tool's icon CSS-class names.

      @property iconClass
      @type String
      @default 'zoom out icon'
    */
    iconClass: 'zoom out icon'
  }
);

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
ZoomOutMapToolComponent.reopenClass({
  flexberryClassNames
});

export default ZoomOutMapToolComponent;
