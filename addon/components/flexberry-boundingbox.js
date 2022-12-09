import Ember from 'ember';
import layout from '../templates/components/flexberry-boundingbox';
import FlexberryMapActionsHandlerMixin from '../mixins/flexberry-map-actions-handler';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-boundingbox').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-boundingbox').
  @readonly
  @static

  @for FlexberryBoundingboxComponent
*/
const flexberryClassNamesPrefix = 'flexberry-boundingbox';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix
};

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
    Max length textboxes of boundaries values

    @property boundaryMaxlength
    @type number
    @default 5
    @private
  */
  boundaryMaxlength: 5,

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

  boundariesChangedObs: Ember.observer('_coordinatesAreValid', function() {
    if (!this.get('_coordinatesAreValid')) {
      return;
    }

    Ember.run.once(this, 'setBoundaries');
  }),

  setBoundaries() {
    this.setProperties({
      minLat: parseFloat(this.get('_minLat')),
      minLng: parseFloat(this.get('_minLng')),
      maxLat: parseFloat(this.get('_maxLat')),
      maxLng: parseFloat(this.get('_maxLng'))
    });
  },
  /**
    Flag: indicates whether coordinates in textboxes are changed or not.

    @property _coordinatesAreChanged
    @type Boolean
    @readOnly
    @private
  */
  _coordinatesAreChanged: Ember.computed('minLat', 'minLng', 'maxLat', 'maxLng', {
    get: () => true,
    set() {
      return arguments[1];
    }
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
    Reference to component's CSS-classes names.
    Must be also a component's instance property to be available from component's .hbs template.
  */
  flexberryClassNames,

  /**
    Component's wrapping <div> CSS-classes names.

    Any other CSS-class names can be added through component's 'class' property.
    ```handlebars
    {{flexberry-boundingbox class="my-class"}}
    ```

    @property classNames
    @type String[]
    @default ['flexberry-boundingbox']
  */
  classNames: [flexberryClassNames.wrapper],

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
    Default width for area select.

    @property areaSelectDefaultWidth
    @type Number
    @default 100
  */
  areaSelectDefaultWidth: 100,

  /**
    Default height for area select.

    @property areaSelectDefaultHeight
    @type Number
    @default 100
  */
  areaSelectDefaultHeight: 100,

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

    this._initizlizeAreaSelect();
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
    if (Ember.isNone(areaSelect)) {
      this._initizlizeAreaSelect();
    } else {
      let leafletMap = this.get('_leafletMap');
      let leafletMapSize = leafletMap.getSize();
      this._updateAreaSelect({ fitBounds: areaSelect._width > leafletMapSize.x || areaSelect._height > leafletMapSize.y });
    }
  },

  /**
    Initializes area select.

    @method _initizlizeAreaSelect
    @private
  */
  _initizlizeAreaSelect() {
    let areaSelect = this.get('_areaSelect');
    if (!Ember.isNone(areaSelect)) {
      // Area select is already initialized.
      return;
    }

    let leafletMap = this.get('_leafletMap');
    if (Ember.isNone(leafletMap)) {
      return;
    }

    let leafletMapSize = leafletMap.getSize();
    if (leafletMapSize.x <= 0 || leafletMapSize.y <= 0) {
      // Map is invisible, so area select can't be initialized properly.
      return;
    }

    areaSelect = L.areaSelect({ width: this.get('areaSelectDefaultWidth'), height: this.get('areaSelectDefaultHeight') });
    this.set('_areaSelect', areaSelect);

    areaSelect.addTo(leafletMap);
    areaSelect.on('change', this._areaSelectOnChange, this);

    this._boundingBoxCoordinatesDidChange();
    this.send('acceptBoundaryChanges');
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
      this._updateAreaSelect({ fitBounds: true });
    } else {
      this.set('_needToUpdateAreaSelect', true);
    }
  },

  /**
    Updtaes areaSelect according to coordinates specified in public properties.

    @method _updateAreaSelect
    @private
  */
  _updateAreaSelect(options) {
    options = options || {};
    let leafletMap = this.get('_leafletMap');
    let areaSelect = this.get('_areaSelect');
    if (Ember.isNone(leafletMap) || Ember.isNone(areaSelect)) {
      return;
    }

    let minLat = this.get('minLat');
    let minLng = this.get('minLng');
    let maxLat = this.get('maxLat');
    let maxLng = this.get('maxLng');

    let updateAreaSelect = () => {
      // Fit areaSelect to new bounds.
      let newWidth = Math.abs(
        leafletMap.latLngToLayerPoint(L.latLng(minLat, maxLng)).x) - Math.abs(leafletMap.latLngToLayerPoint(L.latLng(minLat, minLng)).x
      );
      let newHeight = Math.abs(
        leafletMap.latLngToLayerPoint(L.latLng(maxLat, minLng)).y) - Math.abs(leafletMap.latLngToLayerPoint(L.latLng(minLat, minLng)).y
      );
      areaSelect.setDimensions({ width: Math.abs(newWidth), height: Math.abs(newHeight) });
    };

    if (options.fitBounds) {
      // Temporary unbind 'change' event handler to avoid cyclic changes.
      areaSelect.off('change', this._areaSelectOnChange, this);

      // Fit map to new bounds.
      this._fitBoundsOfLeafletMap(L.latLngBounds(L.latLng(minLat, minLng), L.latLng(maxLat, maxLng))).then(() => {
        updateAreaSelect();
      }).catch((error) => {
        Ember.Logger.error(error);
      }).finally(() => {
        // Bind 'change' event handler again.
        areaSelect.on('change', this._areaSelectOnChange, this);
      });
    } else {
      // Temporary unbind 'change' event handler to avoid cyclic changes.
      areaSelect.off('change', this._areaSelectOnChange, this);

      updateAreaSelect();

      // Bind 'change' event handler again.
      areaSelect.on('change', this._areaSelectOnChange, this);
    }
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
    acceptBoundaryChanges() {
      if (!this.get('_coordinatesAreValid') || !this.get('_coordinatesAreChanged')) {
        return;
      }

      let minLng = this.get('minLng');
      let maxLng = this.get('maxLng');
      let minLat = this.get('minLat');
      let maxLat = this.get('maxLat');

      let coordinatesBounds = [
        [minLng, minLat],
        [maxLng, minLat],
        [maxLng, maxLat],
        [minLng, maxLat],
        [minLng, minLat]
      ];

      if (minLat === -90 && maxLat === 90) {
        coordinatesBounds.splice(2, 0, [maxLng, 0]);
        coordinatesBounds.splice(5, 0, [minLng, 0]);
      }

      // If some of polygon's edges have length of 180 (for example from latitude -90 till latitude 90)
      // then PostGIS will throw an exception "Antipodal (180 degrees long) edge detected".
      // Workaround is to make each edge shorter (add additional points into polygon's edges).
      let bboxEWKT = `SRID=4326;POLYGON((` +
        `${minLng} ${minLat},` +
        `${minLng + (maxLng - minLng) * 0.5} ${minLat},` +
        `${maxLng} ${minLat},` +
        `${maxLng} ${minLat + (maxLat - minLat) * 0.5},` +
        `${maxLng} ${maxLat},` +
        `${minLng + (maxLng - minLng) * 0.5} ${maxLat},` +
        `${minLng} ${maxLat},` +
        `${minLng} ${minLat + (maxLat - minLat) * 0.5},` +
        `${minLng} ${minLat}))`;

      // Send 'boundingBoxChange' action to report about changes in bounds.
      this.sendAction('boundingBoxChange', {
        minLat: minLat,
        minLng: minLng,
        maxLat: maxLat,
        maxLng: maxLng,
        bounds: L.latLngBounds(L.latLng(minLat, minLng), L.latLng(maxLat, maxLng)),
        bboxEWKT: bboxEWKT,
        bboxGeoJSON: {
          type: 'Polygon',
          coordinates: [
            coordinatesBounds
          ],
          crs: {
            type: 'name',
            properties: {
              name: 'EPSG:4326'
            }
          }
        }
      });
      this.set('_coordinatesAreChanged', false);
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
