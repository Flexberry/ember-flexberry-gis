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
const flexberryClassNamesPrefix = 'flexberry-geometry-add-mode-manual';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null,
  dialog: flexberryClassNamesPrefix + '-dialog',
};

let FlexberryGeometryAddModeRhumbComponent = Ember.Component.extend(rhumbOperations, {

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

    @property _formValide
    @type Object
    @default {
    startPointValide: false,
    typeObjectValide: false,
    tableValide: false
  }
    @private
  */
  _formValide: {
    startPointValide: false,
    typeObjectValide: false,
    tableValide: false
  },

  /**
    Validation flags for adding a new record.

    @property _addValide
    @type Object
    @default {
    directionValide: false,
    rhumbValide: false,
    distanceValide: false
  }
    @private
  */
  _addValide: {
    directionValide: false,
    rhumbValide: false,
    distanceValide: false
  },

  /**
    List of cardinal points.

    @property _cardinalPoints
    @type string[]
    @default ['СВ', 'ЮВ', 'ЮЗ', 'СЗ']
    @readonly
    @private
  */
  _cardinalPoints: ['СВ', 'ЮВ', 'ЮЗ', 'СЗ'],

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
  _objectTypes: ['Polygon', 'Line'],

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

  actions: {
    /**
      Handles button click.
    */
    onOpenDialog() {
      this.set('_dialogHasBeenRequested', true);
      this.set('_dialogVisible', true);

      this._dropForm();
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.approve:method"}}'flexberry-dialog' component's 'approve' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryGeometryAddModeRhumbComponent/sendingActions.complete:method"}}'complete' action{{/crossLink}}.

      @method actions.onApprove
    */
    onApprove(e) {
      this._dropTableValideForm();
      let error = false;

      if (Ember.isNone(this._dataForm.objectType)) {
        this.set('_formValide.typeObjectValide', true);
        error = true;
      } else {
        this.set('_formValide.typeObjectValide', false);
      }

      if (!this._validStartPoint(this._dataForm.startPoint)) {
        this.set('_formValide.startPointValide', true);
        error = true;
      } else {
        this.set('_formValide.startPointValide', false);
      }

      if (this._tableData.length === 0 || (this._dataForm.objectType === 'Polygon' && this._tableData.length < 3) ||
        (this._dataForm.objectType === 'Line' && this._tableData.length < 2)) {
        this.set('_formValide.tableValide', true);
        error = true;
      } else {
        this.set('_formValide.tableValide', false);
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

      const startPoints = this._dataForm.startPoint.split(';');

      let points = [];
      for (let i = 0; i < this._tableData.length; i++) {
        let item = this._tableData[i];
        let data = {
          rib: i !== this._tableData.length - 1 ? `${i + 1};${i + 2}` : `${i + 1};${1}`,
          rhumb: `${item.direction};${item.rhumb}`,
          distance: item.distance
        };

        points.push(data);
      }

      const data = {
        type: objectType,
        startPoint: startPoints,
        points: points
      };

      const rhumbObj = this.createObjectRhumb(data);
      const coordinates = rhumbObj.geometry.coordinates;

      let addedLayer;
      switch (this._dataForm.objectType) {
        case 'Polygon':
          addedLayer = L.polygon(coordinates);
          break;
        case 'Line':
          addedLayer = L.polyline(coordinates);
          break;
      }

      this.sendAction('complete', addedLayer, { panToAddedObject: true });
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
    onAddRow() {
      let error = false;

      if (Ember.isNone(this._dataFormTable.direction)) {
        this.set('_addValide.directionValide', true);
        error = true;
      } else {
        this.set('_addValide.directionValide', false);
      }

      if (!this._validFloatNumber(this._dataFormTable.rhumb)) {
        this.set('_addValide.rhumbValide', true);
        error = true;
      } else {
        this.set('_addValide.rhumbValide', false);
      }

      if (!this._validFloatNumber(this._dataFormTable.distance)) {
        this.set('_addValide.distanceValide', true);
        error = true;
      } else {
        this.set('_addValide.distanceValide', false);
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

      const row = {
        id: getGuid(),
        direction: this._dataFormTable.direction,
        rhumb: this._dataFormTable.rhumb,
        distance: this._dataFormTable.distance
      };

      this._tableData.pushObject(row);
      this._dropTableForm();
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

          return;
        }
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

    this._dropTableForm();
    Object.keys(this._formValide).forEach(v => Ember.set(this, `_formValide.${v}`, false));
    this._dropTableValideForm();
    this.set('_tableData', Ember.A([]));
  },

  /**
    Сlear form.

    @method _dropTableValideForm
  */
  _dropTableValideForm() {
    Object.keys(this._addValide).forEach(v => Ember.set(this, `_addValide.${v}`, false));
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
    const regex = /^(([0-9]*[.])?[0-9]+);(([0-9]*[.])?[0-9]+)$/;
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
