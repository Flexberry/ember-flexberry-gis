/**
   @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/geometry-add-modes/draw';
import turfCombine from 'npm:@turf/combine';

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
    Component settings.
  */
  settings: null,

  actions: {
    /**
      Handles click on available geometry type.

      @method onGeometryTypeSelect
      @param {String} geometryType Selected geometry type.
    */
    onGeometryTypeSelect(geometryType) {
      this.sendAction('drawStart', geometryType);

      this.set('geometryType', geometryType);

      // let that = { component: this, tabModel: tabModel };
      let editTools = this._getEditTools();

      if (!Ember.isNone(editTools)) {
        editTools.stopDrawing();
      }

      editTools.on('editable:drawing:end', this._disableDraw, this);

      let leafletMap = this.get('leafletMap');
      Ember.set(leafletMap, 'drawTools', editTools);

      leafletMap.flexberryMap.tools.enableDefault();

      this.$().closest('body').on('keydown', ((e) => {
        // Esc was pressed.
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

  /**
    Get editTools.

    @method _getEditTools
    @private
  */
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

    @method _disableDraw
    @param {Object} e Transmitted data.
    @private
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

        var featureCollection = {
          type: 'FeatureCollection',
          features: []
        };

        // Define editable objects.
        leafletMap.eachLayer(function (layer) {
          let enabled = Ember.get(layer, 'editor._enabled');
          if (enabled === true) {
            var layerGeoJson = layer.toGeoJSON();
            featureCollection.features.push(layerGeoJson);

            Ember.set(layer, 'multyShape', true);

            if (leafletMap.hasLayer(layer)) {
              leafletMap.removeLayer(layer);
            }

            if (this.tabModel.leafletObject.hasLayer(layer)) {
              this.tabModel.leafletObject.removeLayer(layer);
            }

            if (Ember.get(layer, 'model')) {
              this.tabModel.leafletObject.deleteModel(layer.model);
            }
          }
        }.bind(this));

        // Coordinate union.
        let fcCombined = turfCombine.default(featureCollection);

        let layerId = Ember.get(this.tabModel, 'layerId');

        // Create a new multi shape with old shape data.
        let shape = this._createCopyMultiShape(this.tabModel, layerId, geometryType, fcCombined);

        const tabLeafletObject = this.tabModel.get('leafletObject');
        if (tabLeafletObject.createLayerObject) {
          shape = tabLeafletObject.createLayerObject(tabLeafletObject, Ember.get(shape, 'feature.properties'), shape.toGeoJSON().geometry);
        }

        // Create a multiple shape.
        shape.addTo(this.tabModel.leafletObject);

        // Linking shapes.
        Ember.set(shape, 'multyShape', true);
        Ember.set(shape, 'mainMultyShape', true);

        // Make shape in edit mode.
        shape.enableEdit();

        // We note that the shape was edited.
        this.tabModel.leafletObject.editLayer(shape);

        // Replace with a new shape.
        Ember.set(this.tabModel, `featureLink.${layerId}`, shape);

        // From the list of changed shapes, delete individual ones, leaving only the multiple shape.
        this._removeFromModified(this.tabModel.leafletObject.changes);

        // Enable save button.
        Ember.set(this.tabModel, 'leafletObject._wasChanged', true);
      }
    }
  },

  /**
    Will create a new multi shape with the data of the old shape.

    @method _createCopyMultiShape
    @param {Object} tabModel Tab model.
    @param {Number} layerId Layer id.
    @param {String} geometryType Shape type.
    @param {Object[]} featureCollection United coordinates.
    @return {Object} Return a new multi shape.
    @private
  */
  _createCopyMultiShape(tabModel, layerId, geometryType, featureCollection) {
    let feature = featureCollection.features.pop();
    let shape = {};

    // We will transform feature coordinates from WGS84 (it is EPSG: 4326) to LatLng.
    feature = L.geoJson(feature, {
      coordsToLatLng: function (coords) {
        return coords;
      }
    }).toGeoJSON();

    let coordinates = feature.features[0].geometry.coordinates;

    if (geometryType === 'multyPolygon') {
      shape = L.polygon(coordinates);
    } else if (geometryType === 'multyLine') {
      shape = L.polyline(coordinates);
    }

    let layer = Ember.get(tabModel, `featureLink.${layerId}`);
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
      Ember.set(shape, 'state', 'updateElement');

      Ember.set(shape.feature, 'geometry', {
        coordinates: coordinates
      });

      let geoType = Ember.get(layer.feature, 'geometry.type');
      if (!Ember.isNone(geoType)) {
        Ember.set(shape.feature.geometry, 'type', geoType);
      }
    } else {
      Ember.set(shape, 'state', 'insertElement');
    }

    return shape;
  },

  /**
    From the list of changed objects, delete individual ones, leaving only the multiple shape.

    @method _removeFromModified
    @param {Object[]} changes Array of modified objects.
    @private
   */
  _removeFromModified(changes) {
    for (let changeLayerNumber in changes) {
      let multyShape = Ember.get(changes[changeLayerNumber], 'multyShape') === true;
      let mainMultyShape = Ember.get(changes[changeLayerNumber], 'mainMultyShape') === true;

      if (multyShape === true) {
        if (mainMultyShape === false) {
          delete changes[changeLayerNumber];
        } else {
          delete changes[changeLayerNumber].multyShape;
          delete changes[changeLayerNumber].mainMultyShape;
        }
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
