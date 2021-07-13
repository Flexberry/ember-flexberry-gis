/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/geometry-add-modes/rhumb';
import { translationMacro as t } from 'ember-i18n';
import rhumbOperations from '../../utils/rhumb-operations';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-geometry-add-mode-rhumb').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-geometry-add-mode-rhumb').
  @property {String} flexberryClassNames.dialog Component's inner dialog CSS-class name ('flexberry-geometry-add-mode-rhumb').
  @readonly
  @static

  @for FlexberryGeometryAddModeRhumbComponent
*/
const flexberryClassNamesPrefix = 'flexberry-geometry-add-mode-rhumb';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null,
  dialog: flexberryClassNamesPrefix + '-dialog',
  tableBlock: flexberryClassNamesPrefix + '-table-block'
};

let FlexberryGeometryAddModeRhumbComponent = Ember.Component.extend({

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
    @property CRS
    @default null
    @private
  */
  _crs: null,

  /**
    @property layer
    @type Leaflet layer
    @default null
    @private
  */
  layer: null,

  active: false,

  /**
    Form validation flags.

    @property _formValid
    @type Object
    @default {
    startPointValid: false,
    tableValid: false
  }
    @private
  */
  _formValid: {
    startPointValid: false,
    tableValid: false
  },

  /**
    Availble direction.
  */
  _availableDirection: null,

  /**
    Object direction.

    @property _objectDirections
    @type string[]
    @default ['Polygon', 'Line']
    @readonly
    @private
  */
  _objectDirections: Ember.A([
    {
      captionPath: 'components.geometry-add-modes.rhumb.NE',
      type: 'NE'
    },
    {
      captionPath: 'components.geometry-add-modes.rhumb.SE',
      type: 'SE'
    },
    {
      captionPath: 'components.geometry-add-modes.rhumb.SW',
      type: 'SW'
    },
    {
      captionPath: 'components.geometry-add-modes.rhumb.NW',
      type: 'NW'
    }
  ]),

  /**
    Data table.

    @property _tableData
    @type Object[]
    @default Ember.A([])
    @private
  */
  _tableData: Ember.A([]),

  /**
    Form fields.

    @property _dataForm
    @type Object
    @default {
    startPoint: ''
  }
    @private
  */
  _dataForm: {
    startPoint: ''
  },

  /**
    Error message.
  */
  message: '',

  /**
    Flag indicates whether to show error message.

    @property _dialogVisible
    @type Boolean
    @default false
    @private
  */
  isError: false,

  _availableCoordinateReferenceSystemsCodes: null,

  startPointFieldLabel: t('components.geometry-add-modes.rhumb.start-point-field-label'),

  typeObjectFieldLabel: t('components.geometry-add-modes.rhumb.type-object-field-label'),

  directionTh: t('components.geometry-add-modes.rhumb.direction-field-label'),

  rhumbTh: t('components.geometry-add-modes.rhumb.rhumb-field-label'),

  distanceTh: t('components.geometry-add-modes.rhumb.distance-field-label'),

  addButtonCaption: t('components.geometry-add-modes.rhumb.add-button-caption'),

  tableFieldLabel: t('components.geometry-add-modes.rhumb.table-field-label'),

  tableColumnOperation: t('components.geometry-add-modes.rhumb.table-column-operation'),

  addCoordinatesFieldLabel: t('components.geometry-add-modes.rhumb.add-coordinates-field-label'),

  coordinatesSystemFieldLabel: t('components.geometry-add-modes.rhumb.crs-code'),

  rhumbNumber: t('components.geometry-add-modes.rhumb.number'),

  rhumbObjectStart: t('components.geometry-add-modes.rhumb.object-start'),

  changePermission: t('components.geometry-add-modes.rhumb.change-permission'),

  coordinatesFieldPlaceholder: t('components.geometry-add-modes.rhumb.coordinates-field-placeholder'),

  cannotChangePermission: t('components.geometry-add-modes.rhumb.cannot-change-permission'),

  incorrectPermission: t('components.geometry-add-modes.rhumb.incorrect-permission'),

  placeholderNoValue: t('components.geometry-add-modes.rhumb.placeholderNoValue'),

  init() {
    this._super(...arguments);

    let directionItems = this.get('directionItems');
    let availableDirection = [];

    if (!Ember.isNone(directionItems)) {
      directionItems.forEach((item) => {
        availableDirection.push(item.caption);
      });
    }

    this.set('_availableDirection', availableDirection);
  },

  /**
    Direction items metadata.

    @property directionItems
    @type Object[]
  */
  directionItems: Ember.computed('_objectDirections.[]', '_objectDirections.@each.active', 'i18n', function () {
    let i18n = this.get('i18n');
    let _objectDirections = this.get('_objectDirections');

    let result = Ember.A(_objectDirections);
    result.forEach((item) => {
      let caption = Ember.get(item, 'caption');
      let captionPath = Ember.get(item, 'captionPath');

      if (!caption && captionPath) {
        Ember.set(item, 'caption', i18n.t(captionPath));
      }
    });

    return result;
  }),

  initialSettings: Ember.on('init', Ember.observer('settings', function () {
    this.set('isError', false);
    this.set('_crs', this.get('settings.layerCRS'));
    this._dropForm();
  })),

  getLayer() {
    let error = false;
    this.set('isError', false);
    this.set('message', null);

    this.set('_formValid.startPointValid', !this._validStartPoint(this._dataForm.startPoint));
    error |= !this._validStartPoint(this._dataForm.startPoint);

    let skipNum = this._countSkip();
    if (Ember.isNone(skipNum)) {
      this.set('isError', true);
      this.set('message', this.get('cannotChangePermission'));
    }

    let type = this.get('settings.typeGeometry');

    if (Ember.isNone(skipNum) || this._tableData.length === 0 || (type === 'polygon' && this._tableData.length < skipNum + 2) ||
      (type === 'polyline' && this._tableData.length < skipNum + 1)) {
      this.set('_formValid.tableValid', true);
      error = true;
      this.set('message', this.get('incorrectPermission'));
    } else {
      this.set('_formValid.tableValid', false);
    }

    for (let i = 0; i < this._tableData.length; i++) {
      let item = this._tableData[i];
      Ember.set(item, 'directionValid', Ember.isNone(item.direction));
      Ember.set(item, 'rhumbValid', !this._validFloatNumber(item.rhumb));
      Ember.set(item, 'distanceValid', !this._validFloatNumber(item.distance));
      error |= Ember.isNone(item.direction) || !this._validFloatNumber(item.rhumb) || !this._validFloatNumber(item.distance);
    }

    if (error) {
      return [true, null];
    }

    let objectType;
    switch (type) {
      case 'polygon':
        objectType = 'Polygon';
        break;
      case 'polyline':
        objectType = 'LineString';
        break;
    }

    const startPoints = this._dataForm.startPoint.split(' ').map((p) => { return parseFloat(p); });

    let translateDirection = (direction) => {
      let factories = this.get('_objectDirections');
      let res = null;

      if (!Ember.isNone(direction)) {
        res = factories.filter((factory) => factory.caption.toString() === direction)[0].type;
      }

      return res;
    };

    let points = [];
    for (let i = 0; i < this._tableData.length; i++) {
      let item = this._tableData[i];
      let data = {
        rhumb: `${translateDirection(item.direction)}`,
        angle: item.rhumb,
        distance: parseFloat(item.distance)
      };

      points.push(data);
    }

    const crsCode = this.get('_crs.code');
    let data = {
      type: objectType,
      startPoint: startPoints,
      skip: skipNum,
      crs: crsCode,
      points: points
    };

    try {
      let crsRhumb = this.get('settings.layerCRS');
      const rhumbObj = rhumbOperations.createObjectRhumb(data, crsRhumb, this);
      let coordsToLatLng = function (coords) {
        return crsRhumb.unproject(L.point(coords));
      };

      let geoJSON = null;
      if (crsRhumb.code !== 'EPSG:4326') {
        geoJSON = L.geoJSON(rhumbObj, { coordsToLatLng: coordsToLatLng.bind(this) });
      } else {
        geoJSON = L.geoJSON(rhumbObj);
      }

      let newObj = geoJSON.getLayers()[0];

      return [false, newObj];
    } catch (e) {
      return [true, null];
    }
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

      this.sendAction('updateLayer', addedLayer, true);
    },

    /**
      Handles change start point.
    */
    validCoord() {
      this.set('_formValid.startPointValid', !this._validStartPoint(this._dataForm.startPoint));
    },

    /**
      The button for adding a new record to the table.

      @method actions.onAddRow
    */
    OnAddRow(rowId) {
      const getGuid = () => {
        const templ = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
        let result = templ.replace(/[xy]/g, (c, r) => {

          return c === 'x' ? Math.random() * 16 | 0 : r & 0x3 | 0x8;
        });

        return result.toString(16);
      };

      let skip = (this._tableData.length === 1 && !this._tableData[0].skip) ? true : false;
      if (this.get('isError') && skip) {
        this.set('isError', false);
      }

      let index = -1;
      for (let i = 0; i < this._tableData.length; i++) {
        if (this._tableData[i].id === rowId) {
          index = i;
        }
      }

      const row = {
        id: getGuid(),
        number: '0-1',
        readonly: true,
        skip: skip,
        direction: null,
        rhumb: null,
        distance: null,
        directionValid: false,
        rhumbValid: false,
        distanceValid: false
      };

      this._tableData.insertAt(index + 1, row);

      this._countOrder();
    },

    /**
      Button to delete a record in a table.

      @method actions.OnRemoveRow
    */
    OnRemoveRow(id) {
      for (let i = 0; i < this._tableData.length; i++) {
        let item = this._tableData[i];
        if (item.id === id) {
          this._tableData.removeAt(i, 1);
          if (Ember.get(item, 'skip')) {
            if (this._tableData.length === 1) {
              Ember.set(this._tableData[0], 'skip', true);
            } else {
              Ember.set(this._tableData[1], 'skip', true);
            }
          }

          this._countOrder();
          return;
        }
      }
    },

    /**
      Handles click on checkbox.

      @method actions.onRhumbSkipChange
    */
    onRhumbSkipChange(row, options) {
      let checked = options.checked;

      this.set('isError', false);

      // не будем давать снимать галку, только перевесить
      if (!checked) {
        Ember.set(row.skip, true);
        return;
      }

      if (this._tableData.length > 1 && this._tableData.filter((item) => item.skip).length > 1) {
        if (confirm(this.get('changePermission'))) {
          for (let i = 0; i < this._tableData.length; i++) {
            let item = this._tableData[i];
            if (item.id !== row.id) {
              Ember.set(item, 'skip', false);
            }
          }
        } else {
          Ember.set(row, 'skip', false);
        }
      }
    },

    /**
      Handles input limit.
      @method actions.inputLimit
    */
    onInputLimit(str, e) {
      const regex = /^\.|[^\d\.]|\.(?=.*\.)|^0+(?=\d)/g;
      if (!Ember.isEmpty(str) && regex.test(str)) {
        Ember.$(e.target).val(str.replace(regex, ''));
      }
    }
  },

  /**
    Count order number of rhumbs.

    @method _countOrder
  */
  _countOrder() {
    for (let i = 0; i < this._tableData.length; i++) {
      let item = this._tableData[i];
      Ember.set(item, 'number', `${i}-${i + 1}`);
    }
  },

  /**
    Count number of binding rhumbs.

    @method _countSkip
  */
  _countSkip() {
    for (let i = 0; i < this._tableData.length; i++) {
      let item = this._tableData[i];
      if (Ember.get(item, 'skip')) {
        return i;
      }
    }
  },
  /**
    Сlear form.

    @method _dropForm
  */
  _dropForm() {
    this.set('_dataForm.startPoint', '');
    this.set('_curType', null);

    this.set('_tableData', Ember.A());
    this.send('OnAddRow');

    Object.keys(this._formValid).forEach(v => Ember.set(this, `_formValid.${v}`, false));
  },

  /**
    Number check.

    @method _validFloatNumber
  */
  _validFloatNumber(str) {
    const regex = /^(([0-9]*[.])?[0-9]+)$/;
    return regex.exec(str);
  },

  /**
    Starp point check.

    @method _validStartPoint
  */
  _validStartPoint(str) {
    const regex = /^(([0-9]*[.])?[0-9]+) (([0-9]*[.])?[0-9]+)$/;
    return regex.exec(str);
  }

  /**
    Component's action invoking when new geometry was added.

    @method sendingActions.complete
    @param {Object} addedLayer Added layer.
    @param {Object} options Actions options.
    @param {Boolean} options.panToAddedObject Flag indicating wheter to pan to added object.
  */
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryGeometryAddModeRhumbComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryGeometryAddModeRhumbComponent;
