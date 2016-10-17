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
  {{#flexberry-maptoolbar leafletMap=leafletMap as |maptoolbar|}}
    {{map-commands/full-extent execute=(action "onMapCommandExecute" target=maptoolbar)}}
  {{/flexberry-maptoolbar}}
  ```

  @class FullExtentMapCommandComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses <a href="https://github.com/ciena-blueplanet/ember-block-slots#usage">SlotsMixin</a>
*/
let FullExtentMapCommandComponent = Ember.Component.extend({
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
      Map command's icon CSS-class names.

      @property iconClass
      @type String
      @default 'globe icon'
    */
    iconClass: 'globe icon',

    actions: {
      /**
        Handles {{#crossLink "BaseMapCommandComponent/sendingActions.execute:method"}}base map-command's 'execute' action{{/crossLink}}.
        Invokes own {{#crossLink "FullExtentMapCommandComponent/sendingActions.execute:method"}}'execute' action{{/crossLink}}.

        @method actions.onMapCommandExecute
        @param {Object} e Base map-command's 'execute' action event-object.
      */
      onMapCommandExecute(...args) {
        this.sendAction('execute', ...args);
      }
    },

    /**
      Component's action invoking when map-command must be executed.

      @method sendingActions.execute
      @param {Object} e Action's event object from
      {{#crossLink "BaseMapCommandComponent/sendingActions.execute:method"}}base map-command's 'execute' action{{/crossLink}}.
    */
  }
);

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FullExtentMapCommandComponent.reopenClass({
  flexberryClassNames
});

export default FullExtentMapCommandComponent;
