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
  @property {String} flexberryClassNames.form Component's inner <form> CSS-class name ('flexberry-geometry-add-mode-rhumb').
  @readonly
  @static

  @for FlexberryGeometryAddModeRhumbComponent
*/
const flexberryClassNamesPrefix = 'flexberry-geometry-add-mode-manual';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null,
  dialog: flexberryClassNamesPrefix + '-dialog',
  form: flexberryClassNamesPrefix + '-form'
};

//let FlexberryGeometryAddModeRhumbComponent = Ember.Component.extend(mapModelApi, {
let FlexberryGeometryAddModeRhumbComponent = Ember.Component.extend(rhumbOperations, {
  /**
    Service for managing map API.
    @property mapApi
    @type MapApiService

  mapApi: Ember.inject.service(),*/
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


  // _startPointValideError: false,
  // _typeObjectValideError: false,

  // _addTableValideError: false,

  _formValide: {
    startPointValide: false,
    typeObjectValide: false,
    tableValide: false
  },

  _addValide: {
    directionValide: false,
    rhumbValide: false,
    distanceValide: false
  },

  /*  _addDirectionValide: false,
   _addRhumbValide: false,
   _addDistanceValide: false, */

  _cardinalPoints: ['СВ', 'ЮВ', 'ЮЗ', 'СЗ'],

  // _queryResults: null,
  _queryResults: Ember.A(
    [
      { id: 0, direction: 'ЮВ', rhumb: 86.76787457562546, distance: 8182.6375760837955 },
      { id: 1, direction: 'СВ', rhumb: 79.04259420114585, distance: 8476.868426796427 },
      { id: 2, direction: 'ЮЗ', rhumb: 86.0047147391561, distance: 16532.122718537685 }
    ]
  ),

  _objectTypes: ['Polygon', 'Line'],

  _objectType: null,

  _startPoint: '',

  _dataTable: {
    direction: null,
    rhumb: null,
    distance: null,
  },

  // _direction: null,
  // _rhumb: null,
  // _distance: null,

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

  //removeButtonCaption: t('components.geometry-add-modes.rhumb.remove-button-caption'),

  actions: {
    /**
      Handles button click.
    */
    onOpenDialog() {
      this.set('_dialogHasBeenRequested', true);
      this.set('_dialogVisible', true);



      this._dropForm();

      // const rowId = this._getRowId(tabModel);
      // const edit = Ember.get(tabModel, `_editedRows.${rowId}`);

      // this.set('_objectTypeDisabled', edit);

      // if (edit) {
      // const layer = Ember.get(tabModel, `featureLink.${rowId}`);
      // const geoJSON = layer.toGeoJSON();
      // const type = Ember.get(geoJSON, 'geometry.type');

      // let coordinates = geoJSON.geometry.coordinates;

      //this.createPolygonObjectRhumb('0f2b3002-1b28-44bd-877f-6c0a917b963f', data);

      //let objectId = Ember.get(layer, 'feature.id');

      //let objectContainingActionHandler = Ember.Object.extend(mapModelApi).create();

      // const mapLayer = this.get('mapLayer')
      // const mapApi = this.get('mapApi');

      // let data = this.getRhumb(mapLayer, mapApi, 'fc26ac89-ccb5-47f5-bd2d-89a5e587f9d3', geoJSON.id);

      // this._startPoint = `${data.StartPoint.lat};${data.StartPoint.lng}`;

      // switch (type) {
      //   case 'Polygon':
      //     _objectType = 'Polygon';
      //     break;
      //   case 'LineString':
      //     _objectType = 'Line';
      //     break;
      // }

      //   var hh = { direction: 'ЮЗ', rhumb: 86.0047147391561, distance: 16532.122718537685 };//this._queryResults[0];


      // this.hh = Ember.A([
      //   { id: 0, rib: '1;2', direction: 'ЮВ', rhumb: 86.76787457562546, distance: 8182.6375760837955 },
      //   { id: 1, rib: '2;3', direction: 'СВ', rhumb: 79.04259420114585, distance: 8476.868426796427 },
      //   { id: 2, rib: '3;1', direction: 'ЮЗ', rhumb: 86.0047147391561, distance: 16532.122718537685 }
      // ]);

      // Ember.set(this, '_queryResults', this.hh);
      // this._queryResults.push(data);

      // const str = this._cootrdinatesToString(coordinates);
      // this.set('_coordinates', str);

      //   this.set('_objectSelectType', type);
      // } else {
      //   this.set('_startPoint', '');
      //   this.set('_objectType', null);

      //   this.set('_direction', null);
      //   this.set('_rhumb', null);
      //   this.set('_distance', null);
      // }

    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.approve:method"}}'flexberry-dialog' component's 'approve' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryGeometryAddModeRhumbComponent/sendingActions.complete:method"}}'complete' action{{/crossLink}}.

      @method actions.onApprove
    */
    onApprove(e) {
      this._dropTableValideForm();
      let error = false;

      if (Ember.isNone(this._objectType)) {
        this.set('_formValide.typeObjectValide', true);
        error = true;
      } else {
        this.set('_formValide.typeObjectValide', false);
      }

      if (Ember.isBlank(this._startPoint)) {
        this.set('_formValide.startPointValide', true);
        error = true;
      } else {
        //const points = this._startPoint.split(';');//todo:!!!

        //^(([0-9]*[.])?[0-9]+);(([0-9]*[.])?[0-9]+)$

        const regex = /^(([0-9]*[.])?[0-9]+);(([0-9]*[.])?[0-9]+)$/;
        // const str = `47.098098;48.8979798`;
        // let m;

        //if ((m = regex.exec(this._startPoint)) !== null) {
        if (regex.exec(this._startPoint) === null) {
          this.set('_formValide.startPointValide', true);
          error = true;

          // The result can be accessed through the `m`-variable.
          // m.forEach((match, groupIndex) => {
          //   console.log(`Found match, group ${groupIndex}: ${match}`);
          // })

          // if (points.length !== 2) {
          //   this.set('_startPointValideError', true);
          //   error = true;
          // } else {
          //   this.set('_startPointValideError', false);
          // }
        } else {
          this.set('_formValide.startPointValide', false);
        }
      }

      if ((this._objectType === 'Polygon' && this._queryResults.length < 3) || (this._objectType === 'Line' && this._queryResults.length < 2)) {
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
      switch (this._objectType) {
        case 'Polygon':
          objectType = 'Polygon';
          break;
        case 'Line':
          objectType = 'LineString';
          break;
      }

      const startPoints = this._startPoint.split(';');

      let points = [];
      for (let i = 0; i < this._queryResults.length; i++) {
        let item = this._queryResults[i];
        let data = {
          rib: i !== this._queryResults.length - 1 ? `${i + 1};${i + 2}` : `${i + 1};${1}`,
          rhumb: `${item.direction};${item.rhumb}`,
          distance: item.distance
        };

        points.push(data);
      }

      let data = {
        // type: 'LineString',
        type: objectType,
        // properties: { name: 'test_polygon' },
        // startPoint: [85, 79],
        startPoint: startPoints,
        // points: [
        //   { rib: '1;2', rhumb: 'ЮВ;86.76787457562546', distance: 8182.6375760837955 },
        //   { rib: '2;3', rhumb: 'СВ;79.04259420114585', distance: 8476.868426796427 },
        //   { rib: '3;1', rhumb: 'ЮЗ;86.0047147391561', distance: 16532.122718537685 }
        // ]
        points: points
      };

      const rhumbObj = this.createObjectRhumb(data);
      const coordinates = rhumbObj.geometry.coordinates;//this.get('rhumbObj.geometry.coordinates');

      let addedLayer;
      switch (this._objectType) {
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
      //this._formValide.clear()
      this._dropForm();

      // this.set('_startPoint', '');
      // this.set('_objectType', null);

      // this.set('_direction', null);
      // this.set('_rhumb', null);
      // this.set('_distance', null);

      // this.set('_startPointValideError', false);
      // this.set('_typeObjectValideError', false);

      // this.set('_addDirectionValide', false);
      // this.set('_addRhumbValide', false);
      // this.set('_addDistanceValide', false);

      // this.set('_queryResults', Ember.A([]));
    },

    onAddRow() {
      let error = false;

      if (Ember.isNone(this._dataTable.direction)) {
        this.set('_addValide.directionValide', true);
        error = true;
      } else {
        this.set('_addValide.directionValide', false);
      }

      if (Ember.isBlank(this._dataTable.rhumb)) {
        this.set('_addValide.rhumbValide', true);
        error = true;
      } else {
        if (this._validFloatNumber(this._dataTable.rhumb)) {
          this.set('_addValide.rhumbValide', false);
        } else {
          this.set('_addValide.rhumbValide', true);
          error = true;
        }
      }

      if (Ember.isBlank(this._addValide.distance)) {
        this.set('_addValide.distanceValide', true);
        error = true;
      } else {
        if (this._validFloatNumber(this._addValide.distance)) {
          this.set('_addValide.distanceValide', false);
        } else {
          this.set('_addValide.distanceValide', true);
          error = true;
        }
      }

      if (error) {
        return;
      }

      const getGuid = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }

      // let serviceLayer = this.get('mapApi');
      var row = {
        id: getGuid(),
        direction: this._dataTable.direction,
        rhumb: this._dataTable.rhumb,
        distance: this._addValide.distance
      };

      //let kk =

      this._queryResults.pushObject(row);
      this._dropTableForm();

      // this._queryResults=null;

      // Ember.set(this, '_queryResults', null);
      // Ember.set(this, '_queryResults', this.hh);

      // this.set('_addDirectionValide', false);
      // this.set('_addRhumbValide', false);
      // this.set('_addDistanceValide', false);
    },

    OnRemoveRow(id) {
      for (let i = 0; i < this._queryResults.length; i++) {
        let item = this._queryResults[i];
        if (item.id === id) {
          //delete this._queryResults[i];
          // this._queryResults.splice(i, 1);

          this._queryResults.removeAt(i, 1);

          return;
        }
      }
    }
  },

  _dropForm() {
    this.set('_startPoint', '');
    this.set('_objectType', null);

    this._dropTableForm();

    // this.set('_formValide.startPointValide', false);
    // this.set('_formValide.typeObjectValide', false);

    Object.keys(this._formValide).forEach(v => Ember.set(this, `_formValide[${v}]`, false));

    /*    this.set('_addDirectionValide', false);
       this.set('_addRhumbValide', false);
       this.set('_addDistanceValide', false); */

    this._dropTableValideForm();

    // this.set('_queryResults', null);
  },

  _dropTableValideForm() {
    // this.set('_addValide.directionValide', false);
    // this.set('_addValide.rhumbValide', false);
    // this.set('_addValide.distanceValide', false);

    Object.keys(this._addValide).forEach(v => Ember.set(this, `_addValide[${v}]`, false));

    // this._addValide = _.mapValues(this._addValide, () => false);
  },

  _dropTableForm() {
    // this.set('_dataTable.direction', null);
    // this.set('_dataTable.rhumb', null);
    // this.set('_addValide.distance', null);
    Object.keys(this._dataTable).forEach(v => Ember.set(this, `_dataTable[${v}]`, false));
  },

  _validFloatNumber(str) {
    const regex = /^(([0-9]*[.])?[0-9]+)$/;
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
