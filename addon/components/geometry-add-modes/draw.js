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


    ontest(){
      let leafletMap = this.get('leafletMap');

    var nc = [
          [56.344929, 57.993337],
          [56.345358, 57.992154],
          [56.346903, 57.993018],
          [56.344929, 57.993337]
        ];

        var multipolygon = L.polygon(nc);

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
        case 'part':
          editTools.startPolygon();
          break;
        case 'ring':
          editTools.startPolygon();
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

  _disableDraw(e) {
    let editTools = this.get('_editTools');

    this.$().closest('body').off('keydown');

    if (!Ember.isNone(editTools)) {
      editTools.off('editable:drawing:end', this._disableDraw, this);
      editTools.stopDrawing();
    }

    if (!Ember.isNone(e)) {
      let geometryType = this.get('geometryType');
      let multyShapes = geometryType === 'part' ||  geometryType === 'ring';

      if (!multyShapes) {
        let addedLayer = e.layer;
        this.sendAction('complete', addedLayer);
      }
      else {

       // let layer = Ember.get(tabModel, `featureLink.${rowId}`);
        let leafletMap = this.get('leafletMap');

        let layerId = Ember.get(this.tabModel, 'layerId');
        let l = Ember.get(this.tabModel, `featureLink.${layerId}`);
        // Check if layer is a marker
       // if (layer instanceof L.Polygon) {
            // Create GeoJSON object from marker
            debugger;
            var geojson = l.toGeoJSON();

            var drawnItems = new L.FeatureGroup();
         //   drawnItems.nid=255;
        // console.log(drawnItems._leaflet_id);
            leafletMap.addLayer(drawnItems);

            var polyLayers = [];

            //L.polygon()
            //var cor =  geojson.geometry.coordinates[0];
           // polyLayers.push(cor);

          //   var nc = [
          //   [56.344929, 57.993337],
          //   [56.345358, 57.992154],
          //   [56.346903, 57.993018],
          //   [56.344929, 57.993337]
          // ];

          // var nc = [
          //   [57.993337, 56.344929],
          //   [57.992154, 56.345358],
          //   [57.993018,56.346903 ],
          //   [57.993337,56.344929 ]
          // ];

          //polyLayers.push(nc);

          //var multiPolygonOptions = {color:'red', weight:8};

          //list[0].editor._enabled
          let coorsList = [];
          leafletMap.eachLayer(function (layer) {
          if (layer instanceof L.Polygon && layer.editor !== undefined && layer.editor._enabled === true) {
           // console.log(layer);

            var geojson0 = layer.toGeoJSON();

           // let coorsList = [];
            let coordinates = geojson0.geometry.coordinates;

            for(let i=0;i<coordinates.length;i++) {
              let c =  coordinates[i];
              let hh = [];

              if(coordinates[0][0][0][0] != undefined) {

              for(let j=0;j<c.length;j++){
                let c0 =  c[j];
                let hh1 = [];

                for(let k=0;k<c0.length;k++)
                {
                  hh1.push([c0[k][1],c0[k][0]]);
                }

              //  hh.push(hh1);
              coorsList.push(hh1);
            }
              //coorsList.push(hh);
          }
          else {
          if(coordinates[0][0][0] != undefined) {
            for(let j=0;j<c.length;j++) {
              hh.push([c[j][1],c[j][0]]);
          }
            coorsList.push(hh);
            }
          }
        }
            //polyLayers.push(coorsList);

            leafletMap.removeLayer(layer);
          }
         // }
      });

      var multipolygon = L.polygon(coorsList);

      multipolygon.addTo(leafletMap);
    multipolygon.enableEdit();
      Ember.set(multipolygon, 'feature', { type: 'Feature' });
      Ember.set(multipolygon.feature, 'properties', geojson.properties);
      Ember.set(multipolygon.feature, 'leafletLayer', multipolygon);

      Ember.set(this.tabModel, `featureLink.${layerId}`, multipolygon);

      //leafletMap.removeLayer(l);

        // enable save button
        Ember.set(this.tabModel, 'leafletObject._wasChanged', true);
      }
    }
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
