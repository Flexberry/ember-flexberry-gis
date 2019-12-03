/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/geometry-add-modes/rhumb';
import { translationMacro as t } from 'ember-i18n';
// import mapModelApi from '../../mixins/flexberry-map-model-api';
import hhh from '../../utils/rhumb-operations';
import www from '../../mixins/flexberry-map-model-api-expansion';

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
let FlexberryGeometryAddModeRhumbComponent = Ember.Component.extend(hhh, www, {
  /**
    Service for managing map API.
    @property mapApi
    @type MapApiService
  */
  mapApi: Ember.inject.service(),
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
    Added coordinates.

    @property _coordinates
    @type String
    @default null
    @private
  */
  _coordinates: null,

  /**
    Flag indicates that entered coordinates has invalid format or is emty.todo:!!!

    @property _startPointValideError
    @type Boolean
    @default false
    @private
  */
  _startPointValideError: false,
  _typeObjectValideError: false,

  _addDirectionValide: false,
  _addRhumbValide: false,
  _addDistanceValide: false,

  _cardinalPoints: ['СВ', 'ЮВ', 'ЮЗ', 'СЗ'],

  _startPoint: '56:454;34:567',

  _queryResults: null,
  hh: null,
  // [
  //   { id: 0, direction: 'ЮВ', rhumb: 86.76787457562546, distance: 8182.6375760837955 },
  //   // { id: 1, direction: 'СВ', rhumb: 79.04259420114585, distance: 8476.868426796427 },
  //   // { id: 2, direction: 'ЮЗ', rhumb: 86.0047147391561, distance: 16532.122718537685 }
  // ],

  _objectTypes: ['Polygon', 'Line'],

  _objectType: null,

  _startPoint: '',

  _direction: null,
  _rhumb: null,
  _distance: null,

  //  menuButtonTooltip: t('components.geometry-add-modes.manual.menu-button-tooltip'),
  menuButtonTooltip: t('components.geometry-add-modes.rhumb.menu-button-tooltip'),

  dialogApproveButtonCaption: t('components.geometry-add-modes.rhumb.dialog-approve-button-caption'),

  dialogDenyButtonCaption: t('components.geometry-add-modes.rhumb.dialog-deny-button-caption'),

  // crsFieldLabel: t('components.geometry-add-modes.rhumb.crs-field-label'),

  //geometryFieldLabel: t('components.geometry-add-modes.rhumb.geometry-field-label'),

  //coordinatesFieldLabel: t('components.geometry-add-modes.rhumb.coordinates-field-label'),

  //coordinatesFieldPlaceholder: t('components.geometry-add-modes.rhumb.coordinates-field-placeholder'),

  startPointFieldLabel: t('components.geometry-add-modes.rhumb.start-point-field-label'),

  typeObjectFieldLabel: t('components.geometry-add-modes.rhumb.type-object-field-label'),

  directionTh: t('components.geometry-add-modes.rhumb.direction-field-label'),

  rhumbTh: t('components.geometry-add-modes.rhumb.rhumb-field-label'),

  distanceTh: t('components.geometry-add-modes.rhumb.distance-field-label'),

  addButtonCaption: t('components.geometry-add-modes.rhumb.add-button-caption'),

  //removeButtonCaption: t('components.geometry-add-modes.rhumb.remove-button-caption'),

  //   /**
  //   Initializes DOM-related component's properties.
  // */
  //   didInsertElement(tabModel) {
  //     this._super(...arguments);

  //     debugger;


  //   },

  actions: {
    /**
      Handles button click.
    */
    onOpenDialog(tabModel) {
      this.set('_dialogHasBeenRequested', true);
      this.set('_dialogVisible', true);

      const rowId = this._getRowId(tabModel);
      const edit = Ember.get(tabModel, `_editedRows.${rowId}`);

      this.set('_objectTypeDisabled', edit);

      if (edit) {
        const layer = Ember.get(tabModel, `featureLink.${rowId}`);
        const geoJSON = layer.toGeoJSON();
        const type = Ember.get(geoJSON, 'geometry.type');

        let coordinates = geoJSON.geometry.coordinates;

        //this.createPolygonObjectRhumb('0f2b3002-1b28-44bd-877f-6c0a917b963f', data);

        //let objectId = Ember.get(layer, 'feature.id');

        //let objectContainingActionHandler = Ember.Object.extend(mapModelApi).create();

        // const mapLayer = this.get('mapLayer')
        // const mapApi = this.get('mapApi');

        // let data = this.getRhumb(mapLayer, mapApi, 'fc26ac89-ccb5-47f5-bd2d-89a5e587f9d3', geoJSON.id);

        // this._startPoint = `${data.StartPoint.lat};${data.StartPoint.lng}`;

        switch (type) {
          case 'Polygon':
            _objectType = 'Polygon';
            break;
          case 'LineString':
            _objectType = 'Line';
            break;
        }

        //   var hh = { direction: 'ЮЗ', rhumb: 86.0047147391561, distance: 16532.122718537685 };//this._queryResults[0];


        this.hh = [
          { id: 0, direction: 'ЮВ', rhumb: 86.76787457562546, distance: 8182.6375760837955 },
          // { id: 1, direction: 'СВ', rhumb: 79.04259420114585, distance: 8476.868426796427 },
          // { id: 2, direction: 'ЮЗ', rhumb: 86.0047147391561, distance: 16532.122718537685 }
        ];

        Ember.set(this, '_queryResults', this.hh);
        // this._queryResults.push(data);

        // const str = this._cootrdinatesToString(coordinates);
        // this.set('_coordinates', str);

        this.set('_objectSelectType', type);
        Ember.set(this, 'menuButtonTooltip', t('components.geometry-add-modes.rhumb.menu-button-tooltip-edit'));
      } else {
        this.set('_startPoint', '');
        this.set('_objectType', null);

        this.set('_direction', null);
        this.set('_rhumb', null);
        this.set('_distance', null);
        Ember.set(this, 'menuButtonTooltip', t('components.geometry-add-modes.manual.menu-button-tooltip'));
      }

    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.approve:method"}}'flexberry-dialog' component's 'approve' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryGeometryAddModeRhumbComponent/sendingActions.complete:method"}}'complete' action{{/crossLink}}.

      @method actions.onApprove
    */
    onApprove(e) {
      let error = false;

      if (Ember.isNone(this._objectType)) {
        this.set('_typeObjectValideError', true);
        error = true;
      } else {
        this.set('_typeObjectValideError', false);
      }

      if (Ember.isBlank(this._startPoint)) {
        this.set('_startPointValideError', true);
        error = true;
      } else {
        const points = this._startPoint.split(';');

        if (points.length !== 2) {
          this.set('_startPointValideError', true);
          error = true;
        } else {
          this.set('_startPointValideError', false);
        }
      }

      if (error) {
        e.closeDialog = false;

        return;
      }

      // create a polygon with provided coordinates
      // let addedLayer = L.polygon(parsedCoordinates);
      // this.set('_coordinates', null);
      //this.set('_startPointValideError', null);

      //this.sendAction('complete', addedLayer, { panToAddedObject: true });
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.deny:method"}}'flexberry-dialog' component's 'deny' action{{/crossLink}}.

      @method actions.onDeny
    */
    onDeny(e) {
      this.set('_startPoint', '');
      this.set('_objectType', null);

      this.set('_direction', null);
      this.set('_rhumb', null);
      this.set('_distance', null);

      this.set('_startPointValideError', false);
      this.set('_typeObjectValideError', false);

      this.set('_addDirectionValide', false);
      this.set('_addRhumbValide', false);
      this.set('_addDistanceValide', false);

      this.set('_queryResults', []);
    },

    onAddRaw() {
      let error = false;

      if (Ember.isNone(this._direction)) {
        this.set('_addDirectionValide', true);
        error = true;
      } else {
        this.set('_addDirectionValide', false);
      }

      if (Ember.isBlank(this._rhumb)) {
        this.set('_addRhumbValide', true);
        error = true;
      } else {
        this.set('_addRhumbValide', false);
      }

      if (Ember.isBlank(this._distance)) {
        this.set('_addDistanceValide', true);
        error = true;
      } else {
        this.set('_addDistanceValide', false);
      }

      if (error) {
        return;
      }

      // let serviceLayer = this.get('mapApi');
      var ww = { id: this.hh.length + 1, direction: 'ЮЗ', rhumb: 86.0047147391561, distance: 16532.122718537685 };

      this.hh.push(ww);

      // this._queryResults=null;

      Ember.set(this, '_queryResults', null);
      Ember.set(this, '_queryResults', this.hh);

      // this.set('_addDirectionValide', false);
      // this.set('_addRhumbValide', false);
      // this.set('_addDistanceValide', false);
    },

    OnRemoveRow(id) {
      for (let i = 0; i < this._queryResults.length; i++) {
        let item = this._queryResults[i];
        if (item.id === id) {
          //delete this._queryResults[i];
          this._queryResults.splice(i, 1);

          return;
        }
      }
    }
  },

  /**
    Get row id.
    @method _getRowId
    @param {Object} tabModel Tab model.
    @returns {string} Row id.
  */
  _getRowId(tabModel) {
    const editedRows = Ember.get(tabModel, '_editedRows');
    const keys = Object.keys(editedRows);

    let rowId;
    if (!Ember.isNone(keys[0])) {
      rowId = keys[0];
    }

    return rowId;
  },

  // /**
  //   Parses coordinates.

  //   @method parseCoordinates
  //   @return {Object} Parsed coordinates if it is valid or null.
  // */
  // parseCoordinates() {
  //   let coordinates = this.get('_coordinates');
  //   let result = null;

  //   if (Ember.isNone(coordinates)) {
  //     this.set('_coordinatesWithError', true);
  //   } else {
  //     let lines = coordinates.split('\n');
  //     lines.forEach((line) => {
  //       let check = line.match(/(.*) (.*)/);
  //       if (!check) {
  //         this.set('_coordinatesWithError', true);
  //         return null;
  //       }

  //       result = result || [];
  //       result.push([check[1], check[2]]);
  //     });
  //   }

  //   if (!Ember.isNone(result)) {
  //     this.set('_dialogRhumbVisible', true);
  //   }

  //   return result;
  // },

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
