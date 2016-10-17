/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Base map-tool.

  @class BaseMapTool
  @extends <a href="http://emberjs.com/api/classes/Ember.Object.html">Ember.Object</a>
  @uses <a href="http://emberjs.com/api/classes/Ember.Evented.html">Ember.Evented</a>
*/
export default Ember.Object.extend(Ember.Evented, {
  /**
    Flag: indicates whether map-tool is enabled or not.

    @property _enabled
    @type Boolean
    @default false
    @private
  */
  _enabled: false,

  /**
    Container of {{#crossLink "BaseMapTool/leafletMap:property"}}leaflet map related to map-tool{{/crossLink}}.

    @property leafletMapContainer
    @type
    @readOnly
    @private
  */
  _leafletMapContainer: Ember.computed('leafletMap', function() {
    let container = this.get('leafletMap._container');
    return Ember.isNone(container) ? null : Ember.$(container);
  }),

  /**
    Reference to i18n service.

    @property i18n
    @type <a href="https://github.com/jamesarosen/ember-i18n">I18nService</a>
    @default Ember.inject.service('i18n')
  */
  i18n: Ember.inject.service('i18n'),

  /**
    Flag: indicates whether map-tool is exclusive or not.
    Exclusive map-tool lives in enabled state until some other tool will be manually enabled.

    @property enabled
    @type Boolean
    @default true
  */
  exclusive: true,

  /**
    Tool's cursor CSS-class.

    @property cursor
    @type String
    @default ''
  */
  cursor: '',

  /**
    Leaflet map related to tool.

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

  /**
    Enables tool.

    @method _enable
    @private
  */
  _enable() {
    let $leafletMapContainer = this.get('_leafletMapContainer');
    let cursor = this.get('cursor');
    if (!Ember.isNone($leafletMapContainer) && !Ember.isBlank(cursor) && !$leafletMapContainer.hasClass(cursor)) {
      $leafletMapContainer.addClass(cursor);
    }
  },

  /**
    Disables tool.

    @method _disable
    @private
  */
  _disable() {
    let $leafletMapContainer = this.get('_leafletMapContainer');
    let cursor = this.get('cursor');
    if (!Ember.isNone($leafletMapContainer) && !Ember.isBlank(cursor) && $leafletMapContainer.hasClass(cursor)) {
      $leafletMapContainer.removeClass(cursor);
    }
  },

  /**
    Enables tool.

    @method enable
  */
  enable() {
    if (this.get('_enabled')) {
      return;
    }

    Ember.assert(
      `Wrong type of map-tool \`leafletMap\` property: ` +
      `actual type is ${Ember.typeOf(this.get('leafletMap'))}, but \`L.Map\` is expected.`,
      this.get('leafletMap') instanceof L.Map);

    this.set('_enabled', true);
    this._enable(...arguments);

    // Trigger 'enable' event.
    this.trigger('enable', {
      mapTool: this,
      arguments: arguments
    });
  },

  /**
    Disables tool.

    @method disable
  */
  disable() {
    if (!this.get('_enabled')) {
      return;
    }

    this.set('_enabled', false);
    this._disable(...arguments);

    // Trigger 'disable' event.
    this.trigger('disable', {
      mapTool: this,
      arguments: arguments
    });
  },

  /**
    Destroys map tool.
  */
  willDestroy() {
    this._super(...arguments);

    this.disable();
    this.set('leafletMap', null);
    this.set('layers', null);
  }

  /**
    Event that signalizes that map-tool becomes enabled.

    @method events.enable
  */

  /**
    Event that signalizes that map-tool becomes disabled.

    @method events.disable
  */
});
