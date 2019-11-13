import Ember from 'ember';
import turfCombine from 'npm:@turf/combine';

export default Ember.Mixin.create({

  /**
   * Change layer object properties.
   * @method changeLayerObjectProperties
   * @param {string} layerId Layer id.
   * @param {string} featureId Object id.
   * @param {Object} properties Object properties.
   */
  changeLayerObjectProperties(layerId, featureId, properties) {
    let [, leafletObject, featureLayer] = this._getModelLayerFeature(layerId, featureId);
    Object.assign(featureLayer.feature.properties, properties);
    leafletObject.editLayer(featureLayer);
  },

  /**
   * Start change layer object.
   * @method startChangeLayerObject
   * @param {string} layerId Layer id.
   * @param {string} featureId Object id.
   */
  startChangeLayerObject(layerId, featureId) {
    let [, leafletObject, featureLayer] = this._getModelLayerFeature(layerId, featureId);
    let leafletMap = this.get('mapApi').getFromApi('leafletMap');
    leafletMap.fitBounds(featureLayer.getBounds());
    this._getEditTools();
    featureLayer.enableEdit(leafletMap);
    leafletMap.on('editable:editing', (e) => {
      if (Ember.isEqual(Ember.guidFor(e.layer), Ember.guidFor(featureLayer))) {
        leafletObject.editLayer(e.layer);
      }
    });
  },

  /**
   * Start creating multy objects.
   * @method startChangeMultyLayerObject
   * @param {string} layerId Layer id.
   * @param {string} featureId Object id.
   */
  startChangeMultyLayerObject(layerId, featureId) {
    let [, leafletObject, featureLayer] = this._getModelLayerFeature(layerId, featureId);

    const type = Ember.get(featureLayer, 'feature.geometry.type');
    let geometryType;
    switch (type) {
      case 'MultiPolygon':
        geometryType = 'multyPolygon';
        break;
      case 'MultiLineString':
        geometryType = 'multyLine';
        break;
      default:
        throw new Error(`Type '${type}' is not supported.`);
    }

    // Select an object for the construction of a multi object.
    this.startChangeLayerObject(layerId, featureId);

    this.set('geometryType', geometryType);

    let editTools = this._getEditTools();
    let context = this;
    Ember.set(context, 'leafletObject', leafletObject);
    Ember.set(context, 'featureLayer', featureLayer);
    editTools.on('editable:drawing:end', this._disableDraw, context);

    let leafletMap = this.get('mapApi').getFromApi('leafletMap');
    Ember.set(leafletMap, 'drawTools', editTools);

    leafletMap.flexberryMap.tools.enableDefault();

    // this.$().closest('body').on('keydown', ((e) => {
    //   // Esc was pressed.
    //   if (e.which === 27) {
    //     this._disableDraw();
    //   }
    // }));

    switch (geometryType) {
      case 'multyPolygon':
        editTools.startPolygon();
        break;
      case 'multyLine':
        editTools.startPolyline();
        break;
    }
  },

  /**
   * Finishing a layer editing operation.
   * @method _disableDraw
   * @param {Object} e Transmitted data.
   * @private
   */
  _disableDraw(e) {
    let editTools = this.get('_editTools');

    // this.$().closest('body').off('keydown');
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
        let leafletMap = this.get('mapApi').getFromApi('leafletMap');

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

            if (this.leafletObject.hasLayer(layer)) {
              this.leafletObject.removeLayer(layer);
            }
          }
        }.bind(this));

        // Coordinate union.
        let fcCombined = turfCombine.default(featureCollection);

        // Create a new multi shape with old shape data.
        let shape = this._createCopyMultiShape(this.featureLayer, geometryType, fcCombined);

        // Create a multiple shape.
        shape.addTo(this.leafletObject);

        // Linking shapes.
        Ember.set(shape, 'multyShape', true);
        Ember.set(shape, 'mainMultyShape', true);

        // Make shape in edit mode.
        shape.enableEdit();

        // We note that the shape was edited.
        this.leafletObject.editLayer(shape);

        // From the list of changed shapes, delete individual ones, leaving only the multiple shape.
        this._removeFromModified(this.leafletObject.changes);

        delete this.leafletObject;
        delete this.featureLayer;
      }
    }
  },


  /**
   * Will create a new multi shape with the data of the old shape.
   * @method _createCopyMultiShape
   * @param {Object} featureLayer Layer.
   * @param {String} geometryType Shape type.
   * @param {Object[]} featureCollection United coordinates.
   * @return {Object} Return a new multi shape.
   * @private
   */
  _createCopyMultiShape(featureLayer, geometryType, featureCollection) {
    //let styleSettings = tabModel.get('styleSettings');
    //const feature = featureCollection.features.pop();


    // We will transform feature coordinates from WGS84 (it is EPSG: 4326) to LatLng.
    const featureCombined = L.geoJson(featureCollection.features.pop(), {
      coordsToLatLng: function (coords) {
        return coords;
      }
    }).toGeoJSON();

    let shape = {};
    const coordinates = featureCombined.features[0].geometry.coordinates;

    if (geometryType === 'multyPolygon') {
      // shape = L.polygon(coordinates, {
      //   color: styleSettings.style.path.color,
      //   weight: styleSettings.style.path.weight,
      //   fillColor: styleSettings.style.path.fillColor
      // });

      shape = L.polygon(coordinates);
    } else if (geometryType === 'multyLine') {
      // shape = L.polyline(coordinates, {
      //   color: styleSettings.style.path.color,
      //   weight: styleSettings.style.path.weight
      // });

      shape = L.polyline(coordinates);
    }

    // let layer = Ember.get(tabModel, `featureLink.${layerId}`);
    //var geoJson = layer.toGeoJSON();

    const feature = featureLayer.feature;
    Ember.set(shape, 'feature', {
      type: 'Feature',
      properties: feature.properties,
      leafletLayer: shape
    });

    let id = Ember.get(feature, 'id');
    if (!Ember.isNone(id)) {
      Ember.set(shape.feature, 'id', id);
      Ember.set(shape.feature, 'geometry_name', feature.geometry_name);
      Ember.set(shape, 'state', 'updateElement');

      Ember.set(shape.feature, 'geometry', {
        coordinates: coordinates
      });

      let geoType = Ember.get(feature, 'geometry.type');
      if (!Ember.isNone(geoType)) {
        Ember.set(shape.feature.geometry, 'type', geoType);
      }
    } else {
      Ember.set(shape, 'state', 'insertElement');
    }

    return shape;
  },

  /**
   * From the list of changed objects, delete individual ones, leaving only the multiple shape.
   * @method _removeFromModified
   * @param {Object[]} changes Array of modified objects.
   * @private
   */
  _removeFromModified(changes) {
    for (let changeLayerNumber in changes) {
      const multyShape = Ember.get(changes[changeLayerNumber], 'multyShape') === true;
      const mainMultyShape = Ember.get(changes[changeLayerNumber], 'mainMultyShape') === true;

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
   * Start visual creating of feature
   * @param {String} layerId Id of layer in that should started editing
   * @param {Object} properties New layer properties
   * @returns noting
   */
  startNewObject(layerId, properties) {
    let [layerModel, leafletObject] = this._getModelLayerFeature(layerId);
    let editTools = this._getEditTools();

    let finishDraw = () => {
      editTools.off('editable:drawing:end', finishDraw, this);
      editTools.stopDrawing();
    };

    editTools.on('editable:drawing:end', finishDraw, this);

    let leafletMap = this.get('mapApi').getFromApi('leafletMap');
    leafletMap.fire('flexberry-map:switchToDefaultMapTool');
    if (editTools.drawing()) {
      editTools.stopDrawing();
    }

    let newLayer;
    switch (layerModel.get('settingsAsObject.typeGeometry')) {
      case 'polygon':
        newLayer = editTools.startPolygon();
        break;
      case 'polyline':
        newLayer = editTools.startPolyline();
        break;
      case 'marker':
        newLayer = editTools.startMarker();
        break;
      default:
        throw 'Unknown layer type: ' + layerModel.get('settingsAsObject.typeGeometry');
    }

    let defaultProperties = layerModel.get('settingsAsObject.defaultProperties') || {};
    newLayer.feature = { properties: Ember.merge(defaultProperties, properties) };
    leafletObject.addLayer(newLayer);
  },

  /**
   * Get editTools.
   * @method _getEditTools
   * @return {Object} EditTools.
   * @private
   */
  _getEditTools() {
    let leafletMap = this.get('mapApi').getFromApi('leafletMap');
    let editTools = Ember.get(leafletMap, 'editTools');
    if (Ember.isNone(editTools)) {
      editTools = new L.Editable(leafletMap);
      Ember.set(leafletMap, 'editTools', editTools);
    }

    return editTools;
  },

  /**
   * Return leaflet layer thats corresponds to passed layerId.
   * @method _getLeafletLayer
   * @param {String} layerId
   * @returns {Object}
   * @private
   */
  _getLayerModel(layerId) {
    const layer = this.get('mapLayer').findBy('id', layerId);
    if (Ember.isNone(layer)) {
      throw 'No layer with such id';
    }

    return layer;
  },

  /**
   *
   * @method _getModelLayerFeature
   * @param {String} layerId Layer id.
   * @param {String} featureId Object id.
   * @returns {Object}
   * @private
   */
  _getModelLayerFeature(layerId, featureId) {
    let layerModel = this._getLayerModel(layerId);
    let leafletObject = layerModel.get('_leafletObject');
    let layers = leafletObject._layers;
    let featureLayer;
    if (featureId !== undefined) {
      featureLayer = Object.values(layers).find(feature => {
        const layerFeatureId = this._getLayerFeatureId(layerModel, feature);
        return layerFeatureId === featureId;
      });
    }

    return [layerModel, leafletObject, featureLayer];
  }
});
