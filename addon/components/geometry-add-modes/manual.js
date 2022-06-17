/**
  @module ember-flexberry-gis
*/

import { A } from '@ember/array';

import { getOwner } from '@ember/application';
import { isNone, isEmpty } from '@ember/utils';
import { observer, get } from '@ember/object';
import Component from '@ember/component';
import { translationMacro as t } from 'ember-i18n';
import layout from '../../templates/components/geometry-add-modes/manual';
import LeafletZoomToFeatureMixin from '../../mixins/leaflet-zoom-to-feature';
import { coordinatesToString } from '../../utils/coordinates-to';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-geometry-add-mode-manual').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-geometry-add-mode-manual').
  @property {String} flexberryClassNames.dialog Component's inner dialog CSS-class name ('flexberry-geometry-add-mode-manual').
  @property {String} flexberryClassNames.form Component's inner <form> CSS-class name ('flexberry-geometry-add-mode-manual').
  @readonly
  @static

  @for FlexberryGeometryAddModeManualComponent
*/
const flexberryClassNamesPrefix = 'flexberry-geometry-add-mode-manual';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null,
  dialog: `${flexberryClassNamesPrefix}-dialog`,
  form: `${flexberryClassNamesPrefix}-form`,
};

const FlexberryGeometryAddModeManualComponent = Component.extend(LeafletZoomToFeatureMixin, {

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
    Overridden ['tagName'](http://emberjs.com/api/classes/Ember.Component.html#property_tagName)
    is empty to disable component's wrapping <div>.

    @property tagName
    @type String
    @default ''
  */
  tagName: '',

  /**
    @property layer
    @type Leaflet layer
    @default null
    @private
  */
  layer: null,

  active: false,

  /**
    @property CRS
    @default null
    @private
  */
  _crs: null,

  /**
    Added coordinates.

    @property _coordinates
    @type String
    @default null
    @private
  */
  _coordinates: null,

  /**
    Flag indicates that entered coordinates has invalid format or is emty.

    @property _coordinatesWithError
    @type Boolean
    @default false
    @private
  */
  _coordinatesWithError: false,

  /**
    Flag to dispaly parse error.

    @property coordinatesParseError
    @type Boolean
    @default false
  */
  coordinatesParseError: false,

  /**
    Flag to dispaly parse error.

    @property coordinatesTypeGeometryError
    @type Boolean
    @default false
  */
  coordinatesTypeGeometryError: false,

  /**
    Flag to display line error.

    @property coordinatesInLineError
    @type Boolean
    @default false
  */
  coordinatesInLineError: false,

  crsFieldLabel: t('components.geometry-add-modes.manual.crs-field-label'),

  coordinatesFieldLabel: t('components.geometry-add-modes.manual.coordinates-field-label'),

  coordinatesFieldPlaceholder: t('components.geometry-add-modes.manual.coordinates-field-placeholder'),

  coordinatesParseErrorLabel: t('components.geometry-add-modes.manual.coordinates-parse-error-label'),

  coordinatesInLineErrorLabel: t('components.geometry-add-modes.manual.coordinates-line-error-label'),

  coordinatesTypeGeometryErrorLabel: t('components.geometry-add-modes.manual.coordinates-type-geometry-error-label'),

  willDestroyElement() {
    this._super(...arguments);

    this.clear();
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    this.initialSettings();
  },

  initialSettings: observer('settings', 'layer', function () {
    this.clear();

    const settings = this.get('settings');

    if (isNone(settings)) {
      return;
    }

    this.set('_crs', settings.layerCRS);

    const layer = this.get('layer');
    const edit = !isNone(layer);

    if (edit) {
      this._updateCoordinates();

      layer.off('editable:vertex:dragend', this._updateCoordinates, this);
      layer.off('editable:vertex:deleted', this._updateCoordinates, this);
      layer.off('editable:drawing:end', this._updateCoordinates, this);
      layer.off('create-layer:change', this._updateCoordinates, this);

      layer.on('editable:vertex:dragend', this._updateCoordinates, this);
      layer.on('editable:vertex:deleted', this._updateCoordinates, this);
      layer.on('editable:drawing:end', this._updateCoordinates, this);
      layer.on('create-layer:change', this._updateCoordinates, this);
    } else {
      this.set('_coordinates', '');
    }
  }),

  _updateCoordinates() {
    const layer = this.get('layer');

    if (isNone(layer)) {
      return;
    }

    const baseCrs = this.get('settings.layerCRS');
    const { coordinates, } = layer.toProjectedGeoJSON(baseCrs).geometry;

    const str = coordinatesToString(coordinates);
    this.set('_coordinates', str);
  },

  getLayer() {
    let error = false;

    const coordinates = this.get('_coordinates');
    if (isEmpty(coordinates)) {
      error = true;
      this.set('_coordinatesWithError', true);
    } else {
      this.set('_coordinatesWithError', false);
    }

    if (this._isSinglePairInLine(coordinates)) {
      this.set('coordinatesInLineError', false);
    } else {
      this.set('coordinatesInLineError', true);
      this.set('_coordinatesWithError', true);
      error = true;
    }

    if (error) {
      return [true, null];
    }

    const parsedCoordinates = this._parseStringToCoordinates(coordinates);

    this.set('coordinatesParseError', false);

    const coordinatesWithError = () => {
      this.set('_coordinatesWithError', true);
      this.set('coordinatesParseError', true);
      return [true, null];
    };

    if (isNone(parsedCoordinates) || parsedCoordinates.length === 0) {
      return coordinatesWithError();
    }

    this.set('coordinatesTypeGeometryError', false);
    const typeGeometryError = (n) => {
      this.set('_coordinatesWithError', true);
      const coordinatesTypeGeometryErrorLabel = this.get('coordinatesTypeGeometryErrorLabel').string.replace('%count%', n);
      this.set('coordinatesTypeGeometryErrorLabel', coordinatesTypeGeometryErrorLabel);
      this.set('coordinatesTypeGeometryError', true);

      return [true, null];
    };

    // Checks the minimum number of points.
    const hasMinCountPoint = (items, n) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].length < n) {
          return false;
        }
      }

      return true;
    };

    const type = this.get('settings.typeGeometry'); // marker polyline polygon

    let addedLayer;
    switch (type) {
      case 'marker':
        if (parsedCoordinates.length > 1 || (parsedCoordinates.length === 1 && parsedCoordinates[0].length > 1)) {
          return coordinatesWithError();
        }

        /* eslint-disable-next-line new-cap */
        addedLayer = new L.marker(parsedCoordinates[0][0]);
        break;

      case 'polyline':
        if (!hasMinCountPoint(parsedCoordinates, 2)) {
          return typeGeometryError(2);
        }

        addedLayer = L.polyline(parsedCoordinates);
        break;

      case 'polygon':
        if (!hasMinCountPoint(parsedCoordinates, 3)) {
          return typeGeometryError(3);
        }

        addedLayer = L.polygon(parsedCoordinates);
        break;

      default:
    }

    this.set('_coordinatesWithError', null);

    return [false, addedLayer];
  },

  actions: {
    apply() {
      const [error] = this.getLayer();
      let addedLayer = this.getLayer()[1];

      if (error) {
        return;
      }

      const layer = this.get('layer');
      if (!isNone(layer)) {
        const type = this.get('settings.typeGeometry');
        if (type === 'marker') {
          layer.setLatLng(addedLayer.getLatLng());
        } else {
          layer.setLatLngs(addedLayer.getLatLngs());
        }

        layer.disableEdit();
        layer.enableEdit();

        addedLayer.remove();

        addedLayer = layer;
      }

      this.sendAction('updateLayer', addedLayer, true);
    },
  },

  /**
    Cleaning panel.

    @method clear
  */
  clear() {
    this.set('_coordinates', null);
    this.set('_coordinatesWithError', false);
    this.set('coordinatesParseError', false);
    this.set('coordinatesInLineError', false);
    this.set('coordinatesTypeGeometryError', false);
  },

  /**
    Get an array of coordinates from a coordinate line.

    @method _parseCoordinates
    @param {string} coordinates A string with the coordinates. (geojson)
    @returns {string[]} Array of coordinates of type [[["55.472379","58.733686"]],[["55.472336","58.733789"]]]. (latlng)
  */
  _parseStringToCoordinates(coordinates) {
    if (isNone(coordinates)) {
      return null;
    }

    if (coordinates.includes(',')) {
      return null;
    }

    const regex = /^([-]*[0-9]+[.][0-9]+) ([-]*[0-9]+[.][0-9]+)/gm;
    const lines = coordinates.split('\n');
    const result = [];

    const crs = this.get('_crs.code');
    let k = 0;
    for (let i = 0; i < lines.length; i++) {
      lines[i] = lines[i].trim();
      if (lines[i] === '' || i === lines.length - 1) {
        let items;

        if (k === 0) {
          items = lines.slice(k, i + 1);
        } else if (i === lines.length - 1) {
          items = lines.slice(k + 1, i + 1);
        } else {
          items = lines.slice(k + 1, i);
        }

        const mas = [];

        for (let j = 0; j < items.length; j++) {
          const str = items[j];

          let m;
          while (m !== null) {
            if (m.index === regex.lastIndex) {
              regex.lastIndex += 1;
            }

            let x = parseFloat(m[1]);
            let y = parseFloat(m[2]);

            if (crs !== 'EPSG:4326') {
              const projected = this._projectCoordinates(crs, 'EPSG:4326', [x, y]);
              [x, y] = projected;
            }

            mas.push([y, x]);
            m = regex.exec(str);
          }
        }

        if (mas.length > 0) {
          result.push(mas);
        }

        k = i;
      }
    }

    return result.length > 0 ? result : null;
  },

  /**
    Projects coordinate pair from one crs to another.

    @method _projectCoordinates
    @param {string} from crs name from project.
    @param {string} to crs name to project.
    @param {string} coordinates A string with the coordinates.
    @returns {string[]} Pair of coordinates of type [55.472379, 58.733686].
  */
  _projectCoordinates(from, to, coordinates) {
    const knownCrs = getOwner(this).knownForType('coordinate-reference-system');
    const knownCrsArray = A(Object.values(knownCrs));
    const fromCrs = knownCrsArray.findBy('code', from);
    const fromCrsDefinition = get(fromCrs, 'definition');
    const toCrs = knownCrsArray.findBy('code', to);
    const toCrsDefinition = get(toCrs, 'definition');
    const cords = proj4(fromCrsDefinition, toCrsDefinition, coordinates);
    return cords;
  },

  /**
    Define if line contains more than one coordinate pair.

    @method _isSinglePairInLine
    @param {Object[]} coordinates Coordinates.
    @returns {Boolean} true if contains, otherwise false.
  */
  _isSinglePairInLine(coordinates) {
    const lines = coordinates.split('\n');
    let badLines = false;
    lines.forEach((line) => {
      line = line.trim();
      if (line !== '') {
        if (line.split(' ').length !== 2) {
          badLines = true;
        }
      }
    });
    if (badLines) {
      return false;
    }

    return true;
  },
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryGeometryAddModeManualComponent.reopenClass({
  flexberryClassNames,
});

export default FlexberryGeometryAddModeManualComponent;
