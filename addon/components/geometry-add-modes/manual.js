/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/geometry-add-modes/manual';
import LeafletZoomToFeatureMixin from '../../mixins/leaflet-zoom-to-feature';
import { translationMacro as t } from 'ember-i18n';
import { coordinatesToString } from '../../utils/coordinates-to';
import { getCrsCode } from '../../utils/get-crs-by-name';

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
  dialog: flexberryClassNamesPrefix + '-dialog',
  form: flexberryClassNamesPrefix + '-form'
};

let FlexberryGeometryAddModeManualComponent = Ember.Component.extend(LeafletZoomToFeatureMixin, {

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

  initialSettings: Ember.on('init', Ember.observer('settings', 'layer', function () {
    this.clear();

    let settings = this.get('settings');

    if (Ember.isNone(settings)) {
      return;
    }

    this.set('_crs', settings.layerCRS);

    let layer = this.get('layer');
    const edit = !Ember.isNone(layer);

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
  })),

  _updateCoordinates() {
    let layer = this.get('layer');

    if (Ember.isNone(layer)) {
      return;
    }

    let baseCrs = this.get('settings.layerCRS');
    let coordinates = layer.toProjectedGeoJSON(baseCrs).geometry.coordinates;

    const str = coordinatesToString(coordinates);
    this.set('_coordinates', str);

    // почему-то обсервер в flexberry-edit-crs срабатывает, но _crs не обновляется
    this.set('_crs', baseCrs);
    this.set('_crsCode', getCrsCode(baseCrs, this));
  },

  getLayer() {
    let error = false;

    const coordinates = this.get('_coordinates');
    if (Ember.isEmpty(coordinates)) {
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

    if (Ember.isNone(parsedCoordinates) || parsedCoordinates.length === 0) {
      return coordinatesWithError();
    }

    this.set('coordinatesTypeGeometryError', false);
    const typeGeometryError = (n) => {
      this.set('_coordinatesWithError', true);
      let coordinatesTypeGeometryErrorLabel = this.get('coordinatesTypeGeometryErrorLabel').string.replace('%count%', n);
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
    }

    this.set('_coordinatesWithError', null);

    return [false, addedLayer];
  },

  actions: {
    apply() {
      let [error, addedLayer] = this.getLayer();

      if (error) {
        return;
      }

      let layer = this.get('layer');
      if (!Ember.isNone(layer)) {
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

      // не будем вызывать обновление координат с карты если нет необходимости, ибо это снижает точность
      let baseCrs = this.get('settings.layerCRS');
      let crs = this.get('_crs');
      let skip = getCrsCode(baseCrs, this) === getCrsCode(crs, this);

      this.sendAction('updateLayer', addedLayer, true, skip);
    }
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
    if (Ember.isNone(coordinates)) {
      return null;
    }

    if (coordinates.includes(',')) {
      return null;
    }

    const regex = /^([-]*[0-9]+[.][0-9]+) ([-]*[0-9]+[.][0-9]+)/gm;
    let lines = coordinates.split('\n');
    let result = [];

    let crs = this.get('_crs.code');
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

        let mas = [];

        for (let j = 0; j < items.length; j++) {
          let str = items[j];

          let m;
          while ((m = regex.exec(str)) !== null) {
            if (m.index === regex.lastIndex) {
              regex.lastIndex++;
            }

            let x = parseFloat(m[1]);
            let y = parseFloat(m[2]);

            if (crs !== 'EPSG:4326') {
              let projected = this._projectCoordinates(crs, 'EPSG:4326', [x, y]);
              x = projected[0];
              y = projected[1];
            }

            mas.push([y, x]);
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
    let knownCrs = Ember.getOwner(this).knownForType('coordinate-reference-system');
    let knownCrsArray = Ember.A(Object.values(knownCrs));
    let fromCrs = knownCrsArray.findBy('code', from);
    let fromCrsDefinition = Ember.get(fromCrs, 'definition');
    let toCrs = knownCrsArray.findBy('code', to);
    let toCrsDefinition = Ember.get(toCrs, 'definition');
    let cords = proj4(fromCrsDefinition, toCrsDefinition, coordinates);
    return cords;
  },

  /**
    Define if line contains more than one coordinate pair.

    @method _isSinglePairInLine
    @param {Object[]} coordinates Coordinates.
    @returns {Boolean} true if contains, otherwise false.
  */
  _isSinglePairInLine(coordinates) {
    let lines = coordinates.split('\n');
    let badLines = false;
    lines.forEach(line => {
      line = line.trim();
      if (line !== '') {
        if (line.split(' ').length !== 2) {
          badLines = true;
        }
      }
    });
    if (badLines) {
      return false;
    } else {
      return true;
    }
  }
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryGeometryAddModeManualComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryGeometryAddModeManualComponent;
