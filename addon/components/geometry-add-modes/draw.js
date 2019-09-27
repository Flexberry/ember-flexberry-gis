/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/geometry-add-modes/draw';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-geometry-add-mode-draw').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-geometry-add-mode-draw').
  @readonly
  @static

  @for FlexberryGeometryAddModeDrawComponent
*/
const flexberryClassNamesPrefix = 'flexberry-geometry-add-mode-draw';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix
};

let FlexberryGeometryAddModeDrawComponent = Ember.Component.extend({
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
    Component's wrapping <div> CSS-classes names.

    @property classNames
    @type String[]
  */
  classNames: ['draw', flexberryClassNames.wrapper],

  /**
   * Component settings.
   */
  settings: null,

  actions: {
    /**
      Handles click on available geometry type.

      @param {String} geometryType Selected geometry type.
    */
    onGeometryTypeSelect(geometryType) {
      this.sendAction('drawStart', geometryType);
      let editTools = this._getEditTools();
      Ember.set(this.get('leafletMap'), 'drawTools', editTools);

      this.set('geometryType', geometryType);

      // let that = { component: this, tabModel: tabModel };
      editTools.on('editable:drawing:end', this._disableDraw, this);
      this.get('leafletMap').fire('flexberry-map:switchToDefaultMapTool');
      this.$().closest('body').on('keydown', ((e) => {
        // Esc was pressed
        if (e.which === 27) {
          this._disableDraw();
        }
      }));

      // TODO add event listener on mapTool.enable event - to disable drawing tool when user click on any map tool.

      switch (geometryType) {
        case 'marker':
          editTools.startMarker();
          break;
        case 'polyline':
          editTools.startPolyline();
          break;
        case 'circle':
          editTools.startCircle();
          break;
        case 'rectangle':
          editTools.startRectangle();
          break;
        case 'polygon':
          editTools.startPolygon();
          break;
        case 'multyPolygon':
          editTools.startPolygon();
          break;
        case 'multyLine':
          editTools.startPolyline();
          break;
      }
    },
  },

  _getEditTools() {
    let leafletMap = this.get('leafletMap');

    let editTools = this.get('_editTools');
    if (Ember.isNone(editTools)) {
      editTools = new L.Editable(leafletMap);
      this.set('_editTools', editTools);
    }

    return editTools;
  },

  /**
    Finishing a layer editing operation.

    @param {Object} e Transmitted data.
  */
  _disableDraw(e) {
    let editTools = this.get('_editTools');

    this.$().closest('body').off('keydown');
    if (!Ember.isNone(editTools)) {
      editTools.off('editable:drawing:end', this._disableDraw, this);
      editTools.stopDrawing();
    }

    if (!Ember.isNone(e)) {
      let geometryType = this.get('geometryType');

      if (geometryType !== 'multyPolygon' && geometryType !== 'multyLine') {
        let addedLayer = e.layer;
        this.sendAction('complete', addedLayer);
      } else {
        let leafletMap = this.get('leafletMap');

        var drawnItems = new L.FeatureGroup();
        leafletMap.addLayer(drawnItems);

        let coorsList = [];

        // Define editable objects
        leafletMap.eachLayer(function (layer) {
          let enabled = Ember.get(layer, 'editor._enabled');
          if (enabled === true) {
            var layerGeoJson = layer.toGeoJSON();
            let coordinates = layerGeoJson.geometry.coordinates;

            Ember.set(layer, 'multyShape', true);

            if (layer instanceof L.Polygon) {
              coorsList = this._getPolygonCoords(coorsList, coordinates);
            } else if (layer instanceof L.Polyline) {
              coorsList = this._getPolylineCoords(coorsList, coordinates);
            }

            leafletMap.removeLayer(layer);
          }
        }.bind(this));

        let styleSettings = this.tabModel.get('styleSettings');
        let shape = {};
        if (geometryType === 'multyPolygon') {
          shape = L.polygon(coorsList, {
            color: styleSettings.style.path.color,
            weight: styleSettings.style.path.weight,
            fillColor: styleSettings.style.path.fillColor
          });
        } else if (geometryType === 'multyLine') {
          shape = L.polyline(coorsList, {
            color: styleSettings.style.path.color,
            weight: styleSettings.style.path.weight
          });
        }

        let layerId = Ember.get(this.tabModel, 'layerId');
        let layer = Ember.get(this.tabModel, `featureLink.${layerId}`);
        var geoJson = layer.toGeoJSON();

        Ember.set(shape, 'feature', {
          type: 'Feature',
          properties: geoJson.properties,
          leafletLayer: shape
        });

        let id = Ember.get(layer.feature, 'id');
        if (!Ember.isNone(id)) {
          Ember.set(shape.feature, 'id', id);
          Ember.set(shape.feature, 'geometry_name', layer.feature.geometry_name);

          Ember.set(shape.feature, 'geometry', {
            coordinates: this._swapСoordinates(coorsList)
          });

          let geoType = Ember.get(layer.feature, 'geometry.type');
          if (!Ember.isNone(geoType)) {
            Ember.set(shape.feature.geometry, 'type', geoType);
          }
        }

        // Create a multiple shape
        shape.addTo(leafletMap);

        // Linking shapes
        Ember.set(shape, 'multyShape', true);
        Ember.set(shape, 'mainMultyShape', true);

        shape.enableEdit();

        // We note that the shape was edited
        this.tabModel.leafletObject.editLayer(shape);

        // Replace with a new shape
        Ember.set(this.tabModel, `featureLink.${layerId}`, shape);

        // From the list of changed shapes, delete individual ones, leaving only the multiple shape.
        this._removeFromModified(this.tabModel.leafletObject.changes);

        // enable save button
        Ember.set(this.tabModel, 'leafletObject._wasChanged', true);
      }
    }
  },

  /**
    From the list of changed shapes, delete individual ones, leaving only the multiple shape.

    @param {array} changes Array of modified shapes.
  */
  _removeFromModified(changes) {
    let state = 0;
    let changeNumber = null;

    for (let changeLayerNumber in changes) {
      state = Ember.get(changes[changeLayerNumber], 'state') === 'insertElement' ? state + 1 : state;

      let multyShape = Ember.get(changes[changeLayerNumber], 'multyShape') === true;
      let mainMultyShape = Ember.get(changes[changeLayerNumber], 'mainMultyShape') === true;

      if (multyShape === true) {
        if (mainMultyShape === false) {
          delete changes[changeLayerNumber];
        } else if (mainMultyShape === true) {
          changeNumber = changeLayerNumber;
          delete changes[changeLayerNumber].multyShape;
          delete changes[changeLayerNumber].mainMultyShape;
        }
      }
    }

    if (state > 0) {
      Ember.set(changes[changeNumber], 'state', 'insertElement');
    }
  },

  /**
    Building a multiple polygon.

    @param {array} coorsList Accumulating array of coordinates.
    @param {array} coordinates Array of coordinates.
    @returns {array} accumulating array of coordinates.
  */
  _getPolygonCoords(coorsList, coordinates) {
    for (let i = 0; i < coordinates.length; i++) {
      let coors = coordinates[i];
      let corArrI = [];

      if (!Ember.isNone(coordinates[0][0][0][0])) {
        for (let j = 0; j < coors.length; j++) {
          let coordinat = coors[j];
          let corArrJ = [];

          for (let k = 0; k < coordinat.length; k++) {
            corArrJ.push([coordinat[k][1], coordinat[k][0]]);
          }

          coorsList.push(corArrJ);
        }
      } else if (!Ember.isNone(coordinates[0][0][0])) {
        for (let j = 0; j < coors.length; j++) {
          corArrI.push([coors[j][1], coors[j][0]]);
        }

        coorsList.push(corArrI);
      }
    }

    return coorsList;
  },

  /**
    Building a multiple polyline.

    @param {array} coorsList Accumulating array of coordinates.
    @param {array} coordinates Array of coordinates.
    @returns {array} accumulating array of coordinates.
  */
  _getPolylineCoords(coorsList, coordinates) {
    let corArr = [];

    if (!Ember.isNone(coordinates[0][0][0])) {
      for (let i = 0; i < coordinates.length; i++) {
        let coordinat = coordinates[i];
        let corArrI = [];

        for (let j = 0; j < coordinat.length; j++) {
          corArrI.push([coordinat[j][1], coordinat[j][0]]);
        }

        coorsList.push(corArrI);
      }
    } else if (!Ember.isNone(coordinates[0][0])) {
      for (let i = 0; i < coordinates.length; i++) {
        corArr.push([coordinates[i][1], coordinates[i][0]]);
      }

      coorsList.push(corArr);
    }

    return coorsList;
  },

  /**
    Swap coordinates.

    @param {array} coordinates Array of coordinates.
    @returns {array} inverse array of coordinates.
  */
  _swapСoordinates(coordinates) {
    if (!Ember.isNone(coordinates[0][0][0][0])) {
      for (let i = 0; i < coordinates.length; i++) {
        let coordinatI = coordinates[i];

        for (let j = 0; j < coordinatI.length; j++) {
          let coordinatJ = coordinatI[i];

          for (let k = 0; k < coordinatJ.length; k++) {
            let b = coordinatJ[k][0];
            coordinatJ[k][0] = coordinatJ[k][1];
            coordinatJ[k][1] = b;
          }
        }
      }
    } else if (!Ember.isNone(coordinates[0][0][0])) {
      for (let i = 0; i < coordinates.length; i++) {
        let coordinat = coordinates[i];

        for (let j = 0; j < coordinat.length; j++) {
          let b = coordinat[j][0];
          coordinat[j][0] = coordinat[j][1];
          coordinat[j][1] = b;
        }
      }
    } else if (!Ember.isNone(coordinates[0][0])) {
      for (let i = 0; i < coordinates.length; i++) {
        let b = coordinates[i][0];
        coordinates[i][0] = coordinates[i][1];
        coordinates[i][1] = b;
      }
    }

    return coordinates;
  },

  /**
    Component's action invoking when new geometry was added.

    @method sendingActions.complete
    @param {Object} addedLayer Added layer.
  */
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryGeometryAddModeDrawComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryGeometryAddModeDrawComponent;
