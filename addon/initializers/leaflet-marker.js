/**
  @module ember-flexberry
*/

import Ember from 'ember';

export function initialize() {
  L.Marker.include({
    /**
      Style for marker.
      @method setStyle
      @param {Object} style style for marker
      @returns {Object} Returns L.Marker.

      style: {isImage: false,
          options: {
            className: classCss,
            html: text
          }
      }
    */
    setStyle: function (style) {
      let legendStyle = {
        type: 'default',
        style: null
      };

      if (Ember.isNone(this.styleIsSet) || !this.styleIsSet) {
        if (!Ember.isNone(style) && !Ember.isNone(style.isImage) && (style.isImage === 'false' || !style.isImage)) {
          let html = this._parseString(style.options.html);
          let label = this._createStringLabel(html, this);
          let opt = Object.assign({}, style.options);
          opt.html = label;
          this.setIcon(new L.divIcon(opt));
          this.style = opt;
          this.styleIsSet = true;
        } else if (!Ember.isNone(style) && !Ember.isNone(style.options)) {
          this.setIcon(new L.Icon(style.options));
          legendStyle = {
            type: 'image',
            style: style.options
          };
        } else if (Ember.isNone(this.options.icon.options.iconUrl)) {
          this.setIcon(new L.Icon.Default());
        }
      } else if (Ember.isNone(this.styleIsSet)) {
        if (!Ember.isNone(this.style) && !Ember.isNone(this.style.html)) {
          this.setIcon(new L.divIcon(this.style));
        }

        this.styleIsSet = false;
      }

      if (!Ember.isNone(this.layerModel) && Ember.isNone(this.layerModel.legendStyle)) {
        this.layerModel.legendStyle = legendStyle;
      }

      return this;
    },

    /**
      @method baseSetIcon(icon: Icon): this
      Original code https://github.com/Leaflet/Leaflet/blob/main/src/layer/marker/Marker.js#L181
    */
    baseSetIcon(icon) {
      this.options.icon = icon;

      if (this._map) {
        this._initIcon();
        this.update();
      }

      if (this._popup) {
        this.bindPopup(this._popup, this._popup.options);
      }

      return this;
    },

    /**
      @method onAdd(map)
      Override https://github.com/Leaflet/Leaflet/blob/main/src/layer/marker/Marker.js#L115
      Add marker in map for each styles options.
    */
    onAdd(map) {
      this._zoomAnimated = this._zoomAnimated && map.options.markerZoomAnimation;

      if (this._zoomAnimated) {
        map.on('zoomanim', this._animateZoom, this);
      }

      if (this.iconOptions) {
        this._icon = Ember.A();
        this.iconOptions.forEach(icon => {
          this._initIcon(icon);
          this.update();
        });
      } else {
        this._initIcon();
        this.update();
      }
    },

    /**
      @method setIcon(icon: Icon): this
	    Override https://github.com/Leaflet/Leaflet/blob/main/src/layer/marker/Marker.js#L181
      Changes the marker icon. If style one call base method. Otherwise call method for each styles.
    */
    setIcon(icon) {
      if (!Ember.isArray(icon)) {
        this.baseSetIcon(icon);
      } else {
        this.iconOptions = icon;
        if (this._icon) {
          this._removeIcon();
        }

        this._icon = Ember.A();
        icon.forEach(iconOptions => {
          if (this._map) {
            this._initIcon(iconOptions);
            this.update();
          }

          if (this._popup) {
            L.Marker.prototype.bindPopup.call(this._popup, this._popup.options);
          }
        });

      }
    },

    /**
      @method _initIcon(iconOptions)
      Override https://github.com/Leaflet/Leaflet/blob/main/src/layer/marker/Marker.js#L211
      Add marker on DOM. Accepts input options unlike the original method.
    */
    _initIcon(iconOptions) {
      let options = this.options;
      let addIcon = false;

      if (iconOptions) {
        options.icon = iconOptions;
        addIcon = true;
      }

      const classToAdd = `leaflet-zoom-${this._zoomAnimated ? 'animated' : 'hide'}`;

      const icon = options.icon.createIcon(this._icon);

      // if we're not reusing the icon, remove the old one and init new one
      if (icon !== this._icon && (!this.iconOptions || !iconOptions)) {
        if (this._icon) {
          this._removeIcon();
        }

        addIcon = true;

        if (options.title) {
          icon.title = options.title;
        }

        if (icon.tagName === 'IMG') {
          icon.alt = options.alt || '';
        }
      }

      icon.classList.add(classToAdd);

      if (options.keyboard) {
        icon.tabIndex = '0';
        icon.setAttribute('role', 'button');
      }

      if (this.iconOptions && iconOptions) {
        this._icon.addObject(icon);
      } else {
        this._icon = icon;
      }

      if (options.riseOnHover) {
        this.on({
          mouseover: this._bringToFront,
          mouseout: this._resetZIndex
        });
      }

      if (this.options.autoPanOnFocus) {
        L.DomEvent.on(icon, 'focus', this._panOnFocus, this);
      }

      const newShadow = options.icon.createShadow(this._shadow);
      let addShadow = false;

      if (newShadow !== this._shadow) {
        this._removeShadow();
        addShadow = true;
      }

      if (newShadow) {
        newShadow.classList.add(classToAdd);
        newShadow.alt = '';
      }

      this._shadow = newShadow;

      if (options.opacity < 1) {
        this._updateOpacity();
      }

      if (addIcon) {
        this.getPane().appendChild(icon);
      }

      this._initInteraction(icon);
      if (newShadow && addShadow) {
        this.getPane(options.shadowPane).appendChild(this._shadow);
      }
    },

    /**
      @method _initInteraction(icon)
      Override https://github.com/Leaflet/Leaflet/blob/main/src/layer/marker/Marker.js#L335
      Makes the marker interactive. Accepts input icon unlike the original method.
    */
    _initInteraction(icon) {

      if (!this.options.interactive) { return; }

      icon.classList.add('leaflet-interactive');

      L.Marker.prototype.addInteractiveTarget.call(this, icon);

      if (MarkerDrag) {
        let draggable = this.options.draggable;
        if (this.dragging) {
          draggable = this.dragging.enabled();
          this.dragging.disable();
        }

        this.dragging = new MarkerDrag(this);

        if (draggable) {
          this.dragging.enable();
        }
      }
    },

    /**
      @method _setPos(pos)
      Override https://github.com/Leaflet/Leaflet/blob/main/src/layer/marker/Marker.js#L308
      Set position for each icon.
    */
    _setPos(pos) {

      if (this._icon) {
        if (Ember.isArray(this._icon)) {
          this._icon.forEach(icon => { L.DomUtil.setPosition(icon, pos); });
        } else {
          L.DomUtil.setPosition(this._icon, pos);
        }
      }

      if (this._shadow) {
        L.DomUtil.setPosition(this._shadow, pos);
      }

      this._zIndex = pos.y + this.options.zIndexOffset;

      this._resetZIndex();
    },

    /**
      @method _updateZIndex(offset)
      Override https://github.com/Leaflet/Leaflet/blob/main/src/layer/marker/Marker.js#L323
      Update z-index for each icon.
    */
    _updateZIndex(offset) {
      if (this._icon) {
        if (Ember.isArray(this._icon)) {
          this._icon.forEach(icon => { icon.style.zIndex = this._zIndex + offset; });
        } else {
          this._icon.style.zIndex = this._zIndex + offset;
        }
      }
    },

    /**
      @method _updateOpacity()
      Override https://github.com/Leaflet/Leaflet/blob/main/src/layer/marker/Marker.js#L369
      Update opacity for each icon.
    */
    _updateOpacity() {
      const opacity = this.options.opacity;

      if (this._icon) {
        if (Ember.isArray(this._icon)) {
          this._icon.forEach(icon => { icon.style.opacity = opacity; });
        } else {
          this._icon.style.opacity = opacity;
        }
      }

      if (this._shadow) {
        this._shadow.style.opacity = opacity;

      }
    },

    /**
      @method _removeIcon()
      Override https://github.com/Leaflet/Leaflet/blob/main/src/layer/marker/Marker.js#L283
      Remove all icon from DOM.
    */
    _removeIcon() {
      if (this.options.riseOnHover) {
        this.off({
          mouseover: this._bringToFront,
          mouseout: this._resetZIndex
        });
      }

      if (this._icon) {
        if (Ember.isArray(this._icon)) {
          this._icon.forEach(icon => {
            if (this.options.autoPanOnFocus) {
              L.DomEvent.off(icon, 'focus', this._panOnFocus, this);
            }

            icon.remove();
            L.Marker.prototype.removeInteractiveTarget.call(this, icon);
          });
        } else {
          if (this.options.autoPanOnFocus) {
            L.DomEvent.off(this._icon, 'focus', this._panOnFocus, this);
          }

          this._icon.remove();
          L.Marker.prototype.removeInteractiveTarget.call(this, this._icon);
        }
      }

      this._icon = null;
    },

    /**
      Create array of strings and feature properies.
      @method _parseString
      @param {String} expression String for parsing
    */
    _parseString(expression) {
      if (Ember.isBlank(expression)) {
        return null;
      }

      let exp = expression.trim();
      let reg = /'(.+?)'/g;
      let expResult = exp.split(reg).filter(x => x !== '');
      return expResult ? expResult : null;
    },

    /**
      Create label string.
      @method _createStringLabel
      @param {Array} expResult Create array of strings and feature properies
    */
    _createStringLabel(expResult, featureLayer) {
      let label = '';
      let isProp = false;
      expResult.forEach(function(element) {
        for (let key in featureLayer.feature.properties) {
          if (key === element && !Ember.isNone(featureLayer.feature.properties[key]) && !Ember.isBlank(featureLayer.feature.properties[key])) {
            label += featureLayer.feature.properties[key];
            isProp = true;
          }
        }

        label += !isProp ? element : '';
        isProp = false;
      });

      return label;
    }
  });

  /*
    https://github.com/Leaflet/Leaflet/blob/main/src/layer/marker/Marker.Drag.js
    L.Handler.MarkerDrag is used internally by L.Marker to make the markers draggable.
    Original handler because it not in outside.
  */
  let MarkerDrag = L.Handler.extend({
    initialize: function (marker) {
      this._marker = marker;
    },

    addHooks: function () {
      var icon = this._marker._icon;

      if (!this._draggable) {
        if (Ember.isArray(icon)) {
          icon.forEach(_icon => {
            this._draggable = new L.Draggable(_icon, _icon, true);
          });
        } else {
          this._draggable = new L.Draggable(icon, icon, true);
        }
      }

      this._draggable.on({
        dragstart: this._onDragStart,
        predrag: this._onPreDrag,
        drag: this._onDrag,
        dragend: this._onDragEnd
      }, this).enable();

      if (Ember.isArray(icon)) {
        icon.forEach(_icon => {
          L.DomUtil.addClass(_icon, 'leaflet-marker-draggable');
        });
      } else {
        L.DomUtil.addClass(icon, 'leaflet-marker-draggable');
      }
    },

    removeHooks: function () {
      this._draggable.off({
        dragstart: this._onDragStart,
        predrag: this._onPreDrag,
        drag: this._onDrag,
        dragend: this._onDragEnd
      }, this).disable();

      if (this._marker._icon) {
        if (Ember.isArray(this._marker._icon)) {
          this._marker._icon.forEach(_icon => {
            L.DomUtil.removeClass(_icon, 'leaflet-marker-draggable');
          });
        } else {
          L.DomUtil.removeClass(this._marker._icon, 'leaflet-marker-draggable');
        }
      }
    },

    moved: function () {
      return this._draggable && this._draggable._moved;
    },

    _adjustPan: function (e) {
      let marker = this._marker;
      let map = marker._map;
      let speed = this._marker.options.autoPanSpeed;
      let padding = this._marker.options.autoPanPadding;
      let iconPos = L.DomUtil.getPosition(marker._icon);
      if (Ember.isArray(this._marker._icon)) {
        iconPos = L.DomUtil.getPosition(marker._icon[0]);
      }

      let bounds = map.getPixelBounds();
      let origin = map.getPixelOrigin();

      var panBounds = this.toBounds(
        bounds.min._subtract(origin).add(padding),
        bounds.max._subtract(origin).subtract(padding)
      );

      if (!panBounds.contains(iconPos)) {
        // Compute incremental movement
        var movement = this.toPoint(
          (Math.max(panBounds.max.x, iconPos.x) - panBounds.max.x) / (bounds.max.x - panBounds.max.x) -
          (Math.min(panBounds.min.x, iconPos.x) - panBounds.min.x) / (bounds.min.x - panBounds.min.x),

          (Math.max(panBounds.max.y, iconPos.y) - panBounds.max.y) / (bounds.max.y - panBounds.max.y) -
          (Math.min(panBounds.min.y, iconPos.y) - panBounds.min.y) / (bounds.min.y - panBounds.min.y)
        ).multiplyBy(speed);

        map.panBy(movement, { animate: false });

        this._draggable._newPos._add(movement);
        this._draggable._startPos._add(movement);

        if (Ember.isArray(marker._icon)) {
          marker._icon.forEach(icon => {
            L.DomUtil.setPosition(icon, this._draggable._newPos);
          });
        } else {
          L.DomUtil.setPosition(marker._icon, this._draggable._newPos);
        }

        this._onDrag(e);

        this._panRequest = L.Util.requestAnimFrame(this._adjustPan.bind(this, e));
      }
    },

    toBounds: function (a, b) {
      if (!a || a instanceof L.Bounds) {
        return a;
      }

      return new L.Bounds(a, b);
    },

    toPoint: function (x, y, round) {
      if (x instanceof L.Point) {
        return x;
      }

      if (Array.isArray(x)) {
        return new L.Point(x[0], x[1]);
      }

      if (x === undefined || x === null) {
        return x;
      }

      if (typeof x === 'object' && 'x' in x && 'y' in x) {
        return new L.Point(x.x, x.y);
      }

      return new L.Point(x, y, round);
    },

    _onDragStart: function () {
      // @section Dragging events
      // @event dragstart: Event
      // Fired when the user starts dragging the marker.

      // @event movestart: Event
      // Fired when the marker starts moving (because of dragging).

      this._oldLatLng = this._marker.getLatLng();

      // When using ES6 imports it could not be set when `Popup` was not imported as well
      if (this._marker.closePopup) {
        this._marker.closePopup();
      }

      this._marker
        .fire('movestart')
        .fire('dragstart');
    },

    _onPreDrag: function (e) {
      if (this._marker.options.autoPan) {
        L.Util.cancelAnimFrame(this._panRequest);
        this._panRequest = L.Util.requestAnimFrame(this._adjustPan.bind(this, e));
      }
    },

    _onDrag: function (e) {
      let marker = this._marker;
      let shadow = marker._shadow;
      let iconPos = L.DomUtil.getPosition(marker._icon);
      if (Ember.isArray(marker._icon)) {
        iconPos = L.DomUtil.getPosition(marker._icon[0]);
      }

      let latlng = marker._map.layerPointToLatLng(iconPos);

      // update shadow position
      if (shadow) {
        L.DomUtil.setPosition(shadow, iconPos);
      }

      marker._latlng = latlng;
      e.latlng = latlng;
      e.oldLatLng = this._oldLatLng;

      // @event drag: Event
      // Fired repeatedly while the user drags the marker.
      marker
          .fire('move', e)
          .fire('drag', e);
    },

    _onDragEnd: function (e) {
      // @event dragend: DragEndEvent
      // Fired when the user stops dragging the marker.

      L.Util.cancelAnimFrame(this._panRequest);

      // @event moveend: Event
      // Fired when the marker stops moving (because of dragging).
      delete this._oldLatLng;
      this._marker
          .fire('moveend')
          .fire('dragend', e);
    }
  });
}

export default {
  name: 'leaflet-marker',
  initialize
};
