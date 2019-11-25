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

  //#region Properties
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

  /**
    Flag to disable object type selection.

    @property _objectTypeDisabled
    @type Boolean
    @default true
    @private
  */
  _objectTypeDisabled: true,

  /**
    Object type selection error flag.

    @property _geometryField
    @type Boolean
    @default false
    @private
  */
  _geometryField: false,

  //_types: ['Point', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'], todo:remove
  /**
    Object types.

    @property _geometryField
    @type string[]
    @default ['Point', 'LineString', 'Polygon']
    @readonly
    @private
  */
  _types: ['Point', 'LineString', 'Polygon'],

  menuButtonTooltip: t('components.geometry-add-modes.manual.menu-button-tooltip'),

  dialogApproveButtonCaption: t('components.geometry-add-modes.manual.dialog-approve-button-caption'),

  dialogDenyButtonCaption: t('components.geometry-add-modes.manual.dialog-deny-button-caption'),

  crsFieldLabel: t('components.geometry-add-modes.manual.crs-field-label'),

  geometryFieldLabel: t('components.geometry-add-modes.manual.geometry-field-label'),

  coordinatesFieldLabel: t('components.geometry-add-modes.manual.coordinates-field-label'),

  coordinatesFieldPlaceholder: t('components.geometry-add-modes.manual.coordinates-field-placeholder'),

  //#endregion

  actions: {
    /**
      Handles button click.

      @method actions.onButtonClick
      @param {Object} tabModel Tab model.s
    */
    onButtonClick(tabModel) {
      this.set('_dialogHasBeenRequested', true);
      this.set('_dialogVisible', true);

      const rowId = this._getRowId(tabModel);
      const edit = Ember.get(tabModel, `_editedRows.${rowId}`);

      this.set('_objectTypeDisabled', edit);

      if (edit) {
        //this.menuButtonTooltip = t('components.geometry-add-modes.manual.menu-button-tooltip-edit');//todo: does not work
        var layer = Ember.get(tabModel, `featureLink.${rowId}`);

        //let coordinates = layer.feature.geometry.coordinates; //todo: хз что правильнее.
        const geoJSON = layer.toGeoJSON();
        let coordinates = geoJSON.geometry.coordinates;
        // let coordinates = layer._latlngs;

        let str = this._cootrdinatesToString(coordinates);
        this.set('_coordinates', str);

        const getType = (type) => {
          switch (type) {
            case 'MultiLineString':
              return 'LineString';
            case 'MultiPolygon':
              return 'Polygon';
            default: return type;
          }
        }

        this.set('_objectType', getType(geoJSON.geometry.type));
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
        this.set('_geometryField', true);
      }
      else {
        this.set('_geometryField', false);
      }

      const coordinates = this.get('_coordinates');
      if (Ember.isEmpty(coordinates)) {
        error = true
        this.set('_coordinatesWithError', true);
      }
      else {
        this.set('_coordinatesWithError', false);
      }

      if (error) {
        e.closeDialog = false;
        return;
      }

      const rowId = this._getRowId(tabModel);
      const edit = Ember.get(tabModel, `_editedRows.${rowId}`);

      const parsedCoordinates = this._parseStringToCoordinates(coordinates);

      if (Ember.isNone(parsedCoordinates) || parsedCoordinates.length === 0) {

        // Prevent dialog from being closed.
        e.closeDialog = false;
        this.set('_coordinatesWithError', true);

        return;
      }

      const hasMinCountPoint = (items, n) => {
        for (let i = 0; i < items.length; i++) {
          if (items[i].length < n) {
            return false;
          }
        }

        return true;
      };

      let layer = Ember.get(tabModel, `featureLink.${rowId}`);
  let leafletMap = this.get('leafletMap');

      switch (objectType) {
        case 'Point':

          // Only one point.
          if (parsedCoordinates.length > 1 || (parsedCoordinates.length === 1 && parsedCoordinates[0].length > 1)) {
            e.closeDialog = false;
            this.set('_coordinatesWithError', true);

            return;
          }

          if (edit) {



            //const editLayer = L.point(parsedCoordinates[0], parsedCoordinates[1]);

            //let geoJson = layer.toGeoJSON();
            // let addedLayers = Ember.get(tabModel, '_addedLayers') || {};
            // addedLayers[Ember.guidFor(geoJson)] = geoJson;

            let feature = layer.feature;
            feature.geometry.coordinates = parsedCoordinates[0][0];//parsedCoordinates;

            Ember.set(layer, 'feature', feature);

            //todo: возможно есть более правильный вариант
            layer._latlng = { lat: parsedCoordinates[0][0][1], lng: parsedCoordinates[0][0][0] }



            //let id = layer.feature.id;

            // let object = Object.values(tabModel.leafletObject._layers).find(shape => {
            //   return Ember.get(shape, 'feature.id') === id;
            // });

            leafletMap.removeLayer(layer);
            leafletMap.addLayer(layer);

            // var corner1 = L.latLng(layer.feature.geometry.coordinates)

            // leafletMap.fitBounds(corner1);

            //this.send('zoomTo', [layer.feature]);
            //this.send('onClearFoundItemClick');

            // if (object) {
            //   if (visibility) {
            //     leafletMap.addLayer(object);
            //   } else {
            //     leafletMap.removeLayer(object);
            //   }
            // }



            //leafletMap.addLayer(layer);
            tabModel.leafletObject.editLayer(layer);
            Ember.set(tabModel, 'leafletObject._wasChanged', true);
            //Ember.set(tabModel, '_addedLayers', addedLayers);
          } else {
            //const addedLayer = L.point(parsedCoordinates[0][0][0], parsedCoordinates[0][0][1]);
            const addedLayer = L.point(parsedCoordinates[0][0]);
            this.sendAction('complete', addedLayer, { panToAddedObject: true });
          }
          break;
        case 'LineString':
        case 'MultiLineString':
          if (!hasMinCountPoint(parsedCoordinates, 2)) {
            e.closeDialog = false;
            this.set('_coordinatesWithError', true);

            return;
          }

          if (edit) {
            Ember.set(layer, 'feature.geometry.coordinates', parsedCoordinates);

            var latLngCoors = [];
            for (let i = 0; i < parsedCoordinates.length; i++) {
              let mas = [];
              for (let j = 0; j < parsedCoordinates[i].length; j++) {
                mas.push(L.latLng(parsedCoordinates[i][j][1], parsedCoordinates[i][j][0]));
              }

              latLngCoors.push(mas);
            }

            layer._latlngs = latLngCoors;

            leafletMap.removeLayer(layer);
            leafletMap.addLayer(layer);


            tabModel.leafletObject.editLayer(layer);
            Ember.set(tabModel, 'leafletObject._wasChanged', true);
          } else {
            const addedLayer = L.polyline(parsedCoordinates);
            this.sendAction('complete', addedLayer, { panToAddedObject: true });
          }

          break;
        case 'Polygon':
        case 'MultiPolygon':
          if (!hasMinCountPoint(parsedCoordinates, 3)) {
            e.closeDialog = false;
            this.set('_coordinatesWithError', true);

            return;
          }

          if (edit) {


            var latLngCoors1 = [];
            var coors = [];
            for (let i = 0; i < parsedCoordinates.length; i++) {
              let masLatLng = [];
              let mas = [];
              for (let j = 0; j < parsedCoordinates[i].length; j++) {
                masLatLng.push(L.latLng(parsedCoordinates[i][j][1], parsedCoordinates[i][j][0]));
                mas.push(parsedCoordinates[i][j]);
              }

              latLngCoors1.push([masLatLng]);
              coors.push([mas]);
            }

            Ember.set(layer, 'feature.geometry.coordinates', coors);
            layer._latlngs = latLngCoors1;

            leafletMap.removeLayer(layer);
            leafletMap.addLayer(layer);


            tabModel.leafletObject.editLayer(layer);
            Ember.set(tabModel, 'leafletObject._wasChanged', true);
          } else {
            const addedLayer = L.polygon(parsedCoordinates);
            this.sendAction('complete', addedLayer, { panToAddedObject: true });
          }

          break;
      }

      this.set('_coordinates', null);
      this.set('_coordinatesWithError', null);
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

  /**
    Get an array of coordinates from a coordinate line.

    @method _parseCoordinates
    @param {string} coordinates A string with the coordinates.
    @returns {string[]} Array of coordinates of type [[["55.472379","58.733686"]],[["55.472336","58.733789"]]].
  */
  _parseStringToCoordinates(coordinates) {
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

  /**
    Get coordinate line.

    @method _cootrdinatesToString
    @param {Object[]} coordinates Coordinates.
  */
  _cootrdinatesToString(coordinates) {
    const countDimensions = (value) => {
      return Array.isArray(value) ? 1 + Math.max(...value.map(countDimensions)) : 0;
    };

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
        break;
      default:
        throw new Error('Coordinate array error.');
    }

    let result = '';
    coors.forEach(item => result += item !== null ? `${item[0]} ${item[1]} \n` : '\n');
    //coors.forEach(item => str += item !== null ? `${item.lat} ${item.lng} \n` : '\n');

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
