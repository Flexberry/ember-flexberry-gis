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

    ontest() {
      let leafletMap = this.get('leafletMap');

    // var nc = [
    //       [56.344929, 57.993337],
    //       [56.345358, 57.992154],
    //       [56.346903, 57.993018],
    //       [56.344929, 57.993337]
    //     ];

    //     var multipolygon = L.polygon(nc);

    //     multipolygon.addTo(leafletMap);

    var nc = [[
      [56.340, 57.920],
      [56.350, 57.930],
      [56.360, 57.940]],
      [[56.380, 57.950],
        [56.390, 57.960],
        [56.400, 57.970
        ]]
      //[56.344929, 57.993337]
    ];

    var multipolygon = L.polyline(nc);

    multipolygon.addTo(leafletMap);
    },
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
        case 'partPolygon':
          editTools.startPolygon();
          break;
        case 'partLine':
          editTools.startPolyline();
          break;
        // case 'ring': // todo: shape ring
        //   editTools.startPolygon();
        //   break;
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

  _disableDraw(e) {
    let editTools = this.get('_editTools');

    this.$().closest('body').off('keydown');

    if (!Ember.isNone(editTools)) {
      editTools.off('editable:drawing:end', this._disableDraw, this);
      editTools.stopDrawing();
    }

    if (!Ember.isNone(e)) {
      let geometryType = this.get('geometryType');

      if (geometryType !== 'partPolygon' && geometryType !== 'partLine') {
        let addedLayer = e.layer;
        this.sendAction('complete', addedLayer);
      } else {
        // let layer = Ember.get(tabModel, `featureLink.${rowId}`);
        let leafletMap = this.get('leafletMap');

        // Check if layer is a marker
        // if (layer instanceof L.Polygon) {
            // Create GeoJSON object from marker

        var drawnItems = new L.FeatureGroup();
        //   drawnItems.nid=255;
        leafletMap.addLayer(drawnItems);

          // let layersStyle = this.get('layersStylesRenderer');
           let styleSettings = this.tabModel.get('styleSettings');

        let coorsList = [];
        debugger;

        // var defaultOptions;
        let hh;
var c=0;
var d=0;
        var _this = this;//todo:!!!
        leafletMap.eachLayer(function (layer) {
          if (layer.editor !== undefined && layer.editor._enabled === true) {
            var layerGeoJson = layer.toGeoJSON();
            let coordinates = layerGeoJson.geometry.coordinates;

            if (layer instanceof L.Polygon) {
              coorsList = _this._getPolygonCoords(coorsList, coordinates);
            } else if (layer instanceof L.Polyline){
              coorsList = _this._getPolylineCoords(coorsList, coordinates);
            //  coorsList2 = _this._getPolylineCoords2(coorsList2, coordinates);
              // if(layer.feature !== undefined) {
              //  hh = layer._leaflet_id;// !== undefined && layer.feature.id !== undefined
              // }
            }

            // if(layer.feature === undefined) {
            //   leafletMap.removeLayer(layer);
            // }

            // if(layer.defaultOptions !== undefined)
            // {
            // defaultOptions = layer.defaultOptions;
            // }
            leafletMap.removeLayer(layer);
            d++;
          }
        // }
        //  layersStyle.renderOnLeafletLayer({ leafletLayer: layer, styleSettings: styleSettings });
        c++;
        });

        // leafletMap.eachLayer(function (layer) {
        //   if (layer._leaflet_id === hh){
        //     layer._latlngs = coorsList;
        //   }

        // });
/**/
        let shape = {};
        if (geometryType === 'partPolygon') {
          shape = L.polygon(coorsList, {
            color: styleSettings.style.path.color,
             weight : styleSettings.style.path.weight,
             fillColor : styleSettings.style.path.fillColor
            });
        } else if (geometryType === 'partLine') {
          shape = L.polyline(coorsList, {
            color: styleSettings.style.path.color,
            weight : styleSettings.style.path.weight
          });
        }
        // shape.defaultOptions = defaultOptions;

        // var multipolygon = L.polygon(coorsList);

        // hh._latlngs = multipolygon._latlngs;

        //leafletMap.removeLayer(multipolygon);

        let layerId = Ember.get(this.tabModel, 'layerId');
        let layer = Ember.get(this.tabModel, `featureLink.${layerId}`);
        var geoJson = layer.toGeoJSON();

        Ember.set(shape, 'feature', {
          geometry_name : layer.feature.geometry_name,
          id : layer.feature.id,
          type : 'Feature',
          properties : geoJson.properties,
          leafletLayer : shape,
          geometry: {
            coordinates: this._swapСoordinates(coorsList),
            type: layer.feature.geometry.type
        }
       });

        shape.addTo(leafletMap);
        shape.enableEdit();

        this.tabModel.leafletObject.editLayer(shape);

        Ember.set(this.tabModel, `featureLink.${layerId}`, shape);

        // enable save button
        Ember.set(this.tabModel, 'leafletObject._wasChanged', true);
     }
    }
  },

  /**
    Building a multiple polygon.

    @param {array} accumulating array of coordinates.
    @param {array} array of coordinates.
    @returns {array} accumulating array of coordinates.
  */
  _getPolygonCoords(coorsList, coordinates) {
    for (let i = 0; i < coordinates.length; i++) {
      let coors =  coordinates[i];
      let corArr0 = [];

      if (coordinates[0][0][0][0] !== undefined) {
        for (let j = 0; j < coors.length; j++) {
          let coordinat = coors[j];
          let corArr1 = [];

          for(let k = 0; k < coordinat.length; k++) {
            corArr1.push([coordinat[k][1], coordinat[k][0]]);
          }

          coorsList.push(corArr1);
        }
      } else if (coordinates[0][0][0] !== undefined) {
          for (let j = 0; j < coors.length; j++) {
            corArr0.push([coors[j][1], coors[j][0]]);
          }
          coorsList.push(corArr0);
        }
    }

    return coorsList;
  },

  /**
    Building a multiple polyline.

    @param {array} accumulating array of coordinates.
    @param {array} array of coordinates.
    @returns {array} accumulating array of coordinates.
  */
  _getPolylineCoords(coorsList, coordinates) {
      let corArr0 = [];

      if (coordinates[0][0][0] !== undefined) {
        for (let i = 0; i < coordinates.length; i++) {
          let coordinat = coordinates[i];
          let corArr1 = [];

          for(let j = 0; j < coordinat.length; j++) {
            corArr1.push([coordinat[j][1], coordinat[j][0]]);
          }

          coorsList.push(corArr1);
        }
      } else if (coordinates[0][0] !== undefined) {
          for (let i = 0; i < coordinates.length; i++) {
            corArr0.push([coordinates[i][1], coordinates[i][0]]);
          }
          coorsList.push(corArr0);
      }

    return coorsList;
  },

  /**
    Swap coordinates.

    @param {array} array of coordinates.
    @returns {array} inverse array of coordinates.
  */
  _swapСoordinates(coordinates) {
    if (coordinates[0][0][0][0] !== undefined) {
      for (let i = 0; i < coordinates.length; i++) {
        let coordinat0 = coordinates[i];

        for(let j = 0; j < coordinat0.length; j++) {
          let coordinat1 = coordinat0[i];

          for(let k = 0; k < coordinat1.length; k++) {
            let b = coordinat1[k][0];
            coordinat1[k][0] = coordinat1[k][1];
            coordinat1[k][1] = b;
          }
        }
      }
    } else if (coordinates[0][0][0] !== undefined) {
      for (let i = 0; i < coordinates.length; i++) {
        let coordinat = coordinates[i];

        for(let j = 0; j < coordinat.length; j++) {
          let b = coordinat[j][0];
          coordinat[j][0] = coordinat[j][1];
          coordinat[j][1] = b;
        }
      }
    } else if (coordinates[0][0] !== undefined) {
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
