import { Promise } from 'rsvp';
import { once } from '@ember/runloop';
import { isNone } from '@ember/utils';
import { computed, observer } from '@ember/object';
import Component from '@ember/component';
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
  wrapper: flexberryClassNamesPrefix,
};

/**
  Flexberry bounding box component.

  @class FlexberryBoundingboxComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses FlexberryMapActionsHandlerMixin
*/
export default Component.extend(FlexberryMapActionsHandlerMixin, {
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
  _minLatIsValid: computed('_minLat', function () {
    const minLat = parseFloat(this.get('_minLat'));

    return minLat >= -90 && minLat <= 90;
  }),

  /**
    Flag: indicates whether min longitude in textbox is valid or not.

    @property _minLngIsValid
    @type Boolean
    @readOnly
    @private
  */
  _minLngIsValid: computed('_minLng', function () {
    const minLng = parseFloat(this.get('_minLng'));

    return minLng >= -180 && minLng <= 180;
  }),

  /**
    Flag: indicates whether max latitude in textbox is valid or not.

    @property _maxLatIsValid
    @type Boolean
    @readOnly
    @private
  */
  _maxLatIsValid: computed('_maxLat', function () {
    const maxLat = parseFloat(this.get('_maxLat'));

    return maxLat >= -90 && maxLat <= 90;
  }),

  /**
    Flag: indicates whether max longitude in textbox is valid or not.

    @property _maxLngIsValid
    @type Boolean
    @readOnly
    @private
  */
  _maxLngIsValid: computed('_maxLng', function () {
    const maxLng = parseFloat(this.get('_maxLng'));

    return maxLng >= -180 && maxLng <= 180;
  }),

  /**
    Flag: indicates whether coordinates in textboxes are valid or not.

    @property _coordinatesAreValid
    @type Boolean
    @readOnly
    @private
  */
  _coordinatesAreValid: computed('_minLatIsValid', '_minLngIsValid', '_maxLatIsValid', '_maxLngIsValid', function () {
    return this.get('_minLatIsValid') && this.get('_minLngIsValid') && this.get('_maxLatIsValid') && this.get('_maxLngIsValid');
  }),

  /**
    Flag: indicates whether coordinates in textboxes are changed or not.

    @property _coordinatesAreChanged
    @type Boolean
    @readOnly
    @private
  */
  _coordinatesAreChanged: computed('_minLat', '_minLng', '_maxLat', '_maxLng', 'minLat', 'minLng', 'maxLat', 'maxLng', function () {
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
  _leafletMapDidChange: observer('_leafletMap', function () {
    const leafletMap = this.get('_leafletMap');
    if (isNone(leafletMap)) {
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
    const areaSelect = this.get('_areaSelect');
    if (!isNone(areaSelect)) {
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
    const areaSelect = this.get('_areaSelect');
    if (isNone(areaSelect)) {
      this._initizlizeAreaSelect();
    } else {
      const leafletMap = this.get('_leafletMap');
      const leafletMapSize = leafletMap.getSize();
      this._updateAreaSelect({ fitBounds: areaSelect._width > leafletMapSize.x || areaSelect._height > leafletMapSize.y, });
    }
  },

  /**
    Initializes area select.

    @method _initizlizeAreaSelect
    @private
  */
  _initizlizeAreaSelect() {
    let areaSelect = this.get('_areaSelect');
    if (!isNone(areaSelect)) {
      // Area select is already initialized.
      return;
    }

    const leafletMap = this.get('_leafletMap');
    if (isNone(leafletMap)) {
      return;
    }

    const leafletMapSize = leafletMap.getSize();
    if (leafletMapSize.x <= 0 || leafletMapSize.y <= 0) {
      // Map is invisible, so area select can't be initialized properly.
      return;
    }

    areaSelect = L.areaSelect({ width: this.get('areaSelectDefaultWidth'), height: this.get('areaSelectDefaultHeight'), });
    this.set('_areaSelect', areaSelect);

    areaSelect.addTo(leafletMap);
    areaSelect.on('change', this._areaSelectOnChange, this);

    this._boundingBoxCoordinatesDidChange();
  },

  /**
    Observes changes in bounding box coordiantes.

    @method _bboxCoordinatesDidChange
    @private
  */
  _boundingBoxCoordinatesDidChange: observer('minLat', 'minLng', 'maxLat', 'maxLng', function () {
    once(this, '_updateBoundingBoxCoordiantes');
  }),

  /**
    Updtaes bounding box coordunates accirding tocoordinates specified in public properties.

    @method _updateBoundingBoxCoordiantes
    @private
  */
  _updateBoundingBoxCoordiantes() {
    const minLat = this.get('minLat');
    const minLng = this.get('minLng');
    const maxLat = this.get('maxLat');
    const maxLng = this.get('maxLng');

    // Update coordiantes in textboxes.
    this.setProperties({
      _minLat: minLat,
      _minLng: minLng,
      _maxLat: maxLat,
      _maxLng: maxLng,
    });

    const leafletMap = this.get('_leafletMap');
    const areaSelect = this.get('_areaSelect');
    const coordinatesAreValid = this.get('_coordinatesAreValid');
    if (isNone(leafletMap) || isNone(areaSelect) || !coordinatesAreValid) {
      return;
    }

    // Update areaSelect if needed.
    if (this.get('_needToUpdateAreaSelect')) {
      this._updateAreaSelect({ fitBounds: true, });
    } else {
      this.set('_needToUpdateAreaSelect', true);
    }

    const coordinatesBounds = [
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
    const bboxEWKT = 'SRID=4326;POLYGON(('
      + `${minLng} ${minLat},`
      + `${minLng + (maxLng - minLng) * 0.5} ${minLat},`
      + `${maxLng} ${minLat},`
      + `${maxLng} ${minLat + (maxLat - minLat) * 0.5},`
      + `${maxLng} ${maxLat},`
      + `${minLng + (maxLng - minLng) * 0.5} ${maxLat},`
      + `${minLng} ${maxLat},`
      + `${minLng} ${minLat + (maxLat - minLat) * 0.5},`
      + `${minLng} ${minLat}))`;

    // Send 'boundingBoxChange' action to report about changes in bounds.
    this.sendAction('boundingBoxChange', {
      minLat,
      minLng,
      maxLat,
      maxLng,
      bounds: L.latLngBounds(L.latLng(minLat, minLng), L.latLng(maxLat, maxLng)),
      bboxEWKT,
      bboxGeoJSON: {
        type: 'Polygon',
        coordinates: [
          coordinatesBounds
        ],
        crs: {
          type: 'name',
          properties: {
            name: 'EPSG:4326',
          },
        },
      },
    });
  },

  /**
    Updtaes areaSelect according to coordinates specified in public properties.

    @method _updateAreaSelect
    @private
  */
  _updateAreaSelect(options) {
    options = options || {};
    const leafletMap = this.get('_leafletMap');
    const areaSelect = this.get('_areaSelect');
    if (isNone(leafletMap) || isNone(areaSelect)) {
      return;
    }

    const minLat = this.get('minLat');
    const minLng = this.get('minLng');
    const maxLat = this.get('maxLat');
    const maxLng = this.get('maxLng');

    const updateAreaSelect = () => {
      // Fit areaSelect to new bounds.
      const newWidth = Math.abs(
        leafletMap.latLngToLayerPoint(L.latLng(minLat, maxLng)).x
      ) - Math.abs(leafletMap.latLngToLayerPoint(L.latLng(minLat, minLng)).x);
      const newHeight = Math.abs(
        leafletMap.latLngToLayerPoint(L.latLng(maxLat, minLng)).y
      ) - Math.abs(leafletMap.latLngToLayerPoint(L.latLng(minLat, minLng)).y);
      areaSelect.setDimensions({ width: Math.abs(newWidth), height: Math.abs(newHeight), });
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
    return new Promise((resolve, reject) => {
      const leafletMap = this.get('_leafletMap');
      if (isNone(leafletMap)) {
        reject('Leaflet map is not defined');
      }

      leafletMap.once('moveend', () => {
        resolve();
      });

      leafletMap.fitBounds(bounds, {
        animate: false,
      });
    });
  },

  /**
    Actions made when areaSelect.on('change') fires.

    @method _areaSelectOnChange
    @private
  */
  _areaSelectOnChange() {
    const areaSelect = this.get('_areaSelect');
    const bounds = areaSelect.getBounds();

    // Update component's public properties related to bounding box coordinates,
    // it will force '_bboxCoordinatesDidChange' observer to be called.
    this.set('_needToUpdateAreaSelect', false);
    this.setProperties({
      minLat: bounds.getSouth(),
      minLng: bounds.getWest(),
      maxLat: bounds.getNorth(),
      maxLng: bounds.getEast(),
    });
  },

  /**
    Destroys DOM-related component's properties.
  */
  willDestroyElement() {
    const areaSelect = this.get('_areaSelect');
    if (!isNone(areaSelect)) {
      // Unbind 'change' event handler to avoid memory leaks.
      areaSelect.off('change', this._areaSelectOnChange, this);
      areaSelect.remove();
      this.set('_areaSelect', null);
    }

    const leafletMap = this.get('_leafletMap');
    if (!isNone(leafletMap)) {
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
        maxLng: parseFloat(this.get('_maxLng')),
      });
    },
  },

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
