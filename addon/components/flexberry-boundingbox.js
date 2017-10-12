import Ember from 'ember';
import layout from '../templates/components/flexberry-boundingbox';
import FlexberryMapActionsHandlerMixin from '../mixins/flexberry-map-actions-handler';

/**
  Flexberry bounding box component.

  @class FlexberryBoundingboxComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses FlexberryMapActionsHandlerMixin
*/
export default Ember.Component.extend(FlexberryMapActionsHandlerMixin, {
  /**
    Leaflet map.

    @property _leafletMap
    @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
    @default null
    @private
  */
  _leafletMap: null,

  /**
    Reference to areaselect object.

    @property _areaSelect
    @type Object
    @default null
    @private
  */
  _areaSelect: null,

  /**
    Minimal latitude value binded to textbox.

    @property _minLat
    @type number
    @default -90
    @private
  */
  _minLat: -90,

  /**
    Maximal latitude value binded to textbox.

    @property _maxLat
    @type number
    @default 90
    @private
  */
  _maxLat: 90,

  /**
    Minimal longitude value binded to textbox.

    @property _minLng
    @type number
    @default -180
    @private
  */
  _minLng: -180,

  /**
    Maximal longitude value binded to textbox.

    @property _maxLng
    @type number
    @default 180
    @private
  */
  _maxLng: 180,

  /**
    Flag: indicates whether min latitude in textbox is valid or not.

    @property _minLatIsValid
    @type Boolean
    @readOnly
    @private
  */
  _minLatIsValid: Ember.computed('_minLat', function() {
    let minLat = parseFloat(this.get('_minLat'));

    return minLat >= -90 && minLat <= 90;
  }),

  /**
    Flag: indicates whether min longitude in textbox is valid or not.

    @property _minLngIsValid
    @type Boolean
    @readOnly
    @private
  */
  _minLngIsValid: Ember.computed('_minLng', function() {
    let minLng = parseFloat(this.get('_minLng'));

    return minLng >= -180 && minLng <= 180;
  }),

  /**
    Flag: indicates whether max latitude in textbox is valid or not.

    @property _maxLatIsValid
    @type Boolean
    @readOnly
    @private
  */
  _maxLatIsValid: Ember.computed('_maxLat', function() {
    let maxLat = parseFloat(this.get('_maxLat'));

    return maxLat >= -90 && maxLat <= 90;
  }),

  /**
    Flag: indicates whether max longitude in textbox is valid or not.

    @property _maxLngIsValid
    @type Boolean
    @readOnly
    @private
  */
  _maxLngIsValid: Ember.computed('_maxLng', function() {
    let maxLng = parseFloat(this.get('_maxLng'));

    return maxLng >= -180 && maxLng <= 180;
  }),

  /**
    Flag: indicates whether coordinates in textboxes are valid or not.

    @property _coordinatesAreValid
    @type Boolean
    @readOnly
    @private
  */
  _coordinatesAreValid: Ember.computed('_minLatIsValid', '_minLngIsValid', '_maxLatIsValid', '_maxLngIsValid', function() {
    return this.get('_minLatIsValid') && this.get('_minLngIsValid') && this.get('_maxLatIsValid') && this.get('_maxLngIsValid');
  }),

  /**
    Flag: indicates whether coordinates in textboxes are changed or not.

    @property _coordinatesAreChanged
    @type Boolean
    @readOnly
    @private
  */
  _coordinatesAreChanged: Ember.computed('_minLat', '_minLng', '_maxLat', '_maxLng', 'minLat', 'minLng', 'maxLat', 'maxLng', function() {
    if (parseFloat(this.get('_minLat')) !== parseFloat(this.get('minLat'))) {
      return true;
    }

    if (parseFloat(this.get('_minLng')) !== parseFloat(this.get('minLng'))) {
      return true;
    }

    if (parseFloat(this.get('_maxLat')) !== parseFloat(this.get('maxLat'))) {
      return true;
    }

    if (parseFloat(this.get('_maxLng')) !== parseFloat(this.get('maxLng'))) {
      return true;
    }

    return false;
  }),

  /**
    Flag: indicates whether areaselect neeed to be updated (in case of manual changes in coordanates) or not (in case of changes throught GUI).

    @property _needToUpdateAreaSelect
    @type Boolean
    @default true
    @private
  */
  _needToUpdateAreaSelect: true,

  /**
    Reference to component's template.
  */
  layout,

  /**
    Minimal latitude value.

    @property minLat
    @type number
    @default -90
  */
  minLat: -90,

  /**
    Maximal latitude value.

    @property maxLat
    @type number
    @default 90
  */
  maxLat: 90,

  /**
    Minimal longitude value.

    @property minLng
    @type number
    @default -180
  */
  minLng: -180,

  /**
    Maximal longitude value.

    @property maxLng
    @type number
    @default 180
  */
  maxLng: 180,

  /**
    Map model to be displayed.

    @property maxLng
    @type NewPlatformFlexberryGISMap
    @default null
  */
  mapModel: null,

  /**
    Flag: indicates whether to show zoom-control or not.

    @property zoomControl
    @type Boolean
    @default true
  */
  zoomControl: true,

  /**
    Flag: indicates whether to show attribution-control or not.

    @property attributionControl
    @type Boolean
    @default false
  */
  attributionControl: false,

  /**
    Observes changes in reference to leaflet map.
    Initializes area select plugin.

    @method _leafletMapDidChange
    @private
  */
  _leafletMapDidChange: Ember.observer('_leafletMap', function() {
    let leafletMap = this.get('_leafletMap');
    if (Ember.isNone(leafletMap)) {
      return;
    }

    leafletMap.on('containerResizeStart', this._leafletMapOnContainerResizeStart, this);
    leafletMap.on('containerResizeEnd', this._leafletMapOnContainerResizeEnd, this);

    let areaSelect = L.areaSelect({ width: 100, height: 100 });
    this.set('_areaSelect', areaSelect);

    areaSelect.addTo(leafletMap);
    areaSelect.on('change', this._areaSelectOnChange, this);

    this._boundingBoxCoordinatesDidChange();
  }),

  /**
    Handles leaflet map's 'resizeStart' event.

    @method _leafletMapOnContainerResizeStart
    @private
  */
  _leafletMapOnContainerResizeStart() {
    let areaSelect = this.get('_areaSelect');
    if (!Ember.isNone(areaSelect)) {
      // Temporary unbind 'change' event handler to avoid changes in coordinates while resize is in process.
      areaSelect.off('change', this._areaSelectOnChange, this);
    }
  },

  /**
    Handles leaflet map's 'resizeEnd' event.

    @method _leafletMapOnContainerResizeEnd
    @private
  */
  _leafletMapOnContainerResizeEnd() {
    let areaSelect = this.get('_areaSelect');
    if (!Ember.isNone(areaSelect)) {
      // Bind 'change' event handler again.
      areaSelect.on('change', this._areaSelectOnChange, this);

      // Map size has been changed, so update areaSelect view without changes in coordinates.
      this._updateAreaSelect();
    }
  },

  /**
    Observes changes in bounding box coordiantes.

    @method _bboxCoordinatesDidChange
    @private
  */
  _boundingBoxCoordinatesDidChange: Ember.observer('minLat', 'minLng', 'maxLat', 'maxLng', function() {
    Ember.run.once(this, '_updateBoundingBoxCoordiantes');
  }),

  /**
    Updtaes bounding box coordunates accirding tocoordinates specified in public properties.

    @method _updateBoundingBoxCoordiantes
    @private
  */
  _updateBoundingBoxCoordiantes() {
    let minLat = this.get('minLat');
    let minLng = this.get('minLng');
    let maxLat = this.get('maxLat');
    let maxLng = this.get('maxLng');

    // Update coordiantes in textboxes.
    this.setProperties({
      _minLat: minLat,
      _minLng: minLng,
      _maxLat: maxLat,
      _maxLng: maxLng
    });

    let leafletMap = this.get('_leafletMap');
    let areaSelect = this.get('_areaSelect');
    let coordinatesAreValid = this.get('_coordinatesAreValid');
    if (Ember.isNone(leafletMap) || Ember.isNone(areaSelect) || !coordinatesAreValid) {
      return;
    }

    // Update areaSelect if needed.
    if (this.get('_needToUpdateAreaSelect')) {
      this._updateAreaSelect();
    } else {
      this.set('_needToUpdateAreaSelect', true);
    }

    // Send 'boundingBoxChange' action to report about changes in bounds.
    this.sendAction('boundingBoxChange', {
      minLat,
      minLng,
      maxLat,
      maxLng
    });
  },

  /**
    Updtaes areaSelect according to coordinates specified in public properties.

    @method _updateAreaSelect
    @private
  */
  _updateAreaSelect() {
    let minLat = this.get('minLat');
    let minLng = this.get('minLng');
    let maxLat = this.get('maxLat');
    let maxLng = this.get('maxLng');

    let leafletMap = this.get('_leafletMap');
    let areaSelect = this.get('_areaSelect');
    if (Ember.isNone(leafletMap) || Ember.isNone(areaSelect)) {
      return;
    }

    // Create new bounds.
    let bounds = L.latLngBounds(L.latLng(minLat, minLng), L.latLng(maxLat, maxLng));

    // Temporary unbind 'change' event handler to avoid cyclic changes.
    areaSelect.off('change', this._areaSelectOnChange, this);

    // Fit map to new bounds.
    this._fitBoundsOfLeafletMap(bounds).then(() => {
      // Fit areaSelect to new bounds.
      let newWidth = Math.abs(
        leafletMap.latLngToLayerPoint(L.latLng(minLat, maxLng)).x) - Math.abs(leafletMap.latLngToLayerPoint(L.latLng(minLat, minLng)).x
      );
      let newHeight = Math.abs(
        leafletMap.latLngToLayerPoint(L.latLng(maxLat, minLng)).y) - Math.abs(leafletMap.latLngToLayerPoint(L.latLng(minLat, minLng)).y
      );
      areaSelect.setDimensions({ width: Math.abs(newWidth), height: Math.abs(newHeight) });
    }).catch((error) => {
      Ember.Logger.error(error);
    }).finally(() => {
      // Bind 'change' event handler again.
      areaSelect.on('change', this._areaSelectOnChange, this);
    });
  },

  /**
    Actions made when areaSelect.on('change') fires.

    @method _areaSelectOnChange
    @private
  */
  _areaSelectOnChange() {
    let areaSelect = this.get('_areaSelect');
    let bounds = areaSelect.getBounds();

    // Update component's public properties related to bounding box coordinates,
    // it will force '_bboxCoordinatesDidChange' observer to be called.
    this.set('_needToUpdateAreaSelect', false);
    this.setProperties({
      minLat: bounds.getSouth(),
      minLng: bounds.getWest(),
      maxLat: bounds.getNorth(),
      maxLng: bounds.getEast()
    });
  },

  /**
    Fits specified leaflet map's bounds.

    @method _fitBoundsOfLeafletMap
    @param {<a href="http://leafletjs.com/reference-1.0.1.html#latlngbounds">L.LatLngBounds</a>} bounds Bounds to be fitted.
    @returns <a htef="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Promise which will be resolved when fitting will be finished.
  */
  _fitBoundsOfLeafletMap(bounds) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let leafletMap = this.get('_leafletMap');
      if (Ember.isNone(leafletMap)) {
        reject('Leaflet map is not defined');
      }

      leafletMap.once('moveend', () => {
        resolve();
      });

      leafletMap.fitBounds(bounds, {
        animate: false
      });
    });
  },

  /**
    Destroys DOM-related component's properties.
  */
  willDestroyElement() {
    let areaSelect = this.get('_areaSelect');
    if (!Ember.isNone(areaSelect)) {
      // Unbind 'change' event handler to avoid memory leaks.
      areaSelect.off('change', this._areaSelectOnChange, this);
      areaSelect.remove();
      this.set('_areaSelect', null);
    }

    let leafletMap = this.get('_leafletMap');
    if (!Ember.isNone(leafletMap)) {
      // Unbind 'containerResizeStart', 'containerResizeEnd' events handlers to avoid memory leaks.
      leafletMap.off('containerResizeStart', this._leafletMapOnContainerResizeStart, this);
      leafletMap.off('containerResizeEnd', this._leafletMapOnContainerResizeEnd, this);
    }

    this._super(...arguments);
  },

  actions: {
    /**
      This action is called when change borders button is pressed.

      @method actions.onButtonClick
    */
    onButtonClick() {
      if (!(this.get('_coordinatesAreValid') || this.get('_coordinatesAreChanged'))) {
        return;
      }

      // Update related public properties with coordiantes to force '_updateBoundingBoxCoordiantes' to be triggered.
      this.set('_needToUpdateAreaSelect', true);
      this.setProperties({
        minLat: parseFloat(this.get('_minLat')),
        minLng: parseFloat(this.get('_minLng')),
        maxLat: parseFloat(this.get('_maxLat')),
        maxLng: parseFloat(this.get('_maxLng'))
      });
    }
  }

  /**
    Component's action invoking when bounding box coordiantes did change.

    @method sendingActions.boundingBoxChange
    @param {Object} e Action's parameters.
    @param {Number} e.minLat Bounding box min latitude.
    @param {Number} e.minLng Bounding box min longitude.
    @param {Number} e.maxLat Bounding box max latitude.
    @param {Number} e.maxLng Bounding box max longitude.
    @param {<a href="http://leafletjs.com/reference-1.2.0.html#latlngbounds">L.LatLngBounds</a>} e.bounds Bounds related to changed coordinates.
  */
});
