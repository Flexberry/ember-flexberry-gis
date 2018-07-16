/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseMapToolComponent from './map-tools/base';
import BaseMapTool from '../map-tools/base';
import BaseMapCommand from '../map-commands/base';
import layout from '../templates/components/flexberry-maptoolbar';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-maptoolbar').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-maptoolbar').
  @readonly
  @static

  @for FlexberryMaptoolbarComponent
*/
const flexberryClassNamesPrefix = 'flexberry-maptoolbar';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix
};

/**
  Map toolbar component.
  Component must be used in combination with any map tool components as a wrapper for them.

  Usage:
  templates/my-map-form.hbs
  ```handlebars
  {{#flexberry-maptoolbar leafletMap=leafletMap as |maptoolbar|}}
    {{map-tools/base name="my-map-tool" activate=(action "onMapToolActivate" target=maptoolbar)}}
  {{/flexberry-maptoolbar}}
  ```

  @class FlexberryMaptoolbarComponet
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
let FlexberryMaptoolbarComponent = Ember.Component.extend({
  /**
    Currently active map tool.

    @property _activeMapTool
    @type BaseMapTool
    @default null
  */
  _activeMapTool: null,

  /**
    Component's template reference.
  */
  layout,

  /**
    Reference to component's CSS-classes names.
    Must be also a component's instance property to be available from component's .hbs template.
  */
  flexberryClassNames,

  /**
    Component's wrapping <div> CSS-classes names.

    Any other CSS-classes can be added through component's 'class' property.
    ```handlebars
    {{flexberry-maptoolbar
      class="secondary"
    }}
    ```

    @property classNames
    @type String[]
    @default ['flexberry-maptoolbar', 'ui', 'menu']
  */
  classNames: [flexberryClassNames.wrapper, 'ui', 'menu'],

  /**
    Default map-tool name.
    Will be enabled when some non-exclusive map-tool trigger 'disable' event.

    @property defaultMapToolName
    @type String
    @default 'drag'
  */
  defaultMapToolName: 'drag',

  /**
    Leaflet map.

    @property leafletMap
    @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
    @default null
  */
  leafletMap: null,

  /**
    Map layers hierarchy.

    @property layers
    @type Object[]
    @default null
  */
  layers: null,

  actions: {
    /**
      Handles map-tool component's 'activate' action.
      Activates specified map-tool.

      @method actions.onMapToolActivate
      @param {Object} e Action's event object.
      @param {BaseMapTool} e.mapTool Map tool that must be activated.
      @param {<a href="http://learn.jquery.com/using-jquery-core/jquery-object/">jQuery-object</a>} e.target
      jQuery element related to map tool that must be activated.
      @param {<a href="http://learn.jquery.com/events/introduction-to-events/#the-event-object">jQuery event object</a>} e.originalEvent
      Event object related to event that triggered this action.
    */
    onMapToolActivate(...args) {
      // Actions event object is always the last parameter.
      let e = args[args.length - 1] || {};
      let mapTool = Ember.get(e, 'mapTool');
      Ember.assert(
        `Wrong type of \`e.mapTool\` parameter: actual type is ${Ember.typeOf(mapTool)}, ` +
        `but 'map-tool' is expected in flexberry-maptoolbar (${this.toString()}).`,
        mapTool instanceof BaseMapTool);

      if (Ember.isNone(Ember.get(mapTool, 'leafletMap'))) {
        Ember.set(mapTool, 'leafletMap', this.get('leafletMap'));
      }

      if (Ember.isNone(Ember.get(mapTool, 'layers'))) {
        Ember.set(mapTool, 'layers', this.get('layers'));
      }

      if (Ember.get(e, 'activate') === false) {
        // Tool needs only 'leafletMap' & 'layers' properties to be initialized.
        // Activation is delayed.
        return;
      }

      let activeMapTool = this.get('_activeMapTool');
      if (mapTool === activeMapTool) {
        return;
      }

      if (!Ember.isNone(activeMapTool)) {
        activeMapTool.off('disable', this, this._activateDefaultMapTool);
        activeMapTool.disable();
        this.set('_activeMapTool', null);
      }

      // Order is necessary (enable operation can finish very fast).
      if (!Ember.get(mapTool, 'exclusive')) {
        mapTool.on('disable', this, this._activateDefaultMapTool);
      }

      this.set('_activeMapTool', mapTool);
      mapTool.enable(...args);

      this.trigger('activate');
    },

    /**
      Handles map-command component's 'execute' action.
      Executes specified map-command.

      @method actions.onMapCommandExecute
      @param {Object} e Action's event object.
      @param {BaseMapCommand} e.mapCommand Map command that must be executed.
      @param {<a href="http://learn.jquery.com/using-jquery-core/jquery-object/">jQuery-object</a>} e.target
      jQuery element related to map command that must be executed.
      @param {<a href="http://learn.jquery.com/events/introduction-to-events/#the-event-object">jQuery event object</a>} e.originalEvent
      Event object related to event that triggered this action.
    */
    onMapCommandExecute(...args) {
      // Actions event object is always the last parameter.
      let e = args[args.length - 1] || {};
      let mapCommand = Ember.get(e, 'mapCommand');
      Ember.assert(
        `Wrong type of \`e.mapCommand\` parameter: actual type is ${Ember.typeOf(mapCommand)}, but 'map-command' is expected.`,
        mapCommand instanceof BaseMapCommand);

      if (Ember.isNone(Ember.get(mapCommand, 'leafletMap'))) {
        Ember.set(mapCommand, 'leafletMap', this.get('leafletMap'));
      }

      if (Ember.isNone(Ember.get(mapCommand, 'layers'))) {
        Ember.set(mapCommand, 'layers', this.get('layers'));
      }

      if (Ember.get(e, 'execute') === false) {
        // Command needs only 'leafletMap' & 'layers' properties to be initialized.
        // Execution is delayed.
        return;
      }

      mapCommand.execute(...args);
    }
  },

  /**
    Activates default map-tool.

    @method _activateDefaultMapTool
    @private
  */
  _activateDefaultMapTool() {
    let defaultMapToolName = this.get('defaultMapToolName');
    Ember.assert(
      `Required \'defaultMapToolName\' property is not defined in flexberry-maptoolbar (${this.toString()})`, !Ember.isBlank(defaultMapToolName));

    let getDefaultMapToolComponent = function (root) {
      let defaultMapToolComponent = null;
      Ember.A(root.get('childViews') || []).forEach((child) => {
        let component = child instanceof BaseMapToolComponent ? child : getDefaultMapToolComponent(child);
        if (component instanceof BaseMapToolComponent && Ember.get(component, 'name') === defaultMapToolName) {
          defaultMapToolComponent = component;
          return false;
        }
      });

      return defaultMapToolComponent;
    };

    let defaultMapToolComponent = getDefaultMapToolComponent(this);
    Ember.assert(
      `Map-tool component related to \`${defaultMapToolName}\` map-tool doesn\`t exist in flexberry-maptoolbar (${this.toString()})`,
      !Ember.isNone(defaultMapToolComponent));

    defaultMapToolComponent.activateMapTool();
  },

  /**
    Switching to default map-tool.

    @method _switchToDefaultMapTool
    @private
  */
  _switchToDefaultMapTool() {
    let activeMapTool = this.get('_activeMapTool');

    if (!Ember.isNone(activeMapTool)) {
      activeMapTool.off('disable', this, this._activateDefaultMapTool);
      activeMapTool.disable();
      this.set('_activeMapTool', null);
    }

    this._activateDefaultMapTool();
  },

  /**
    Observes changes in {{#crossLink "FlexberryMaptoolbarComponent/leafletMap:propery"}}'leafletMap' property{{/crossLink}}.
    Activates default map-tool when leafletMap initialized and subscribes on flexberry-map:identificationFinished event.

    @method _leafletMapDidChange
    @private
  */
  _leafletMapDidChange: Ember.on('didInsertElement', Ember.observer('leafletMap', function () {

    let leafletMap = this.get('leafletMap');
    if (Ember.isNone(leafletMap)) {
      return;
    }

    leafletMap.on('flexberry-map:switchToDefaultMapTool', this._switchToDefaultMapTool, this);

    this._activateDefaultMapTool();
  })),

  /**
    Destroys component.
  */
  willDestroy() {
    this._super(...arguments);

    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletMap)) {
      leafletMap.off('flexberry-map:switchToDefaultMapTool', this._switchToDefaultMapTool, this);
    }

    let activeMapTool = this.get('_activeMapTool');
    if (!Ember.isNone(activeMapTool)) {
      activeMapTool.disable();
      activeMapTool.off('disable', this, this._activateDefaultMapTool);
      this.set('_activeMapTool', null);
    }
  }
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryMaptoolbarComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryMaptoolbarComponent;
