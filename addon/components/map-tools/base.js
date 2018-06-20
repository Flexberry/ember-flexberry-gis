/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import SlotsMixin from 'ember-block-slots';
import DomActionsMixin from 'ember-flexberry/mixins/dom-actions';
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

  @for BaseMapToolComponent
*/
const flexberryClassNamesPrefix = 'flexberry-map-tool';
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
    {{map-tools/base name="my-map-tool" activate=(action "onMapToolActivate" target=maptoolbar)}}
  {{/flexberry-maptoolbar}}
  ```

  @class BaseMapToolComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses <a href="https://github.com/ciena-blueplanet/ember-block-slots#usage">SlotsMixin</a>
  @uses DomActionsMixin
*/
let BaseMapToolComponent = Ember.Component.extend(
  SlotsMixin,
  DomActionsMixin, {
    /**
      Mutation observer that observes changes in component's 'class' attribute.

      @property _classObserver
      @type <a href="https://developer.mozilla.org/en/docs/Web/API/MutationObserver">MutationObserver</a>
      @default null
      @private
    */
    _classObserver: null,

    /**
      Map tool.

      @property _mapTool
      @type BaseMapTool
      @default null
      @private
    */
    _mapTool: null,

    /**
      Observes changes buffer parameters.

      @method _bufferObserver
      @type Observer
      @private
    */
    _bufferObserver: Ember.observer('bufferActive', 'bufferRadius', 'bufferUnits', function () {
      this._applyBufferSettings();
    }),

    /**
      Flag: indicates whether some nested content for submenu is defined
      (some yield markup for 'submenu' block-slot).

      @property _hasSubmenu
      @type boolean
      @readOnly
      @private
    */
    _hasSubmenu: Ember.computed('_slots.[]', function () {
      // Yielded {{block-slot "submenu"}} is defined or 'nodes' are defined.
      return this._isRegistered('submenu');
    }),

    /**
      Flag: indicates whether map tool has caption or not.

      @property _hasCaption
      @type Boolean
      @readOnly
      @private
    */
    _hasCaption: Ember.computed('caption', function () {
      let caption = this.get('caption');
      return Ember.typeOf(caption) === 'string' && Ember.$.trim(caption) !== '' ||
        Ember.typeOf(Ember.String.isHTMLSafe) === 'function' && Ember.String.isHTMLSafe(caption) && Ember.$.trim(Ember.get(caption, 'string')) !== '' ||
        caption instanceof Ember.Handlebars.SafeString && Ember.$.trim(Ember.get(caption, 'string')) !== '';
    }),

    /**
      Flag: indicates whether map tool has icon or not.

      @property _hasIcon
      @type Boolean
      @readOnly
      @private
    */
    _hasIcon: Ember.computed('iconClass', function () {
      let iconClass = this.get('iconClass');
      return Ember.typeOf(iconClass) === 'string' && Ember.$.trim(iconClass) !== '';
    }),

    /**
      Flag: indicates whether map tool has icon only (without caption).

      @property _hasIconOnly
      @type Boolean
      @readOnly
      @private
    */
    _hasIconOnly: Ember.computed('_hasIcon', '_hasCaption', function () {
      return this.get('_hasIcon') && !this.get('_hasCaption');
    }),

    /**
      Flag: indicates whether related map-tool is enabled or not.

      @type Boolean
      @readOnly
    */
    _isActive: Ember.computed('_mapTool._enabled', function () {
      return this.get('_mapTool._enabled') === true;
    }),

    /**
      Flag indicates is buffer active

      @property bufferActive
      @type Boolean
      @default false
    */
    bufferActive: true,

    /**
      Buffer radius units

      @property bufferUnits
      @type String
      @default 'kilometers'
    */
    bufferUnits: 'kilometers',

    /**
      Buffer radius in selected units

      @property bufferRadius
      @type Number
      @default 0
    */
    bufferRadius: 0,

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
      to force <a> to be a map tool's wrapping element.

      @property tagName
      @type String
      @default 'a'
    */
    tagName: 'a',

    /**
      Map tool's wrapping <div> CSS-classes names.

      Any other CSS-classes can be added through component's 'class' property.
      ```handlebars
      {{flexberry-icon
        class="map icon"
      }}
      ```

      @property classNames
      @type String[]
      @default ['flexberry-maptool', 'item']
    */
    classNames: [flexberryClassNames.wrapper, 'item'],

    /**
      Map tool's class names bindings.

      @property classNameBindings
      @type String[]
      @default ['_hasSubmenu:ui', '_hasSubmenu:dropdown', '_hasIconOnly:icon',  '_isActive:active', 'readonly:disabled'],
    */
    classNameBindings: ['_hasSubmenu:ui', '_hasSubmenu:dropdown', '_hasIconOnly:icon', '_isActive:active', 'readonly:disabled'],

    /**
      Map tool's attributes bindings.

      @property attributeBindings
      @type String[]
      @default ['tooltip:title']
    */
    attributeBindings: ['tooltip:title'],

    /**
      Map tool's caption.

      @property caption
      @type String
      @default null
    */
    caption: null,

    /**
      Map tool's tooltip text.
      Will be added as wrapper's element 'title' attribute.

      @property tooltip
      @default null
    */
    tooltip: null,

    /**
      Map tool's icon CSS-class names.

      @property iconClass
      @type String
      @default null
    */
    iconClass: null,

    /**
      Flag: indicates whether map tool is in readonly mode.

      @property readonly
      @type Boolean
      @default false
    */
    readonly: false,

    /**
      Map tool name.

      @property name
      @type String
      @default null
    */
    name: null,

    /**
      Properties which will be passed to the map-tool when it will be instantiated.

      @property mapToolProperties
      @type Object
      @default null
    */
    mapToolProperties: null,

    /**
      Leaflet map.

      @property leafletMap
      @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
      @default null
    */
    leafletMap: null,

    /**
      Flag: indicates whether map tool is activated

      @property activated
      @type Boolean
      @default false
    */
    activated: false,

    /**
      Observes changes in {{#crossLink "BaseMapToolComponent/leafletMap:property"}}'leafletMap' property{{/crossLink}}.
      Activates default map-tool when leafletMap initialized and subscribes on flexberry-map:identificationOptionChanged event.

      @method _leafletMapDidChange
      @type Observer
      @private
    */
    _leafletMapDidChange: Ember.on('didRender', Ember.observer('leafletMap', function () {

      let leafletMap = this.get('leafletMap');
      if (Ember.isNone(leafletMap)) {
        return;
      }

      leafletMap.on('flexberry-map:identificationOptionChanged', this.forceMapToolActivation, this);
    })),

    actions: {
      /**
        Handles map-tools click event.
        Invokes {{#crossLink "BaseMapToolComponent/sendingActions.activate:method"}}'activate' action{{/crossLink}}.

        @method actions.click
        @param {<a href="http://learn.jquery.com/events/introduction-to-events/#the-event-object">jQuery event object</a>} e
        Click event object.
      */
      click(e) {
        this.activateMapTool(e);
      }
    },

    /**
      Apply buffer settings to existing mapTool

      @method _applyBufferSettings
      @private
    */
    _applyBufferSettings() {
      let tool = this.get('_mapTool');

      if (!Ember.isNone(tool)) {
        let bufferActive = this.get('bufferActive');
        let bufferRadius = this.get('bufferRadius');
        let bufferUnits = this.get('bufferUnits');

        tool.set('bufferActive', bufferActive);
        tool.set('bufferRadius', bufferRadius);
        tool.set('bufferUnits', bufferUnits);
      }
    },

    /**
      Invokes {{#crossLink "BaseMapToolComponent/sendingActions.activate:method"}}'activate' action{{/crossLink}}.

      @method activateMapTool
      @param {<a href="http://learn.jquery.com/events/introduction-to-events/#the-event-object">jQuery event object</a>} e
      Original event object.
    */
    activateMapTool(e) {
      this.set('activated', false);
      this.sendAction('activate', {
        mapTool: this.get('_mapTool'),
        target: this.$(),
        originalEvent: e
      });
    },

    /**
      Creates map-tool in component's initialization time.

      @method createMapTool
    */
    createMapTool() {
      let mapToolName = this.get('name');
      if (Ember.isBlank(mapToolName)) {
        return;
      }

      let mapTool = Ember.getOwner(this).lookup(`map-tool:${mapToolName}`);
      Ember.assert(
        `Can't lookup \`map-tool:${mapToolName}\` such map-tool doesn\`t exist`, !Ember.isNone(mapTool));

      let mapToolProperties = this.get('mapToolProperties');
      if (!Ember.isNone(mapToolProperties)) {
        Ember.A(Object.keys(mapToolProperties)).forEach((propertyName) => {
          Ember.set(mapTool, propertyName, Ember.get(mapToolProperties, propertyName));
        });
      }

      Ember.set(mapTool, 'name', mapToolName);

      this.set('_mapTool', mapTool);

      this._applyBufferSettings();

      // delayed activation of maptool
      if (this.get('activated')) {
        this.activateMapTool({
          mapToolName
        });
      }
    },

    /**
      Destroys map-tool in components destroy time.

      @method destroyMapTool
    */
    destroyMapTool() {
      let mapTool = this.get('_mapTool');
      if (!Ember.isNone(mapTool) && Ember.typeOf(mapTool.destroy) === 'function') {
        mapTool.destroy();
        this.set('_mapTool', null);
      }
    },

    /**
      Force map-tool to activate

      @method forceMapToolActivation
      @param {<a href="http://learn.jquery.com/events/introduction-to-events/#the-event-object">jQuery event object</a>} e
    */
    forceMapToolActivation(e) {
      let currentName = this.get('_mapTool.name');

      if (e.mapToolName === currentName) {
        this.activateMapTool(...arguments);
      } else {
        // changing mapToolName forces re-render so we make delayed activation
        this.set('activated', true);
      }
    },

    /**
      Initializes component.
    */
    init() {
      this._super(...arguments);

      this.createMapTool();
    },

    /**
      Initializes DOM-related component's properties  & logic.
    */
    didInsertElement() {
      this._super(...arguments);

      let $item = this.$();
      if (this.get('_hasSubmenu')) {
        // Initialize Semantic UI dropdown module.
        $item.dropdown();
      } else if (!Ember.isNone(MutationObserver)) {
        // Sometimes Semantic UI adds/removes classes too late what breaks results of component's class name bindings.
        // So to fix it, we need to observe changes in 'class' attribute through mutation observer.
        let classObserver = new MutationObserver((mutations) => {
          let isActive = this.get('_isActive');
          if (isActive && !$item.hasClass('active')) {
            $item.addClass('active');
            return;
          }

          if (!isActive && $item.hasClass('active')) {
            $item.removeClass('active');
            return;
          }
        });
        classObserver.observe($item[0], {
          attributes: true,
          attributeFilter: ['class']
        });
        this.set('_classObserver', classObserver);
      }
    },

    /**
      Handles DOM-related component's properties after each render.
    */
    didRender() {
      this._super(...arguments);

      let currentName = this.get('_mapTool.name');
      let newName = this.get('name');

      if (currentName === newName || Ember.isNone(this.get('_mapTool'))) {
        return;
      }

      // if map tool name has changed - recreate it
      this.destroyMapTool();
      this.createMapTool();
    },

    /**
      Destroys DOM-related component's properties & logic.
    */
    willDestroyElement() {
      this._super(...arguments);

      let $item = this.$();

      // Deinitialize Semantic UI dropdown module.
      $item.dropdown('destroy');

      // Disconnect mutation observer.
      let classObserver = this.get('_classObserver');
      if (!Ember.isNone(classObserver)) {
        classObserver.disconnect();
        this.set('_classObserver', null);
      }
    },

    /**
      Destroys component.
    */
    willDestroy() {
      this._super(...arguments);

      this.destroyMapTool();
    }

    /**
      Component's action invoking when component was initialized.

      @method sendingActions.initialize
      @param {Object} e Action's event object.
      @param {BaseMapTool} e.mapTool Map command that must be executed.
      @param {<a href="http://learn.jquery.com/using-jquery-core/jquery-object/">jQuery-object</a>} e.target
      jQuery element related to map command that must be executed.
      @param {<a href="http://learn.jquery.com/events/introduction-to-events/#the-event-object">jQuery event object</a>} [e.originalEvent=null]
      Event object related to event that triggered this action.
    */

    /**
      Component's action invoking when component was clicked & map tool must be activated.

      @method sendingActions.activate
      @param {Object} e Action's event object.
      @param {BaseMapTool} e.mapTool Map command that must be executed.
      @param {<a href="http://learn.jquery.com/using-jquery-core/jquery-object/">jQuery-object</a>} e.target
      jQuery element related to map command that must be executed.
      @param {<a href="http://learn.jquery.com/events/introduction-to-events/#the-event-object">jQuery event object</a>} e.originalEvent
      Event object related to event that triggered this action.
    */
  }
);

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
BaseMapToolComponent.reopenClass({
  flexberryClassNames
});

export default BaseMapToolComponent;
