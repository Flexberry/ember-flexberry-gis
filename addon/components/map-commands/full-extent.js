/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/map-commands/full-extent';
import { translationMacro as t } from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-drag-map-tool').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-drag-map-tool').
  @readonly
  @static

  @for FullExtentMapCommandComponent
*/
const flexberryClassNamesPrefix = 'flexberry-full-extent-map-command';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix
};

/**
  Flexberry full-extent map-command component.
  Component must be used in combination with {{#crossLink "FlexberryMaptoolbarComponent"}}flexberry-maptoolbar component{{/crossLink}}
  as a wrapper.

  Usage:
  templates/my-map-form.hbs
  ```handlebars
  {{#flexberry-maptoolbar}}
    {{map-commands/full-extent leafletMap=leafletMap}}
  {{/flexberry-maptoolbar}}
  ```

  @class FullExtentMapCommandComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses <a href="https://github.com/ciena-blueplanet/ember-block-slots#usage">SlotsMixin</a>
*/
let FullExtentMapCommandComponent = Ember.Component.extend({
  /**
    Options which will be passed to the map-command's 'execute' method.

    @property mapCommandExecutionOptions
    @type Object
    @private
    @readOnly
  */
  _mapCommandExecutionOptions: Ember.computed('lat', 'lng', 'zoom', function() {
    return {
      latLng: L.latLng(this.get('lat'), this.get('lng')),
      zoom: this.get('zoom')
    };
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
    @default t('components.map-commands.full-extent.caption')
  */
  caption: t('components.map-commands.full-extent.caption'),

  /**
    Map command's tooltip text.
    Will be added as wrapper's element 'title' attribute.

    @property tooltip
    @default t('components.map-commands.full-extent.tooltip')
  */
  tooltip: t('components.map-commands.full-extent.tooltip'),

  /**
    Map command's icon CSS-class names.

    @property iconClass
    @type String
    @default 'globe icon'
  */
  iconClass: 'globe icon',

  /**
    Leaflet map.

    @property leafletMap
    @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
    @default null
  */
  leafletMap: null,

  /**
    Map command's default X position

    @property lat
    @type float
    @default 0
  */
  lat: 0,

  /**
    Map command's default Y position

    @property lng
    @type float
    @default 0
  */
  lng: 0,

  /**
    Map command's default zoom

    @property zoom
    @type float
    @default 0
  */
  zoom: 0
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FullExtentMapCommandComponent.reopenClass({
  flexberryClassNames
});

export default FullExtentMapCommandComponent;
