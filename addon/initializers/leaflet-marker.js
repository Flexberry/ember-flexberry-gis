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
      Original code
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
      Add marker in map. Override https://github.com/Leaflet/Leaflet/blob/main/src/layer/marker/Marker.js#L115
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
	    Changes the marker icon. Override https://github.com/Leaflet/Leaflet/blob/main/src/layer/marker/Marker.js#L181
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
      Add marker on DOM. Override https://github.com/Leaflet/Leaflet/blob/main/src/layer/marker/Marker.js#L211
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
      Makes the marker interactive. Override https://github.com/Leaflet/Leaflet/blob/main/src/layer/marker/Marker.js#L335
    */
    _initInteraction(icon) {

      if (!this.options.interactive) { return; }

      icon.classList.add('leaflet-interactive');

      L.Marker.prototype.addInteractiveTarget.call(this, icon);

      if (L.Marker.prototype.MarkerDrag) {
        let draggable = this.options.draggable;
        if (this.dragging) {
          draggable = this.dragging.enabled();
          this.dragging.disable();
        }

        this.dragging = new L.Marker.prototype.MarkerDrag.call(this);

        if (draggable) {
          this.dragging.enable();
        }
      }
    },

    /**
      @method _setPos(pos)
      Set position. Override https://github.com/Leaflet/Leaflet/blob/main/src/layer/marker/Marker.js#L308
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
      Update z-index. Override https://github.com/Leaflet/Leaflet/blob/main/src/layer/marker/Marker.js#L323
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
      Update opacity. Override https://github.com/Leaflet/Leaflet/blob/main/src/layer/marker/Marker.js#L369
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
      Remove icon from DOM. Override https://github.com/Leaflet/Leaflet/blob/main/src/layer/marker/Marker.js#L283
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
};

export default {
  name: 'leaflet-marker',
  initialize
};
