/**
  @module ember-flexberry-gis
*/

import { scheduleOnce } from '@ember/runloop';

import { assert } from '@ember/debug';
import { inject as service } from '@ember/service';
import $ from 'jquery';
import { isNone, isBlank, typeOf } from '@ember/utils';
import Evented from '@ember/object/evented';
import EmberObject, { computed } from '@ember/object';
import LeafletMapVisibilityMixin from '../mixins/leaflet-map/map-visibility';

/**
  Base map-tool.

  @class BaseMapTool
  @extends <a href="http://emberjs.com/api/classes/Ember.Object.html">Ember.Object</a>
  @uses <a href="http://emberjs.com/api/classes/Ember.Evented.html">Ember.Evented</a>
*/
export default EmberObject.extend(Evented,
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
    _leafletMapContainer: computed('leafletMap', function () {
      const container = this.get('leafletMap._container');
      return isNone(container) ? null : $(container);
    }),

    /**
    Reference to i18n service.

    @property i18n
    @type <a href="https://github.com/jamesarosen/ember-i18n">I18nService</a>
    @default Ember.inject.service('i18n')
  */
    i18n: service('i18n'),

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
      const $leafletMapContainer = this.get('_leafletMapContainer');
      const cursor = this.get('cursor');
      if (!isNone($leafletMapContainer) && !isBlank(cursor) && !$leafletMapContainer.hasClass(cursor)) {
        $leafletMapContainer.addClass(cursor);
      }
    },

    /**
    Disables tool.

    @method _disable
    @private
  */
    _disable() {
      const $leafletMapContainer = this.get('_leafletMapContainer');
      const cursor = this.get('cursor');
      if (!isNone($leafletMapContainer) && !isBlank(cursor) && $leafletMapContainer.hasClass(cursor)) {
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

      const leafletMap = this.get('leafletMap');
      assert(
        'Wrong type of map-tool `leafletMap` property: '
      + `actual type is ${typeOf(this.get('leafletMap'))}, but \`L.Map\` is expected.`,
        leafletMap instanceof L.Map
      );

      this.set('_enabled', true);
      this._enable(...arguments);

      scheduleOnce('afterRender', this, function () {
        // Trigger common 'enable' event.
        leafletMap.fire('flexberry-map:tools:enable', {
          mapTool: this,
        });

        // Trigger tool specific 'enable' event.
        const mapToolName = this.get('name');
        leafletMap.fire(`flexberry-map:tools:${mapToolName}:enable`, {
          mapTool: this,
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

      const leafletMap = this.get('leafletMap');
      assert(
        'Wrong type of map-tool `leafletMap` property: '
      + `actual type is ${typeOf(this.get('leafletMap'))}, but \`L.Map\` is expected.`,
        leafletMap instanceof L.Map
      );

      this.set('_enabled', false);
      this._disable(...arguments);

      // Trigger common 'disable' event.
      leafletMap.fire('flexberry-map:tools:disable', {
        mapTool: this,
      });

      // Trigger tool specific 'disable' event.
      const mapToolName = this.get('name');
      leafletMap.fire(`flexberry-map:tools:${mapToolName}:disable`, {
        mapTool: this,
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
      const mapToolName = this.get('name');
      this.showHideTool(mapToolName, true, this.addClassHidden);
    },

    showTool() {
      const mapToolName = this.get('name');
      this.showHideTool(mapToolName, true, this.removeClassHidden);
    },
  });
