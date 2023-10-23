/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Markers styles renderer service.

  @class MarkersStylesRendererService
  @extends Ember.Service
*/
export default Ember.Service.extend({
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
    let markerStyle = this.get(`_markersStyles.${type}`);
    if (Ember.isNone(markerStyle)) {
      Ember.Logger.error(`Service 'markers-styles-renderer' can't find '${type}' markers-style, it doesn't exist.`);
    }

    return markerStyle;
  },

  /**
    Initializes service.
  */
  init() {
    this._super(...arguments);

    let availableMarkersStyles = {};
    let owner = Ember.getOwner(this);
    let availableMarkersStylesTypes = owner.knownNamesForType(`markers-style`);
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
    let markerStyle = this._getMarkerStyle(type);
    if (Ember.isNone(markerStyle)) {
      Ember.Logger.error(`Service 'markers-styles-renderer' can't get default style settings for '${type}' markers-style.`);
      return null;
    }

    return {
      type: type,
      style: markerStyle.getDefaultStyleSettings()
    };
  },

  /**
    Gets style for default marker.

    @method getDefaultMarkerSettings
    @return {Object} Hash containing default style settings (for example { iconUrl: ..., shadowUrl: ..., ... }).
  */
  getDefaultMarkerSettings() {
    let markerStyle = this._getMarkerStyle('image');
    if (Ember.isNone(markerStyle)) {
      Ember.Logger.error(`Service 'markers-styles-renderer' can't get default style settings for '${type}' markers-style.`);
      return null;
    }

    return markerStyle.getDefaultStyleSettings();
  },

  /**
    Applies marker-style to the specified leaflet marker.

    @method renderOnLeafletMarker
    @param {Object} options Method options.
    @param {String} options.type Layer style type.
    @param {<a =ref="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>} options.leafletLayer Leaflet layer to which layer-style must be applied.
    @param {Object} options.styleSettings Hash containing style settings.
  */
  renderOnLeafletMarker({ marker, styleSettings }) {
    let type = Ember.get(styleSettings, 'type');
    let style = Ember.get(styleSettings, 'style');

    let markerStyle = this._getMarkerStyle(type);
    if (Ember.isNone(markerStyle)) {
      Ember.Logger.error(`Service 'markers-styles-renderer' can't render '${type}' markers-style on leaflet marker.`);
      return;
    }

    markerStyle.renderOnLeafletMarker({ marker, style });
  },

  /**
    Renderes marker-style preview on the specified canvas element.

    @method renderOnCanvas
    @param {Object} options Method options.
    @param {<a =ref="https://developer.mozilla.org/ru/docs/Web/HTML/Element/canvas">Canvas</a>} options.canvas Canvas element on which layer-style preview must be rendered.
    @param {Object} options.styleSettings Hash containing style settings.
    @param {Object} [options.target = 'preview'] Render target ('preview' or 'legend').
  */
  renderOnCanvas({ canvas, styleSettings, target, scale }) {
    target = target || 'preview';

    if (Ember.isArray(styleSettings)) {
      if (!scale && styleSettings.length > 1) {
        scale = this.calcScale(styleSettings);
      }

      styleSettings.forEach(settings => {
        let type = Ember.get(settings, 'type');
        let style = Ember.get(settings, 'style');

        let markerStyle = this._getMarkerStyle(type);
        if (Ember.isNone(markerStyle)) {
          Ember.Logger.error(`Service 'markers-styles-renderer' can't render '${type}' markers-style on canvas.`);
          return;
        }

        markerStyle.renderOnCanvas({ canvas, style, target, scale });
      });
    } else {
      let type = Ember.get(styleSettings, 'type');
      let style = Ember.get(styleSettings, 'style');

      let markerStyle = this._getMarkerStyle(type);
      if (Ember.isNone(markerStyle)) {
        Ember.Logger.error(`Service 'markers-styles-renderer' can't render '${type}' markers-style on canvas.`);
        return;
      }

      markerStyle.renderOnCanvas({ canvas, style, target, scale });
    }
  },

  /**
    Size canvas for legend.

    @property size
    @type Number
    @default 24
    @private
  */
  _size: 24,

  /**
    Calculate scale for canvas of legend.

    @method calcScale
    @param {Object} styleSettings style settings.
    @return {Object} Hash containing style settings.
  */
  calcScale(styleSettings) {
    let maxSize = this.get('_size');
    let max = 0;
    let top = 0, bottom = 0, left = 0, right = 0;
    if (!Ember.isArray(styleSettings)) {
      let style = styleSettings.style;
      if (styleSettings.type === 'default') {
        style = this.getDefaultMarkerSettings();
      }

      let iconWidth = style.iconSize[0];
      let iconHeight = style.iconSize[1];
      return iconWidth > maxSize || iconHeight > maxSize ?
        Math.min(maxSize / iconWidth, maxSize / iconHeight) :
        1;
    }

    if (styleSettings.length === 1) {
      let iconSize;
      if (styleSettings.get('firstObject.type') === 'default') {
        iconSize = this.getDefaultMarkerSettings().iconSize;
      } else {
        iconSize = styleSettings.get('firstObject.style.iconSize')
      }

      max = Math.max(iconSize[0], iconSize[1]);
    } else {
      styleSettings.forEach((settings) => {
        let style = settings.style;
        if (settings.type === 'default') {
          style = this.getDefaultMarkerSettings();
        }

        if (!Ember.isNone(style)) {
          let width = style.iconSize[0];
          let height = style.iconSize[1];
          let anchorH = style.iconAnchor[1];
          let anchorW = style.iconAnchor[0];

          if ((0 - anchorH) < top) { top = (0 - anchorH); }
          if ((height - anchorH) > bottom) { bottom = (height - anchorH); }
          if ((0 - anchorW) < left) { left = (0 - anchorW); }
          if ((width - anchorW) > right) { right = (width - anchorW); }
        }
      });

      max = (Math.max(Math.abs(top), Math.abs(bottom), Math.abs(left), Math.abs(right))) * 2;
    }

    if (max <= maxSize) {
      return 1;
    }

    return maxSize / max;
  }
});
