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

  _objectTypeDisabled: true,

  _geometryField: false,

  //_types: ['Point', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'],
  _types: ['Point', 'LineString', 'Polygon'],

  menuButtonTooltip: t('components.geometry-add-modes.manual.menu-button-tooltip'),

  dialogApproveButtonCaption: t('components.geometry-add-modes.manual.dialog-approve-button-caption'),

  dialogDenyButtonCaption: t('components.geometry-add-modes.manual.dialog-deny-button-caption'),

  crsFieldLabel: t('components.geometry-add-modes.manual.crs-field-label'),

  geometryFieldLabel: t('components.geometry-add-modes.manual.geometry-field-label'),

  coordinatesFieldLabel: t('components.geometry-add-modes.manual.coordinates-field-label'),

  coordinatesFieldPlaceholder: t('components.geometry-add-modes.manual.coordinates-field-placeholder'),

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

      this.set('_objectTypeDisabled', edit);

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
        switch (arrLength) {
          case 1: // Point.
            coors.push(coordinates);
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
      } else {
        this.set('_coordinates', '');
      }
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.approve:method"}}'flexberry-dialog' component's 'approve' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryGeometryAddModeManualComponent/sendingActions.complete:method"}}'complete' action{{/crossLink}}.

      @method actions.onApprove
      @param {Object} tabModel Tab model.
      @param {Object} e Object event.
    */
    onApprove(tabModel, e) {
      let objectType = this.get('_objectType');

      let error = false;
      if (Ember.isNone(objectType)) {
        error = true
        // e.closeDialog = false;
        this.set('_geometryField', true);
        // return;
      }
      else {
        this.set('_geometryField', false);
      }

      const coordinates = this.get('_coordinates');

      if (Ember.isEmpty(coordinates)) {
        error = true
        // e.closeDialog = false;
        this.set('_coordinatesWithError', true);
        // return;
      }
      else {
        this.set('_coordinatesWithError', false);
      }

      if (error) {
        e.closeDialog = false;
        return;
      }

      const editedRows = Ember.get(tabModel, '_editedRows');
      const keys = Object.keys(editedRows);

      let edit = false;
      let rowId;
      if (!Ember.isNone(keys[0])) {
        rowId = keys[0];
        edit = Ember.get(tabModel, `_editedRows.${rowId}`);
      }

      // if (Ember.isNone(objectType)) {
      //   let layer = Ember.get(tabModel, `featureLink.${rowId}`);
      //   const geoJSON = layer.toGeoJSON();
      //   objectType = geoJSON.geometry.type
      // }


      // if (edit) {
      switch (objectType) {
        case 'Point':
          const parsedCoordinates = this._parsePointCoordinates(coordinates);
          if (Ember.isNone(parsedCoordinates)) {

            // Prevent dialog from being closed.
            e.closeDialog = false;
            this.set('_coordinatesWithError', true);

            return;
          }

          if (edit) {
            let layer = Ember.get(tabModel, `featureLink.${rowId}`);
            let leafletMap = this.get('leafletMap');

            //const editLayer = L.point(parsedCoordinates[0], parsedCoordinates[1]);

            //let geoJson = layer.toGeoJSON();
            // let addedLayers = Ember.get(tabModel, '_addedLayers') || {};
            // addedLayers[Ember.guidFor(geoJson)] = geoJson;

            Ember.set(layer, 'feature.geometry.coordinates', parsedCoordinates);// do not work

            leafletMap.addLayer(layer);
            //Ember.set(tabModel, '_addedLayers', addedLayers);
          } else {
            const addedLayer = L.point(parsedCoordinates[0], parsedCoordinates[1]);
            this.sendAction('complete', addedLayer, { panToAddedObject: true });
          }

          this.set('_coordinates', null);
          this.set('_coordinatesWithError', null);
          break;
        case 'LineString':
          const parsedCoordinates0 = this._parseCoordinates(coordinates);
          if (Ember.isNone(parsedCoordinates0)) {

            // Prevent dialog from being closed.
            e.closeDialog = false;
            this.set('_coordinatesWithError', true);

            return;
          }

          if (edit) {
            //todo:!!!1
          } else {
            const addedLayer = L.polyline(parsedCoordinates0);
            this.sendAction('complete', addedLayer, { panToAddedObject: true });
          }

          break;
        // case 'MultiLineString': break;
        // case 'MultiPolygon': break;
        case 'Polygon':

          const parsedCoordinates1 = this._parseMultyCoordinates(coordinates);
          if (Ember.isNone(parsedCoordinates1)) {

            // Prevent dialog from being closed.
            e.closeDialog = false;
            this.set('_coordinatesWithError', true);

            return;
          }

          if (edit) {
            //todo:!!!1
          } else {
            const addedLayer = L.polygon(parsedCoordinates1);
            this.sendAction('complete', addedLayer, { panToAddedObject: true });
          }

          break;
      }

      // } else {
      //   const parsedCoordinates = this.parseCoordinates();
      //   if (Ember.isNone(parsedCoordinates)) {

      //     // Prevent dialog from being closed.
      //     e.closeDialog = false;

      //     return;
      //   }

      //   // create a polygon with provided coordinates
      //   const addedLayer = L.polygon(parsedCoordinates);
      //   this.set('_coordinates', null);
      //   this.set('_coordinatesWithError', null);

      //   this.sendAction('complete', addedLayer, { panToAddedObject: true });//todo: Не забыть включить

      // }


    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.deny:method"}}'flexberry-dialog' component's 'deny' action{{/crossLink}}.

      @method actions.onDeny
      @param {Object} e Object event.
    */
    onDeny(e) {
      this.set('_coordinates', null);
      this.set('_coordinatesWithError', null);
      this.set('_geometryField', false);
      this.set('_objectTypeDisabled', true);
    }
  },

  _parsePointCoordinates(coordinates) {
    if (Ember.isNone(coordinates)) {
      //this.set('_coordinatesWithError', true);
      return null;
    }

    let result = [];
    const regex = /^([0-9]+[.][0-9]+) ([0-9]+[.][0-9]+)/gm;

    let m;
    let i = 0;
    while ((m = regex.exec(coordinates)) !== null) {
      if (i >= 1) {
        this.set('_coordinatesWithError', true);
        return null;
      }

      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      result.push([m[1], m[2]]);
      i++;
    }

    return result.length > 0 ? result : null;
  },

  _parseCoordinates(coordinates) {
    let result = [];

    if (Ember.isNone(coordinates)) {
      return null;
    }

    const regex = /^([0-9]+[.][0-9]+) ([0-9]+[.][0-9]+)/gm;

    let m;
    while ((m = regex.exec(coordinates)) !== null) {

      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      result.push([m[1], m[2]]);
    }

    return result.length > 0 ? result : null;
  },

  _parseMultyCoordinates(coordinates) {
    if (Ember.isNone(coordinates)) {
      return null;
    }

    const regex = /^([0-9]+[.][0-9]+) ([0-9]+[.][0-9]+)/gm;
    let lines = coordinates.split('\n');
    let result = [];

    let k = 0;
    for (let i = 0; i < lines.length; i++) {
      lines[i] = lines[i].trim();
      if (lines[i] === '' || i === lines.length - 1) {

        let items;

        if (k == 0) {
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

            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
              regex.lastIndex++;
            }

            mas.push([m[1], m[2]]);
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

  _getLayer() {

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
  //     this.set('_coordinatesWithError', false);
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
FlexberryGeometryAddModeManualComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryGeometryAddModeManualComponent;
