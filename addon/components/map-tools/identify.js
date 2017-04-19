/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/map-tools/identify';
import { translationMacro as t } from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-identify-map-tool').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-identify-map-tool').
  @property {String} flexberryClassNames.idenifyAll Component's identify-all mode's CSS-class name ('flexberry-identify-all-map-tool').
  @property {String} flexberryClassNames.idenifyAllVisible Component's identify-all-visible mode's CSS-class name ('flexberry-identify-all-visible-map-tool').
  @property {String} flexberryClassNames.idenifyTopVisible Component's identify-top-visible mode's CSS-class name ('flexberry-identify-top-visible-map-tool').
  @readonly
  @static

  @for IdentifyMapToolComponent
*/
const flexberryClassNamesPrefix = 'flexberry-identify-map-tool';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix,
  idenifyAll: 'flexberry-identify-all-map-tool',
  idenifyAllVisible: 'flexberry-identify-all-visible-map-tool',
  idenifyTopVisible: 'flexberry-identify-top-visible-map-tool'
};

/**
  Flexberry identify map-tool component.
  Component must be used in combination with {{#crossLink "FlexberryMaptoolbarComponent"}}flexberry-maptoolbar component{{/crossLink}}
  as a wrapper.

  Usage:
  templates/my-map-form.hbs
  ```handlebars
  {{#flexberry-maptoolbar leafletMap=leafletMap as |maptoolbar|}}
    {{map-tools/identify activate=(action "onMapToolActivate" target=maptoolbar)}}
  {{/flexberry-maptoolbar}}
  ```

  @class IdentifyMapToolComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses <a href="https://github.com/ciena-blueplanet/ember-block-slots#usage">SlotsMixin</a>
*/
let IdentifyMapToolComponent = Ember.Component.extend({
    /**
      Properties which will be passed to the map-tool when it will be instantiated.

      @property _identifyToolProperties
      @type Object
      @default null
    */
    _identifyToolProperties: null,

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
      @default t('components.map-tools.identify.caption')
    */
    caption: t('components.map-tools.identify.caption'),

    /**
      Map tool's tooltip text.
      Will be added as wrapper's element 'title' attribute.

      @property tooltip
      @default t('components.map-tools.identify.tooltip')
    */
    tooltip: t('components.map-tools.identify.tooltip'),

    /**
      Map tool's icon CSS-class names.

      @property iconClass
      @type String
      @default 'hand paper icon'
    */
    iconClass: 'info circle icon',

    /**
      Map tool's 'idenify-all' mode's additional CSS-class.

      @property identifyAllClass
      @type String
      @default null
    */
    identifyAllClass: null,

    /**
      Map tool's 'idenify-all' mode's caption.

      @property identifyAllCaption
      @type String
      @default t('components.map-tools.identify.identify-all.caption')
    */
    identifyAllCaption: t('components.map-tools.identify.identify-all.caption'),

    /**
      Map tool's 'idenify-all' mode's icon CSS-class names.

      @property identifyAllIconClass
      @type String
      @default 'square outline icon'
    */
    identifyAllIconClass: 'square outline icon',

    /**
      Map tool's 'idenify-all-visible' mode's additional CSS-class.

      @property identifyAllVisibleClass
      @type String
      @default null
    */
    identifyAllVisibleClass: null,

    /**
      Map tool's 'idenify-all-visible' mode's caption.

      @property identifyAllVisibleCaption
      @type String
      @default t('components.map-tools.idenify.identify-all-visible.caption')
    */
    identifyAllVisibleCaption: t('components.map-tools.identify.identify-all-visible.caption'),

    /**
      Map tool's 'idenify-all-visible' mode's icon CSS-class names.

      @property identifyAllVisibleIconClass
      @type String
      @default 'square outline icon'
    */
    identifyAllVisibleIconClass: 'checkmark box icon',

    /**
      Map tool's 'idenify-top-visible' mode's additional CSS-class.

      @property identifyTopVisibleClass
      @type String
      @default null
    */
    identifyTopVisibleClass: null,

    /**
      Map tool's 'idenify-top-visible' mode's caption.

      @property identifyTopVisibleCaption
      @type String
      @default t('components.map-tools.idenify.identify-top-visible.caption')
    */
    identifyTopVisibleCaption: t('components.map-tools.identify.identify-top-visible.caption'),

    /**
      Map tool's 'idenify-top-visible' mode's icon CSS-class names.

      @property identifyTopVisibleIconClass
      @type String
      @default 'square outline icon'
    */
    identifyTopVisibleIconClass: 'chevron up icon',

    /**
      Flag: is map tool 'identify all layers' enable

      @property identifyAll
      @default true
      @type Boolean
    */
    identifyAll: true,

    /**
      Flag: is map tool 'identify all visible layers' enable

      @property identifyAllVisible
      @default true
      @type Boolean
    */
    identifyAllVisible: true,

    /**
      Flag: is map tool 'identify top layer' enable

      @property identifyTop
      @default true
      @type Boolean
    */
    identifyTop: true,

    actions: {
      /**
        Handles {{#crossLink "BaseMapToolComponent/sendingActions.activate:method"}}base map-tool's 'activate' action{{/crossLink}}.
        Invokes own {{#crossLink "IdentifyMapToolComponent/sendingActions.activate:method"}}'activate' action{{/crossLink}}.

        @method actions.onMapToolActivate
        @param {Object} e Base map-tool's 'activate' action event-object.
      */
      onMapToolActivate(...args) {
        this.sendAction('activate', ...args);
      }
    },

    /**
      Component's action invoking when map-tool must be activated.

      @method sendingActions.activate
      @param {Object} e Action's event object from
      {{#crossLink "BaseMapToolComponent/sendingActions.activate:method"}}base map-tool's 'activate' action{{/crossLink}}.
    */
  }
);

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
IdentifyMapToolComponent.reopenClass({
  flexberryClassNames
});

export default IdentifyMapToolComponent;
