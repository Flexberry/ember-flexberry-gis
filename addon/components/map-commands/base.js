/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseMapToolComponent from '../map-tools/base';
import layout from '../../templates/components/map-tools/base';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-maptool').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-maptool').
  @property {String} flexberryClassNames.icon Component's icon CSS-class name ('flexberry-maptool-icon').
  @property {String} flexberryClassNames.submenu Component's sumbenu CSS-class name ('flexberry-maptool-submenu').
  @property {String} flexberryClassNames.submenuIcon Component's sumbenu icon CSS-class name ('flexberry-maptool-submenu-icon').
  @readonly
  @static

  @for BaseMapCommandComponent
*/
const flexberryClassNamesPrefix = 'flexberry-map-command';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix,
  icon: flexberryClassNamesPrefix + '-icon',
  submenu: flexberryClassNamesPrefix + '-submenu',
  submenuIcon: flexberryClassNamesPrefix + '-submenu-icon'
};

/**
  Flexberry map tool component.
  Component must be used in combination with {{#crossLink "FlexberryMaptoolbarComponent"}}flexberry-maptoolbar component{{/crossLink}}
  as a wrapper for map tools components.

  Usage:
  templates/my-map-form.hbs
  ```handlebars
  {{#flexberry-maptoolbar leafletMap=leafletMap as |maptoolbar|}}
    {{map-commands/base name="my-map-command" execute=(action "onMapCommandExecute" target=maptoolbar)}}
  {{/flexberry-maptoolbar}}
  ```

  @class BaseMapCommandComponent
  @extends BaseMapTool
  @uses <a href="https://github.com/ciena-blueplanet/ember-block-slots#usage">SlotsMixin</a>
  @uses DomActionsMixin
*/
let BaseMapCommandComponent = BaseMapToolComponent.extend({
    /**
      Map command.

      @property _mapCommand
      @type BaseMapCommand
      @default null
      @private
    */
    _mapCommand: null,

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
      Properties which will be passed to the map-tool when it will be instantiated.

      @property mapToolProperties
      @type Object
      @default null
    */
    mapCommandProperties: null,

    actions: {
      /**
        Handles map-tools click event.
        Invokes {{#crossLink "BaseMapCommandComponent/sendingActions.execute:method"}}'execute' action{{/crossLink}}.

        @method actions.click
        @param {<a href="http://learn.jquery.com/events/introduction-to-events/#the-event-object">jQuery event object</a>} e
        Click event object.
      */
      click(e) {
        this.executeMapCommand(e);
      }
    },

    /**
      Invokes {{#crossLink "BaseMapCommandComponent/sendingActions.execute:method"}}'execute' action{{/crossLink}}.

      @method executeMapCommand
      @param {<a href="http://learn.jquery.com/events/introduction-to-events/#the-event-object">jQuery event object</a>} e
      Original event object.
    */
    executeMapCommand(e) {
      this.sendAction('execute', {
        mapCommand: this.get('_mapCommand'),
        target: this.$(),
        originalEvent: e
      });
    },

    /**
      Creates map-tool in component's initialization time.

      @method createMapTool
    */
    createMapTool() {
      let mapCommandName = this.get('name');
      if (Ember.isBlank(mapCommandName)) {
        return;
      }

      let mapCommand = Ember.getOwner(this).lookup(`map-command:${mapCommandName}`);
      Ember.assert(
        `Can't lookup \`map-command:${mapCommandName}\` such map-command doesn\`t exist`,
        !Ember.isNone(mapCommand));

      let mapCommandProperties = this.get('mapCommandProperties');
      if (!Ember.isNone(mapCommandProperties)) {
        Ember.A(Object.keys(mapCommandProperties)).forEach((propertyName) => {
          Ember.set(mapCommand, propertyName,  Ember.get(mapCommandProperties, propertyName));
        });
      }

      this.set('_mapCommand', mapCommand);
    },

    /**
      Destroys map-tool in components destroy time.

      @method destroyMapTool
    */
    destroyMapTool() {
      let mapCommand = this.get('_mapCommand');
      if (!Ember.isNone(mapCommand) && Ember.typeOf(mapCommand.destroy) === 'function') {
        mapCommand.destroy();
        this.set('_mapCommand', null);
      }
    },

    /**
      Component's action invoking when component was clicked & map-command must be executed.

      @method sendingActions.execute
      @param {Object} e Action's event object.
      @param {BaseMapTool} e.mapCommand Map command that must be executed.
      @param {<a href="http://learn.jquery.com/using-jquery-core/jquery-object/">jQuery-object</a>} e.target
      jQuery element related to map command that must be executed.
      @param {<a href="http://learn.jquery.com/events/introduction-to-events/#the-event-object">jQuery event object</a>} e.originalEvent
      Event object related to event that triggered this action.
    */
  }
);

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
BaseMapCommandComponent.reopenClass({
  flexberryClassNames
});

export default BaseMapCommandComponent;
