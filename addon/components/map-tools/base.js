/**
  @module ember-flexberry-gis
*/

import { htmlSafe, isHTMLSafe } from '@ember/template';

import $ from 'jquery';
import { typeOf, isNone, isBlank } from '@ember/utils';
import { computed, get, observer } from '@ember/object';
import Component from '@ember/component';

import Ember from 'ember';
import SlotsMixin from 'ember-block-slots';
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
  icon: `${flexberryClassNamesPrefix}-icon`,
  submenu: `${flexberryClassNamesPrefix}-submenu`,
  submenuIcon: `${flexberryClassNamesPrefix}-submenu-icon`,
};

/**
  Flexberry map tool component.
  Component must be used in combination with {{#crossLink "FlexberryMaptoolbarComponent"}}flexberry-maptoolbar component{{/crossLink}}
  as a wrapper for map tools components.

  Usage:
  templates/my-map-form.hbs
  ```handlebars
  {{#flexberry-maptoolbar}}
    {{map-tools/base name="my-map-tool" leafletMap=leafletMap}}
  {{/flexberry-maptoolbar}}
  ```

  @class BaseMapToolComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses <a href="https://github.com/ciena-blueplanet/ember-block-slots#usage">SlotsMixin</a>
  @uses DomActionsMixin
*/
const BaseMapToolComponent = Component.extend(SlotsMixin, {
  /**
    Mutation observer that observes changes in component's 'class' attribute.

    @property _classObserver
    @type <a href="https://developer.mozilla.org/en/docs/Web/API/MutationObserver">MutationObserver</a>
    @default null
    @private
  */
  _classObserver: null,

  /**
    Flag: indicates whether some nested content for submenu is defined
    (some yield markup for 'submenu' block-slot).

    @property _hasSubmenu
    @type boolean
    @readOnly
    @private
  */
  _hasSubmenu: computed('_slots.[]', function () {
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
  _hasCaption: computed('caption', function () {
    const caption = this.get('caption');
    return typeOf(caption) === 'string' && $.trim(caption) !== ''
      || typeOf(isHTMLSafe) === 'function' && isHTMLSafe(caption) && $.trim(get(caption, 'string')) !== ''
      || caption instanceof htmlSafe && $.trim(get(caption, 'string')) !== '';
  }),

  /**
    Flag: indicates whether map tool has icon or not.

    @property _hasIcon
    @type Boolean
    @readOnly
    @private
  */
  _hasIcon: computed('iconClass', function () {
    const iconClass = this.get('iconClass');
    return typeOf(iconClass) === 'string' && $.trim(iconClass) !== '';
  }),

  /**
    Flag: indicates whether map tool has icon only (without caption).

    @property _hasIconOnly
    @type Boolean
    @readOnly
    @private
  */
  _hasIconOnly: computed('_hasIcon', '_hasCaption', function () {
    return this.get('_hasIcon') && !this.get('_hasCaption');
  }),

  /**
    Flag: indicates whether related map-tool is enabled or not.

    @type Boolean
    @default false
    @private
  */
  _isActive: false,

  /**
    Map tool name specified before changes.

    @type String
    @default null
    @private
  */
  _previousName: null,

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
    {{map-tools/base
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
    Handles leafletMap's 'flexberry-map:tools:enable' event.

    @method actions.onMapToolEnable
    @param {Object} e Event object.
    @param {Object} e.mapTool Enabled map tool.
    @param {Object[]} e.arguments Arguments passed to map tool's 'enable' method.
  */
  onMapToolEnable(e) {
    this.set('_isActive', true);
  },

  /**
    Handles leafletMap's 'flexberry-map:tools:disable' event.

    @method actions.onMapToolEnable
    @param {Object} e Event object.
    @param {Object} e.mapTool Disabled map tool.
    @param {Object[]} e.arguments Arguments passed to map tool's 'disable' method.
  */
  onMapToolDisable(e) {
    this.set('_isActive', false);
  },

  /**
    Handles map-tool's 'click' event.

    @method click
    @param {<a href="http://learn.jquery.com/events/introduction-to-events/#the-event-object">jQuery event object</a>} e
    Click event object.
  */
  click(e) {
    this.activateMapTool();
  },

  /**
    Performs map-tool's activation.

    @method activateMapTool
  */
  activateMapTool() {
    if (this.get('_hasSubmenu') || this.get('isActive')) {
      // Tool with submenu is just a wrapper, it shouldn't really enable map-tool.
      // Also if tool is alreay active, then it shouldn't be enabled again.
      return;
    }

    const leafletMap = this.get('leafletMap');
    const mapToolName = this.get('name');
    const mapToolProperties = this.get('mapToolProperties');

    leafletMap.flexberryMap.tools.enable(mapToolName, mapToolProperties);
  },

  /**
    Attaches leaflet map event handlers.

    @param {Object} leafletMap Leaflet map.
  */
  attachLeafletMapEventHandlers(leafletMap) {
    const mapToolName = this.get('name');
    if (!isNone(leafletMap) && !isBlank(mapToolName)) {
      leafletMap.off(`flexberry-map:tools:${mapToolName}:enable`, this.onMapToolEnable, this);
      leafletMap.off(`flexberry-map:tools:${mapToolName}:disable`, this.onMapToolDisable, this);
    }
  },

  /**
    Detaches leaflet map event handlers.

    @param {Object} leafletMap Leaflet map.
  */
  detachLeafletMapEventHandlers(leafletMap) {
    const mapToolPreviousName = this.get('_previousName');
    if (!isNone(leafletMap) && !isBlank(mapToolPreviousName)) {
      leafletMap.off(`flexberry-map:tools:${mapToolPreviousName}:enable`, this.onMapToolEnable, this);
      leafletMap.off(`flexberry-map:tools:${mapToolPreviousName}:disable`, this.onMapToolDisable, this);
    }

    const mapToolName = this.get('name');
    if (!isNone(leafletMap) && !isBlank(mapToolName)) {
      leafletMap.off(`flexberry-map:tools:${mapToolName}:enable`, this.onMapToolEnable, this);
      leafletMap.off(`flexberry-map:tools:${mapToolName}:disable`, this.onMapToolDisable, this);
    }
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    // Store initila tool name is '_previousName'.
    const mapToolName = this.get('name');
    this.set('_previousName', mapToolName);
  },

  /**
    Initializes DOM-related component's properties  & logic.
  */
  didInsertElement() {
    this._super(...arguments);

    const $item = this.$();
    if (this.get('_hasSubmenu')) {
      // Initialize Semantic UI dropdown module.
      $item.dropdown();
    } else if (!isNone(MutationObserver)) {
      // Sometimes Semantic UI adds/removes classes too late what breaks results of component's class name bindings.
      // So to fix it, we need to observe changes in 'class' attribute through mutation observer.
      const classObserver = new MutationObserver((mutations) => {
        const isActive = this.get('_isActive');
        if (isActive && !$item.hasClass('active')) {
          $item.addClass('active');
          return;
        }

        if (!isActive && $item.hasClass('active')) {
          $item.removeClass('active');
        }
      });

      classObserver.observe($item[0], {
        attributes: true,
        attributeFilter: ['class'],
      });

      this.set('_classObserver', classObserver);
    }
  },

  /**
    Destroys DOM-related component's properties & logic.
  */
  willDestroyElement() {
    this._super(...arguments);

    // Deinitialize Semantic UI dropdown module.
    const $item = this.$();
    $item.dropdown('destroy');

    // Disconnect mutation observer.
    const classObserver = this.get('_classObserver');
    if (!isNone(classObserver)) {
      classObserver.disconnect();
      this.set('_classObserver', null);
    }

    // Detach leaflet map event handlers.
    const leafletMap = this.get('leafletMap');
    this.detachLeafletMapEventHandlers(leafletMap);
  },

  /**
    Observes changes in {{#crossLink "BaseMapToolComponent/leafletMap:property"}}'leafletMap' property{{/crossLink}},
    and {{#crossLink "BaseMapToolComponent/name:property"}}'name' property{{/crossLink}}.
    Attaches leafletMap event handlers.

    @method _leafletMapOrNameDidChange
    @private
  */
  _leafletMapOrNameDidChange: observer('leafletMap', 'name', function () {
    const leafletMap = this.get('leafletMap');
    if (isNone(leafletMap)) {
      return;
    }

    const mapToolPreviousName = this.get('_previousName');
    const mapToolName = this.get('name');
    if (!isBlank(mapToolPreviousName) && mapToolPreviousName !== mapToolName) {
      // Detach previously attached leaflet map event handlers.
      this.detachLeafletMapEventHandlers(leafletMap);
    }

    if (!isBlank(mapToolName)) {
      // Attach new leaflet map event handlers.
      this.attachLeafletMapEventHandlers(leafletMap);
    }

    this.set('_previousName', mapToolName);
  }),
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
BaseMapToolComponent.reopenClass({
  flexberryClassNames,
});

export default BaseMapToolComponent;
