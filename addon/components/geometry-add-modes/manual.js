/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/geometry-add-modes/manual';
import { translationMacro as t } from 'ember-i18n';

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

let FlexberryGeometryAddModeManualComponent = Ember.Component.extend({
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
    Flag indicates whether manual geometry adding dialog has been already requested by user or not.

    @property _dialogHasBeenRequested
    @type Boolean
    @default false
    @private
  */
  _dialogHasBeenRequested: false,

  /**
    Flag indicates whether to show manual geometry adding dialog.

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
    Flag indicates that entered coordinates has invalid format or is emty.

    @property _coordinatesWithError
    @type Boolean
    @default false
    @private
  */
  _coordinatesWithError: false,

  menuButtonTooltip: t('components.geometry-add-modes.manual.menu-button-tooltip'),

  dialogApproveButtonCaption: t('components.geometry-add-modes.manual.dialog-approve-button-caption'),

  dialogDenyButtonCaption: t('components.geometry-add-modes.manual.dialog-deny-button-caption'),

  crsFieldLabel: t('components.geometry-add-modes.manual.crs-field-label'),

  geometryFieldLabel: t('components.geometry-add-modes.manual.geometry-field-label'),

  coordinatesFieldLabel: t('components.geometry-add-modes.manual.coordinates-field-label'),

  coordinatesFieldPlaceholder: t('components.geometry-add-modes.manual.coordinates-field-placeholder'),

  _types: ['Point', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'],

  actions: {
    /**
      Handles button click.

      @method actions.onButtonClick
      @param {Object} tabModel Tab model.s
    */
    onButtonClick(tabModel) {
      this.set('_dialogHasBeenRequested', true);
      this.set('_dialogVisible', true);

      const editedRows = Ember.get(tabModel, '_editedRows');
      const keys = Object.keys(editedRows);

      let edit = false;
      let rowId;
      if (!Ember.isNone(keys[0])) {
        rowId = keys[0];
        edit = Ember.get(tabModel, `_editedRows.${rowId}`);
      }

      if (edit) {
        //this.menuButtonTooltip = t('components.geometry-add-modes.manual.menu-button-tooltip-edit');//todo: does not work

        const countDimensions = (value) => {
          return Array.isArray(value) ? 1 + Math.max(...value.map(countDimensions)) : 0;
        };

        var layer = Ember.get(tabModel, `featureLink.${rowId}`);

        //let coordinates = layer.feature.geometry.coordinates; //todo: хз что правильнее.
        const geoJSON = layer.toGeoJSON();
        let coordinates = geoJSON.geometry.coordinates;
        // let coordinates = layer._latlngs;

        // Get array depth.
        const arrLength = countDimensions(coordinates);

        let coors = [];
       // let objectType = geoJSON.geometry.type;
        switch (arrLength) {
          case 1: // Point.
            coors.push(coordinates);
           // objectType = 'Point';
            break;
          case 3: // LineString and MultiLineString.
            for (let i = 0; i < coordinates.length; i++) {
              for (let j = 0; j < coordinates[i].length; j++) {
                let item = coordinates[i][j];
                coors.push(item);
              }

              if (i !== coordinates.length - 1) {
                coors.push(null);
              }
            }
            //objectType = 'LineString'; //todo: MultiLineString
            break;
          case 4: // Polygon and MultiPolygon.
            for (let i = 0; i < coordinates.length; i++) {
              for (let j = 0; j < coordinates[i].length; j++) {
                for (let k = 0; k < coordinates[i][j].length; k++) {
                  let item = coordinates[i][j][k];
                  coors.push(item);
                }
              }

              if (i !== coordinates.length - 1) {
                coors.push(null);
              }
            }
            // = 'Polygon'; //todo: MultiPolygon
            break;
          default:
            throw new Error('Coordinate array error.');
        }

        let str = '';
        coors.forEach(item => str += item !== null ? `${item[0]} ${item[1]} \n` : '\n');
        //coors.forEach(item => str += item !== null ? `${item.lat} ${item.lng} \n` : '\n');

        this.set('_coordinates', str);
        this.set('_objectType', geoJSON.geometry.type);
      }
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.approve:method"}}'flexberry-dialog' component's 'approve' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryGeometryAddModeManualComponent/sendingActions.complete:method"}}'complete' action{{/crossLink}}.

      @method actions.onApprove
      @param {Object} e Object event.
    */
    onApprove(e, tabModel) {
      const objectType = this.get('_objectType');

      const editedRows = Ember.get(tabModel, '_editedRows');
      const keys = Object.keys(editedRows);

      let edit = false;
      let rowId;
      if (!Ember.isNone(keys[0])) {
        rowId = keys[0];
        edit = Ember.get(tabModel, `_editedRows.${rowId}`);
      }

      if (edit) {
        switch (objectType) {
          case 'Point':

            const parsedCoordinates = this._parsePointCoordinates();
            if (Ember.isNone(parsedCoordinates)) {

              // Prevent dialog from being closed.
              e.closeDialog = false;

              return;
            }

            // Edit a point with provided coordinates.
            const addedLayer = L.point(200, 300); //L.polygon(parsedCoordinates);
            this.set('_coordinates', null);
            this.set('_coordinatesWithError', null);


            break;
          case 'LineString': break;
          case 'Polygon': break;
        }

      } else {
        const parsedCoordinates = this.parseCoordinates();
        if (Ember.isNone(parsedCoordinates)) {

          // Prevent dialog from being closed.
          e.closeDialog = false;

          return;
        }

        // create a polygon with provided coordinates
        const addedLayer = L.polygon(parsedCoordinates);
        this.set('_coordinates', null);
        this.set('_coordinatesWithError', null);

        this.sendAction('complete', addedLayer, { panToAddedObject: true });//todo: Не забыть включить

      }


    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.deny:method"}}'flexberry-dialog' component's 'deny' action{{/crossLink}}.

      @method actions.onDeny
      @param {Object} e Object event.
    */
    onDeny(e) {
      this.set('_coordinates', null);
      this.set('_coordinatesWithError', null);
    }
  },

  // _parsePointCoordinates(coordinates) {
  //   let coordinates = this.get('_coordinates');
  //   let result = null;

  //   if (Ember.isNone(coordinates)) {
  //     this.set('_coordinatesWithError', true);
  //   } else {
  //     let lines = coordinates.split('\n');
  //     lines.forEach((line) => {
  //       const check = line.match(/(.*) (.*)/);
  //       if (!check) {
  //         this.set('_coordinatesWithError', true);
  //         return null;
  //       }

  //       result = result || [];
  //       result.push([check[1], check[2]]);
  //     });
  //   }

  //   if (!Ember.isNone(result)) {
  //     this.set('_coordinatesWithError', false);
  //   }

  //   return result;
  // },

  /**
    Parses coordinates.

    @method parseCoordinates
    @return {Object} Parsed coordinates if it is valid or null.
  */
  parseCoordinates() {
    let coordinates = this.get('_coordinates');
    let result = null;

    if (Ember.isNone(coordinates)) {
      this.set('_coordinatesWithError', true);
    } else {
      let lines = coordinates.split('\n');
      lines.forEach((line) => {
        let check = line.match(/(.*) (.*)/);
        if (!check) {
          this.set('_coordinatesWithError', true);
          return null;
        }

        result = result || [];
        result.push([check[1], check[2]]);
      });
    }

    if (!Ember.isNone(result)) {
      this.set('_coordinatesWithError', false);
    }

    return result;
  },

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
FlexberryGeometryAddModeManualComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryGeometryAddModeManualComponent;
