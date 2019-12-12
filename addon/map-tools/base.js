/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import LeafletMapVisibilityMixin from '../mixins/leaflet-map/map-visibility';

/**
  Base map-tool.

  @class BaseMapTool
  @extends <a href="http://emberjs.com/api/classes/Ember.Object.html">Ember.Object</a>
  @uses <a href="http://emberjs.com/api/classes/Ember.Evented.html">Ember.Evented</a>
*/
export default Ember.Object.extend(Ember.Evented,
  LeafletMapVisibilityMixin, {
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
    Tool's name.

    @property name
    @type String
    @default null
  */
  name: null,

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

    let leafletMap = this.get('leafletMap');
    Ember.assert(
      `Wrong type of map-tool \`leafletMap\` property: ` +
      `actual type is ${Ember.typeOf(this.get('leafletMap'))}, but \`L.Map\` is expected.`,
      leafletMap instanceof L.Map);

    this.set('_enabled', true);
    this._enable(...arguments);

    Ember.run.scheduleOnce('afterRender', this, function () {

      // Trigger common 'enable' event.
      leafletMap.fire('flexberry-map:tools:enable', {
        mapTool: this
      });

      // Trigger tool specific 'enable' event.
      let mapToolName = this.get('name');
      leafletMap.fire(`flexberry-map:tools:${mapToolName}:enable`, {
        mapTool: this
      });
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

    let leafletMap = this.get('leafletMap');
    Ember.assert(
      `Wrong type of map-tool \`leafletMap\` property: ` +
      `actual type is ${Ember.typeOf(this.get('leafletMap'))}, but \`L.Map\` is expected.`,
      leafletMap instanceof L.Map);

    this.set('_enabled', false);
    this._disable(...arguments);

    // Trigger common 'disable' event.
    leafletMap.fire('flexberry-map:tools:disable', {
      mapTool: this
    });

    // Trigger tool specific 'disable' event.
    let mapToolName = this.get('name');
    leafletMap.fire(`flexberry-map:tools:${mapToolName}:disable`, {
      mapTool: this
    });
  },

  /**
    Destroys map tool.
  */
  willDestroy() {
    this._super(...arguments);

    this.disable();
    this.set('leafletMap', null);
  },

  hideTool() {
    let mapToolName = this.get('name');
    this.showHideTool(mapToolName, true, this.addClassHidden);
  },

  showTool() {
    let mapToolName = this.get('name');
    this.showHideTool(mapToolName, true, this.removeClassHidden);
  }
});
