/**
  @module ember-flexberry-gis
*/

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
  {{#flexberry-maptoolbar}}
    {{map-commands/base name="my-map-command" leafletMap=leafletMap}}
  {{/flexberry-maptoolbar}}
  ```

  @class BaseMapCommandComponent
  @extends BaseMapTool
  @uses <a href="https://github.com/ciena-blueplanet/ember-block-slots#usage">SlotsMixin</a>
  @uses DomActionsMixin
*/
let BaseMapCommandComponent = BaseMapToolComponent.extend({
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

  /**
    Options which will be passed to the map-command's 'execute' method.

    @property mapCommandExecutionOptions
    @type Object
    @default null
  */
  mapCommandExecutionOptions: null,

  /**
    Handles map-tool's 'click' event.

    @method click
    @param {<a href="http://learn.jquery.com/events/introduction-to-events/#the-event-object">jQuery event object</a>} e
    Click event object.
  */
  click(e) {
    this.executeMapCommand();
  },

  /**
    Performs map-command's execution.

    @method executeMapCommand
  */
  executeMapCommand() {
    let leafletMap = this.get('leafletMap');
    if (this.get('_hasSubmenu')) {
      leafletMap.fire('flexberry-map:commands:choose', {
        mapCommand: this
      });

      // Command with submenu is just a wrapper, it shouldn't really execute map-command.
      return;
    }

    let mapCommandName = this.get('name');
    let mapCommandProperties = this.get('mapCommandProperties');
    let mapCommandExecutionOptions = this.get('mapCommandExecutionOptions');

    leafletMap.flexberryMap.commands.execute(mapCommandName, mapCommandProperties, mapCommandExecutionOptions);
  },

  /**
    Attaches leaflet map event handlers.

    @param {Object} leafletMap Leaflet map.
  */
  attachLeafletMapEventHandlers(leafletMap) {
  },

  /**
    Detaches leaflet map event handlers.

    @param {Object} leafletMap Leaflet map.
  */
  detachLeafletMapEventHandlers(leafletMap) {
  }
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
BaseMapCommandComponent.reopenClass({
  flexberryClassNames
});

export default BaseMapCommandComponent;
