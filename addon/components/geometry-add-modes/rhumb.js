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
    Flag indicates whether rhumb geometry rhumb dialog has been already requested by user or not.

    @property _dialogHasBeenRequested
    @type Boolean
    @default false
    @private
  */
  _dialogHasBeenRequested: false,

  /**
    Flag indicates whether to show rhumb geometry adding dialog.

    @property _dialogVisible
    @type Boolean
    @default false
    @private
  */
  _dialogVisible: false,

  /**
    Form validation flags.

    @property _formValid
    @type Object
    @default {
    startPointValid: false,
    typeObjectValid: false,
    tableValid: false
  }
    @private
  */
  _formValid: {
    startPointValid: false,
    typeObjectValid: false,
    tableValid: false
  },

  /**
    Validation flags for adding a new record.

    @property _addValid
    @type Object
    @default {
    directionValid: false,
    rhumbValid: false,
    distanceValid: false
  }
    @private
  */
  _addValid: {
    directionValid: false,
    rhumbValid: false,
    distanceValid: false
  },

  /**
    Validation flags for adding a edited record.

    @property _editValid
    @type Object
    @default {
    directionValid: false,
    rhumbValid: false,
    distanceValid: false
  }
    @private
  */
  _editValid: {
    directionValid: false,
    rhumbValid: false,
    distanceValid: false
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
    Object types.

    @property _objectTypes
    @type string[]
    @default ['Polygon', 'Line']
    @readonly
    @private
  */
  _objectTypes: Ember.A([
    {
      captionPath: 'components.geometry-add-modes.rhumb.object-types-polygon',
      type: 'Polygon'
    },
    {
      captionPath: 'components.geometry-add-modes.rhumb.object-types-line',
      type: 'Line'
    }
  ]),

  /**
    Availble type.
  */
  _availableType: null,

  /**
    Current type.
  */
  _curType: null,

  /**
    Set _dataForm.objectType.
  */
  _type: Ember.observer('_curType', function() {
    let factories = this.get('_objectTypes');
    let _curType = this.get('_curType');
    let res = null;

    if (!Ember.isNone(_curType)) {
      res = factories.filter((factory) => factory.caption.toString() === _curType)[0].type;
      this._dataForm.objectType = res;
    }

    return res;
  }),

  /**
    Form fields.

    @property _dataForm
    @type Object
    @default {
    objectType: null,
    startPoint: ''
  }
    @private
  */
  _dataForm: {
    objectType: null,
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

  /**
    Fields for adding a new record.

    @property _dataFormTable
    @type Object
    @default {
    direction: null,
    rhumb: null,
    distance: null,
  }
    @private
 */
  _dataFormTable: {
    direction: null,
    rhumb: null,
    distance: null,
  },

  _availableCoordinateReferenceSystemsCodes: null,

  menuButtonTooltip: t('components.geometry-add-modes.rhumb.menu-button-tooltip'),

  dialogApproveButtonCaption: t('components.geometry-add-modes.rhumb.dialog-approve-button-caption'),

  dialogDenyButtonCaption: t('components.geometry-add-modes.rhumb.dialog-deny-button-caption'),

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

  placeholderNoValue: t('components.geometry-add-modes.rhumb.placeholderNoValue'),

  init() {
    this._super(...arguments);

    let factories = this.get('typeItems');
    let availableType = [];

    if (!Ember.isNone(factories)) {
      factories.forEach((factory) => {
        availableType.push(factory.caption);
      });
    }

    this.set('_availableType', availableType);

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
    Type items metadata.

    @property typeItems
    @type Object[]
  */
  typeItems: Ember.computed('_objectTypes.[]', '_objectTypes.@each.active', 'i18n', function () {
    let i18n = this.get('i18n');
    let _objectTypes = this.get('_objectTypes');

    let result = Ember.A(_objectTypes);
    result.forEach((item) => {
      let caption = Ember.get(item, 'caption');
      let captionPath = Ember.get(item, 'captionPath');

      if (!caption && captionPath) {
        Ember.set(item, 'caption', i18n.t(captionPath));
      }
    });

    return result;
  }),

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

  actions: {
    /**
      Handles button click.
    */
    onOpenDialog() {
      this.set('_dialogHasBeenRequested', true);
      this.set('_dialogVisible', true);
      this.set('isError', false);

      this._dropForm();
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.approve:method"}}'flexberry-dialog' component's 'approve' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryGeometryAddModeRhumbComponent/sendingActions.complete:method"}}'complete' action{{/crossLink}}.

      @method actions.onApprove
    */
    onApprove(e) {
      this._dropTableValidForm();
      let error = false;
      this.set('isError', false);

      if (Ember.isNone(this._dataForm.objectType)) {
        this.set('_formValid.typeObjectValid', true);
        error = true;
      } else {
        this.set('_formValid.typeObjectValid', false);
      }

      if (!this._validStartPoint(this._dataForm.startPoint)) {
        this.set('_formValid.startPointValid', true);
        error = true;
      } else {
        this.set('_formValid.startPointValid', false);
      }

      let skipNum = this._countSkip();
      if (Ember.isNone(skipNum)) {
        this.set('isError', true);
        this.set('message', this.get('cannotChangePermission'));
      }

      if (Ember.isNone(skipNum) || this._tableData.length === 0 || (this._dataForm.objectType === 'Polygon' && this._tableData.length < skipNum + 2) ||
        (this._dataForm.objectType === 'Line' && this._tableData.length < skipNum + 1)) {
        this.set('_formValid.tableValid', true);
        error = true;
      } else {
        this.set('_formValid.tableValid', false);
      }

      if (error) {
        e.closeDialog = false;

        return;
      }

      let objectType;
      switch (this._dataForm.objectType) {
        case 'Polygon':
          objectType = 'Polygon';
          break;
        case 'Line':
          objectType = 'LineString';
          break;
      }

      const startPoints = this._dataForm.startPoint.split(' ');

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
          distance: item.distance
        };

        points.push(data);
      }

      const crsCode  = this.get('settings.layerCRS.code');
      const data = {
        type: objectType,
        startPoint: startPoints,
        skip: skipNum,
        crs: crsCode,
        points: points
      };

      let crsRhumb = Ember.get(this.tabModel, 'leafletObject.options.crs');
      const rhumbObj = rhumbOperations.createObjectRhumb(data, crsRhumb, this);
      let coordsToLatLng = function(coords) {
        return crsRhumb.unproject(L.point(coords));
      };

      let geoJSON = null;
      if (crsRhumb.code !== 'EPSG:4326') {
        geoJSON = L.geoJSON(rhumbObj, { coordsToLatLng: coordsToLatLng.bind(this) });
      } else {
        geoJSON = L.geoJSON(rhumbObj);
      }

      let newObj = geoJSON.getLayers()[0];

      this.sendAction('complete', newObj, { panToAddedObject: true });
    },

    /**
      Handles change type.
    */
    validType() {
      this.set('_formValid.typeObjectValid', Ember.isNone(this._dataForm.objectType));
    },

    /**
      Handles change start point.
    */
    validCoord() {
      this.set('_formValid.startPointValid', !this._validStartPoint(this._dataForm.startPoint));
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.deny:method"}}'flexberry-dialog' component's 'deny' action{{/crossLink}}.

      @method actions.onDeny
    */
    onDeny(e) {
      this._dropForm();
    },

    /**
      The button for adding a new record to the table.

      @method actions.onAddRow
    */
    onAddRow(option) {
      let error = false;

      if (Ember.isNone(this._dataFormTable.direction)) {
        this.set('_addValid.directionValid', true);
        error = true;
      } else {
        this.set('_addValid.directionValid', false);
      }

      if (!this._validFloatNumber(this._dataFormTable.rhumb)) {
        this.set('_addValid.rhumbValid', true);
        error = true;
      } else {
        this.set('_addValid.rhumbValid', false);
      }

      if (!this._validFloatNumber(this._dataFormTable.distance)) {
        this.set('_addValid.distanceValid', true);
        error = true;
      } else {
        this.set('_addValid.distanceValid', false);
      }

      if (error) {
        return;
      }

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

      const row = {
        id: getGuid(),
        number: '0-1',
        readonly: true,
        _skip: {},
        skip: skip,
        direction: this._dataFormTable.direction,
        rhumb: this._dataFormTable.rhumb,
        distance: this._dataFormTable.distance,
        directionValid: false,
        rhumbValid: false,
        distanceValid: false
      };

      Ember.set(row._skip, Ember.guidFor(row), skip);
      this._tableData.pushObject(row);
      this._dropTableForm();
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
              Ember.set(this._tableData[0]._skip, Ember.guidFor(this._tableData[0]), true);
            } else {
              Ember.set(this._tableData[1], 'skip', true);
              Ember.set(this._tableData[1]._skip, Ember.guidFor(this._tableData[1]), true);
            }
          }

          this._countOrder();
          return;
        }
      }
    },

    /**
      Button to edit a record in a table.

      @method actions.OnEditRow
    */
    OnEditRow(id) {
      for (let i = 0; i < this._tableData.length; i++) {
        let item = this._tableData[i];
        if (item.id === id) {
          if (Ember.get(item, 'readonly')) {
            Ember.set(item, 'readonly', false);
          } else {
            let error = false;
            if (Ember.isNone(item.direction)) {
              Ember.set(item, 'directionValid', true);
              error = true;
            } else {
              Ember.set(item, 'directionValid', false);
            }

            if (!this._validFloatNumber(item.rhumb)) {
              Ember.set(item, 'rhumbValid', true);
              error = true;
            } else {
              Ember.set(item, 'rhumbValid', false);
            }

            if (!this._validFloatNumber(item.distance)) {
              Ember.set(item, 'distanceValid', true);
              error = true;
            } else {
              Ember.set(item, 'distanceValid', false);
            }

            if (error) {
              return;
            }

            Ember.set(item, 'readonly', true);
          }

          return;
        }
      }
    },

    /**
      Handles click on checkbox.

      @method actions.onRhumbSkipChange
    */
    onRhumbSkipChange(rowId, row, options) {
      let checked = options.checked;
      this.set('isError', false);
      let curSkip = this._tableData.filter((item) => {
        return Ember.get(item, 'skip');
      });

      if (this._tableData.length > 1 && (!Ember.isEmpty(curSkip) && Ember.get(curSkip[0], 'id') !== row.id)) {
        if (confirm(this.get('changePermission'))) {
          for (let i = 0; i < this._tableData.length; i++) {
            let item = this._tableData[i];
            Ember.set(item, 'skip', false);
            Ember.set(item._skip, Ember.guidFor(item), false);
            if (item.id === row.id) {
              Ember.set(item, 'skip', true);
              Ember.set(item._skip, Ember.guidFor(item), true);
            }
          }
        } else {
          options.checked = !checked;
          Ember.set(row._skip, rowId, checked);  //strange magic
          Ember.set(row._skip, rowId, !checked);
        }
      } else if (this._tableData.length === 1) {
        let item = this._tableData[0];
        if (this._tableData[0].skip) {
          Ember.set(item, 'skip', false);
          Ember.set(item._skip, Ember.guidFor(item), false);
        }else {
          Ember.set(item, 'skip', true);
          Ember.set(item._skip, Ember.guidFor(item), true);
        }
      } else if (!Ember.isEmpty(curSkip) && row.id === Ember.get(curSkip[0], 'id')) {
        if (Ember.get(curSkip[0], 'skip')) {
          this.set('isError', true);
          this.set('message', this.get('cannotChangePermission'));
          options.checked = !checked;
          Ember.set(row._skip, rowId, checked);  //strange magic
          Ember.set(row._skip, rowId, !checked);
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

    @method _countSkip
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
    this.set('_dataForm.objectType', null);
    this.set('_curType', null);

    this._dropTableForm();
    Object.keys(this._formValid).forEach(v => Ember.set(this, `_formValid.${v}`, false));
    this._dropTableValidForm();
    this.set('_tableData', Ember.A([]));
  },

  /**
    Сlear form.

    @method _dropTableValidForm
  */
  _dropTableValidForm() {
    Object.keys(this._addValid).forEach(v => Ember.set(this, `_addValid.${v}`, false));
  },

  /**
    Clear form validation.

    @method _dropTableForm
  */
  _dropTableForm() {
    Object.keys(this._dataFormTable).forEach(v => Ember.set(this, `_dataFormTable.${v}`, null));
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
