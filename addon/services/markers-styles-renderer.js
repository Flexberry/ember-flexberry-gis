/**
  @module ember-flexberry-gis
*/

import { get } from '@ember/object';

import { getOwner } from '@ember/application';
import { isNone } from '@ember/utils';
import Service from '@ember/service';

import Ember from 'ember';

/**
  Markers styles renderer service.

  @class MarkersStylesRendererService
  @extends Ember.Service
*/
export default Service.extend({
  /**
    Hash containing cached instances of available markers styles.

    @property _markersStyles
    @type Object
    @default null
    @private
  */
  _markersStyles: null,

  /**
    Array containing cached names of available markers styles.

    @property _markersStylesTypes
    @type String[]
    @default null
    @private
  */
  _markersStylesTypes: null,

  /**
    Gets marker style.

    @method _getMarkerStyle
    @param {String} type Marker style type.
    @return {Object} Marker style.
  */
  _getMarkerStyle(type) {
    const markerStyle = this.get(`_markersStyles.${type}`);
    if (isNone(markerStyle)) {
      Ember.Logger.error(`Service 'markers-styles-renderer' can't find '${type}' markers-style, it doesn't exist.`);
    }

    return markerStyle;
  },

  /**
    Initializes service.
  */
  init() {
    this._super(...arguments);

    const availableMarkersStyles = {};
    const owner = getOwner(this);
    const availableMarkersStylesTypes = owner.knownNamesForType('markers-style');
    availableMarkersStylesTypes.forEach((type) => {
      availableMarkersStyles[type] = owner.lookup(`markers-style:${type}`);
    });

    this.set('_markersStyles', availableMarkersStyles);
    this.set('_markersStylesTypes', availableMarkersStylesTypes);
  },

  /**
    Gets available markers styles types.

    @method getAvailablemarkerStylesTypes
    @param {String} type Marker style type.
    @return {Strng[]} Array containing available 'markers-styles' types.
  */
  getAvailableMarkerStylesTypes() {
    return this.get('_markersStylesTypes');
  },

  /**
    Gets default style settings.

    @method getDefaultStyleSettings
    @param {String} type Marker style type.
    @return {Object} Hash containing style type and it's default style settings (for example { type: 'image', style: { iconUrl: ..., shadowUrl: ..., ... } }).
  */
  getDefaultStyleSettings(type) {
    const markerStyle = this._getMarkerStyle(type);
    if (isNone(markerStyle)) {
      Ember.Logger.error(`Service 'markers-styles-renderer' can't get default style settings for '${type}' markers-style.`);
      return null;
    }

    return {
      type,
      style: markerStyle.getDefaultStyleSettings(),
    };
  },

  /**
    Applies marker-style to the specified leaflet marker.

    @method renderOnLeafletMarker
    @param {Object} options Method options.
    @param {String} options.type Layer style type.
    @param {<a =ref="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>} options.leafletLayer Leaflet layer to which layer-style must be applied.
    @param {Object} options.styleSettings Hash containing style settings.
  */
  renderOnLeafletMarker({ marker, styleSettings, }) {
    const type = get(styleSettings, 'type');
    const style = get(styleSettings, 'style');

    const markerStyle = this._getMarkerStyle(type);
    if (isNone(markerStyle)) {
      Ember.Logger.error(`Service 'markers-styles-renderer' can't render '${type}' markers-style on leaflet marker.`);
      return;
    }

    markerStyle.renderOnLeafletMarker({ marker, style, });
  },

  /**
    Renderes marker-style preview on the specified canvas element.

    @method renderOnCanvas
    @param {Object} options Method options.
    @param {<a =ref="https://developer.mozilla.org/ru/docs/Web/HTML/Element/canvas">Canvas</a>}
      options.canvas Canvas element on which layer-style preview must be rendered.
    @param {Object} options.styleSettings Hash containing style settings.
    @param {Object} [options.target = 'preview'] Render target ('preview' or 'legend').
  */
  renderOnCanvas({ canvas, styleSettings, target, }) {
    target = target || 'preview';

    const type = get(styleSettings, 'type');
    const style = get(styleSettings, 'style');

    const markerStyle = this._getMarkerStyle(type);
    if (isNone(markerStyle)) {
      Ember.Logger.error(`Service 'markers-styles-renderer' can't render '${type}' markers-style on canvas.`);
      return;
    }

    markerStyle.renderOnCanvas({ canvas, style, target, });
  },
});
