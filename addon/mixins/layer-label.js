import Ember from 'ember';
import jsts from 'npm:jsts';
import { checkMapZoom } from '../utils/check-zoom';

export default Ember.Mixin.create({

  _labelsLayer: null,

  additionalZoomLabel: null,
  /**
    @method _getContainerPane
    @return HTMLElement
    Returns the HTML element for this label layer.
  */
  _getContainerPane: function () {
    let className = 'leaflet-' + this.get('_paneLabel') + '-pane';
    let container = Ember.$(`.${className}`);
    return container[0];
  },

  /**
    @property _paneLabel
    @type String
    @readOnly
  */
  _paneLabel: Ember.computed('layerModel.id', 'labelSettings.signMapObjects', function () {
    if (this.get('labelSettings.signMapObjects')) {
      // to switch combine-layer
      let layerId = !Ember.isNone(this.get('layerId')) ? this.get('layerId') : '';
      return 'labelLayer' + this.get('layerModel.id') + layerId;
    }

    return null;
  }),

  /**
    Sets leaflet layer's zindex.

    @method _setLayerZIndex
    @private
  */
  _setLayerLabelZIndex: function (begIndex) {
    let thisPaneLabel = this.get('_paneLabel');
    if (thisPaneLabel && !Ember.isNone(leafletMap)) {
      let pane = leafletMap.getPane(thisPaneLabel);
      if (pane) {
        pane.style.zIndex = (Ember.isNone(this.get('labelSettings.index')) ? this.get('index') : this.get('labelSettings.index')) + begIndex + 1; //to make the label layer higher than the vector layer
      }
    }

    let additionalZoomLabel = this.get('additionalZoomLabel');
    if (additionalZoomLabel) {
      additionalZoomLabel.forEach(additionalZoom => {
        let _paneLabel = additionalZoom._paneLabel;
        if (_paneLabel && !Ember.isNone(leafletMap)) {
          let pane = leafletMap.getPane(_paneLabel);
          if (pane) {
            pane.style.zIndex = (Ember.isNone(this.get('labelSettings.index')) ? this.get('index') : this.get('labelSettings.index')) + begIndex + 1; //to make the label layer higher than the vector layer
          }
        }
      });
    }
  },

  /**
    Show all layer label objects.
    @method showAllLayerObjectsLabel
    @return {Promise}
  */
  showAllLayerObjectsLabel(leafletObject, layer) {
    let _labelsLayer = leafletObject._labelsLayer;
    if (layer.get('settingsAsObject.labelSettings.signMapObjects') && !Ember.isNone(_labelsLayer) && map.hasLayer(_labelsLayer)) {
      _labelsLayer.eachLayer(function (labelLayer) {
        if (!map.hasLayer(labelLayer)) {
          map.addLayer(labelLayer);
        }
      });
    }

    let additionalZoomLabel = leafletObject.additionalZoomLabel;
    if (layer.get('settingsAsObject.labelSettings.signMapObjects') && !Ember.isNone(additionalZoomLabel)) {
      additionalZoomLabel.forEach(zoomLabels => {
        if (map.hasLayer(zoomLabels)) {
          zoomLabels.eachLayer(function (labelLayer) {
            if (!map.hasLayer(labelLayer)) {
              map.addLayer(labelLayer);
            }
          });
        }
      });
    }
  },

  /**
    Hide all layer label objects.
    @method hideAllLayerOhideAllLayerObjectsLabelbjects
    @return nothing
  */
  hideAllLayerObjectsLabel(leafletObject, layer) {
    let _labelsLayer = leafletObject._labelsLayer;
    if (layer.get('settingsAsObject.labelSettings.signMapObjects') && !Ember.isNone(_labelsLayer) && map.hasLayer(_labelsLayer)) {
      _labelsLayer.eachLayer(function (labelLayer) {
        if (map.hasLayer(labelLayer)) {
          map.removeLayer(labelLayer);
        }
      });
    }

    let additionalZoomLabel = leafletObject.additionalZoomLabel;
    if (layer.get('settingsAsObject.labelSettings.signMapObjects') && !Ember.isNone(additionalZoomLabel)) {
      additionalZoomLabel.forEach(zoomLabels => {
        if (map.hasLayer(zoomLabels)) {
          zoomLabels.eachLayer(function (labelLayer) {
            if (!map.hasLayer(labelLayer)) {
              map.removeLayer(labelLayer);
            }
          });
        }
      });
    }
  },

  /**
    Determine the visibility of the specified objects by id for the layer label.
    @method _setVisibilityObjects
    @param {string[]} objectIds Array of objects IDs.
    @param {boolean} [visibility=false] visibility Object Visibility.
    @return {Ember.RSVP.Promise}
  */
  _setVisibilityObjectsLabel(leafletObject, layer, objectIds, visibility = false) {
    let map = this.get('leafletMap');
    let additionalZoomLabel = leafletObject.additionalZoomLabel;
    if (layer.get('settingsAsObject.labelSettings.signMapObjects') && !Ember.isNone(additionalZoomLabel)) {
      objectIds.forEach(objectId => {
        additionalZoomLabel.forEach(zoomLabels => {
          let objects = Object.values(zoomLabels._layers).filter(shape => {
            return this.get('mapApi').getFromApi('mapModel')._getLayerFeatureId(layer, shape) === objectId;
          });
          if (objects.length > 0) {
            objects.forEach(obj => {
              if (visibility) {
                map.addLayer(obj);
              } else {
                map.removeLayer(obj);
              }
            });
          }
        });
      });
    }

    let _labelsLayer = leafletObject._labelsLayer;
    if (layer.get('settingsAsObject.labelSettings.signMapObjects') && !Ember.isNone(_labelsLayer)) {
      objectIds.forEach(objectId => {
        let objects = Object.values(_labelsLayer._layers).filter(shape => {
          return this.get('mapApi').getFromApi('mapModel')._getLayerFeatureId(layer, shape) === objectId;
        });
        if (objects.length > 0) {
          objects.forEach(obj => {
            if (visibility) {
              map.addLayer(obj);
            } else {
              map.removeLayer(obj);
            }
          });
        }
      });
    }
  },

  /**
    Reload layer label.

    @method reloadLabel
    @private
  */
  reloadLabel(leafletObject) {
    let map = this.get('leafletMap');
    if (this.get('labelSettings.signMapObjects') && !Ember.isNone(this.get('_labelsLayer')) &&
      !Ember.isNone(leafletObject._labelsLayer)) {
      leafletObject._labelsLayer.eachLayer((layerShape) => {
        if (map.hasLayer(layerShape)) {
          map.removeLayer(layerShape);
        }
      });
      leafletObject._labelsLayer.clearLayers();
    }

    if (this.get('labelSettings.signMapObjects') && !Ember.isNone(this.get('additionalZoomLabel')) &&
      !Ember.isNone(leafletObject.additionalZoomLabel)) {
      this.get('additionalZoomLabel').forEach(zoomLabels => {
        zoomLabels.eachLayer((layerShape) => {
          if (map.hasLayer(layerShape)) {
            map.removeLayer(layerShape);
          }
        });
        zoomLabels.clearLayers();
      });
    }
  },

  /**
    Switches pane depending on the zoom.

    @method _checkZoomPane
    @private
  */
  _checkZoomPaneLabel(leafletObject) {
    let leafletMap = this.get('leafletMap');
    let thisPaneLabel = this.get('_paneLabel');
    if (this.get('labelSettings.signMapObjects') && !Ember.isNone(leafletMap) && thisPaneLabel && !Ember.isNone(leafletObject)) {
      let pane = leafletMap.getPane(thisPaneLabel);
      let labelsLayer = this.get('_labelsLayer');
      let mapPane = leafletMap._mapPane;
      if (!Ember.isNone(mapPane) && !Ember.isNone(pane) && !Ember.isNone(labelsLayer)) {
        let existPaneDomElem = Ember.$(mapPane).children(`[class*='${thisPaneLabel}']`).length;
        if (existPaneDomElem > 0 && !checkMapZoom(labelsLayer)) {
          L.DomUtil.remove(pane);
        } else if (existPaneDomElem === 0 && checkMapZoom(labelsLayer)) {
          mapPane.appendChild(pane);
        }
      }
    }

    let additionalZoomLabel = this.get('additionalZoomLabel');
    if (additionalZoomLabel) {
      additionalZoomLabel.forEach(additionalZoom => {
        let _paneLabel = additionalZoom._paneLabel;
        if (this.get('labelSettings.signMapObjects') && !Ember.isNone(leafletMap) && _paneLabel && !Ember.isNone(leafletObject)) {
          let pane = leafletMap.getPane(_paneLabel);
          let mapPane = leafletMap._mapPane;
          if (!Ember.isNone(mapPane) && !Ember.isNone(pane) && !Ember.isNone(additionalZoom)) {
            let existPaneDomElem = Ember.$(mapPane).children(`[class*='${_paneLabel}']`).length;
            if (existPaneDomElem > 0 && !checkMapZoom(additionalZoom)) {
              L.DomUtil.remove(pane);
            } else if (existPaneDomElem === 0 && checkMapZoom(additionalZoom)) {
              mapPane.appendChild(pane);
            }
          }
        }
      });
    }
  },

  /**
    Deinitializes DOM-related component's properties.
  */
  willDestroyElementLabel(leafletMap) {
    if (this.get('typeGeometry') === 'polyline') {
      leafletMap.off('zoomend', this._updatePositionLabelForLine, this);
    }

    if (this.get('showExisting') !== false) {
      leafletMap.off('moveend', this._showLabelsMovingMap, this);
    }
  },

  /**
    Switches labels layer's minScaleRange.

    @method _zoomMinDidChange
    @private
  */
  _zoomMinDidChange: Ember.observer('labelSettings.scaleRange.minScaleRange', function () {
    let minZoom = this.get('labelSettings.scaleRange.minScaleRange');
    let _labelsLayer = this.get('_labelsLayer');
    if (!Ember.isNone(_labelsLayer) && !Ember.isNone(minZoom)) {
      _labelsLayer.minZoom = minZoom;
      this._checkZoomPane();
    }
  }),

  /**
    Switches labels layer's maxScaleRange.

    @method _zoomMaxDidChange
    @private
  */
  _zoomMaxDidChange: Ember.observer('labelSettings.scaleRange.maxScaleRange', function () {
    let maxZoom = this.get('labelSettings.scaleRange.maxScaleRange');
    let _labelsLayer = this.get('_labelsLayer');
    if (!Ember.isNone(_labelsLayer) && !Ember.isNone(maxZoom)) {
      _labelsLayer.maxZoom = maxZoom;
      this._checkZoomPane();
    }
  }),

  /**
    Create array of strings and feature properies.

    @method _applyProperty
    @param {String} str String for parsing
    @param {Object} layer layer
    @return {String} string with replaced property
  */
  _applyProperty(str, layer) {
    let hasReplace = false;
    let propName;

    let leafletObject = this.returnLeafletObject();

    try {
      propName = Ember.$('<p>' + str + '</p>').find('propertyname');
    } catch (e) {
      hasReplace = true;
      str = str.replaceAll('"', '\\"').replaceAll('(', '\\(').replaceAll(')', '\\)');
      propName = Ember.$('<p>' + str + '</p>').find('propertyname');
    }

    if (propName.length === 0) { // if main node
      propName = Ember.$('<p>' + str + '</p> propertyname');
    }

    if (propName.length > 0) {
      for (var prop of propName) {
        let property = prop.innerHTML;
        if (prop.localName !== 'propertyname') {
          property = prop.innerText;
        }

        if (property && layer.feature.properties && layer.feature.properties.hasOwnProperty(property)) {
          let readFormat = Ember.get(leafletObject, 'readFormat.featureType.fieldTypes');

          let label = layer.feature.properties[property];
          let dateTimeFormat = this.displaySettings.dateTimeFormat;
          let dateFormat = this.displaySettings.dateFormat;
          if (readFormat[property] === 'date' && (!Ember.isEmpty(dateFormat) || !Ember.isEmpty(dateTimeFormat))) {
            let dateValue = moment(label);

            if (dateValue.isValid()) {
              if (!Ember.isEmpty(dateTimeFormat)) {
                label = (dateValue.format('HH:mm:ss') === '00:00:00') ? dateValue.format(dateFormat) : dateValue.format(dateTimeFormat);
              } else {
                label = dateValue.format(dateFormat);
              }
            }
          }

          if (Ember.isNone(label)) {
            label = '';
          }

          str = str.replace(prop.outerHTML, label);
        }
      }
    }

    if (hasReplace) {
      return str.replaceAll('\\"', '"').replaceAll('\\(', '(').replaceAll('\\)', ')');
    } else {
      return str;
    }
  },

  /**
    Apply function.

    @method _applyFunction
    @param {String} str String for parsing
    @return {String} string with applied and replaced function
  */
  _applyFunction(str) {
    let func;
    let hasReplace = false;

    try {
      func = Ember.$('<p>' + str + '</p>').find('function');
    } catch (e) {
      hasReplace = true;
      str = str.replaceAll('"', '\\"').replaceAll('(', '\\(').replaceAll(')', '\\)');
      func = Ember.$('<p>' + str + '</p>').find('function');
    }

    if (func.length === 0) { // if main node
      func = Ember.$('<p>' + str + '</p> function');
    }

    if (func.length > 0) {
      for (var item of func) {
        let nameFunc = Ember.$(item).attr('name');
        if (!Ember.isNone(nameFunc)) {
          nameFunc = Ember.$(item).attr('name').replaceAll('\\"', '');
          switch (nameFunc) {
            case 'toFixed':
              let attr = Ember.$(item).attr('attr').replaceAll('\\"', '');
              let property = item.innerHTML;
              let numProp = Number.parseFloat(property);
              let numAttr = Number.parseFloat(attr);
              if (!Ember.isNone(attr) && !Ember.isNone(property) && !Number.isNaN(numProp) && !Number.isNaN(numAttr)) {
                let newStr = numProp.toFixed(numAttr);
                str = str.replace(item.outerHTML, newStr);
              }

              break;
          }
        }
      }
    }

    if (hasReplace) {
      return str.replaceAll('\\"', '"').replaceAll('\\(', '(').replaceAll('\\)', ')');
    } else {
      return str;
    }
  },

  /**
    Show labels when map moving
    @method _showLabelsMovingMap
  */
  _showLabelsMovingMap() {
    let additionalZoomLabel = this.get('additionalZoomLabel');
    let _labelsLayer = this.get('_labelsLayer');
    let leafletObject = this.returnLeafletObject();
    if (this.get('leafletMap').hasLayer(_labelsLayer) && leafletObject) {
      this._createStringLabel(leafletObject.getLayers(), _labelsLayer, additionalZoomLabel);
    }
  },

  /**
    Create label string for every object of layer.

    @method _createStringLabel
    @param {Array} layers new layers for add labels
    @param {Object} additionalZoomLabel Array with labels layers
    @param {Object} labelsLayer Labels layer with not multi labels
  */
  _createStringLabel(layers, labelsLayer, additionalZoomLabel) {
    let optionsLabel = this.get('labelSettings.options');
    let labelSettingsString = this.get('labelSettings.labelSettingsString');
    let style = Ember.String.htmlSafe(
      `font-family: ${Ember.get(optionsLabel, 'captionFontFamily')}; ` +
      `font-size: ${Ember.get(optionsLabel, 'captionFontSize')}px; ` +
      `font-weight: ${Ember.get(optionsLabel, 'captionFontWeight')}; ` +
      `font-style: ${Ember.get(optionsLabel, 'captionFontStyle')}; ` +
      `text-decoration: ${Ember.get(optionsLabel, 'captionFontDecoration')}; ` +
      `color: ${Ember.get(optionsLabel, 'captionFontColor')}; ` +
      `text-align: ${Ember.get(optionsLabel, 'captionFontAlign')}; `);

    let leafletMap = this.get('leafletMap');
    let bbox = leafletMap.getBounds();
    if (layers) {
      let additionalLabelLayer = null;
      if (additionalZoomLabel) {
        let zoom = this.get('leafletMap').getZoom();
        let aLayers = additionalZoomLabel.filter(l => { return (l.minZoom == null || l.minZoom <= zoom) && (l.maxZoom == null || l.maxZoom >= zoom); });

        if (aLayers.length > 0) {
          additionalLabelLayer = aLayers[0];
        }
      }

      layers.forEach((layer) => {
        let currentLabelExists = false;
        if (additionalLabelLayer) {
          currentLabelExists = layer._labelAdditional && layer._labelAdditional.filter(label => {
            return label.zoomCheck === additionalLabelLayer.check;
          }).length > 0;
        } else {
          currentLabelExists = !Ember.isNone(layer._label);
        }

        let showExisting = this.get('showExisting');
        let intersectBBox = layer.getBounds ? bbox.intersects(layer.getBounds()) : bbox.contains(layer.getLatLng());
        let staticLoad = showExisting !== false && intersectBBox;
        if (!currentLabelExists && (showExisting === false || staticLoad)) {
          let label = layer.labelValue || this._applyFunction(this._applyProperty(labelSettingsString, layer));
          this._createLabel(label, layer, style, labelsLayer, additionalLabelLayer);
        }
      });
    }
  },

  /**
    Create label for object of layer.

    @method _createLabel
    @param {String} text
    @param {Object} layer
    @param {String} style
    @param {Object} labelsLayer
    @param {Object} additionalZoomLabel
  */
  _createLabel(text, layer, style, labelsLayer, additionalLabelLayer) {
    if (Ember.isEmpty(text) || Ember.isEmpty(layer)) {
      return;
    }

    let lType = layer.toGeoJSON().geometry.type;

    if (lType.indexOf('Polygon') !== -1) {
      this._createLabelForPolygon(text, layer, style, labelsLayer, additionalLabelLayer);
    }

    if (lType.indexOf('Point') !== -1) {
      this._createLabelForPoint(text, layer, style, labelsLayer);
    }

    if (lType.indexOf('LineString') !== -1) {
      this._createLabelForPolyline(text, layer, style, labelsLayer, additionalLabelLayer);
    }
  },

  _createLabelForPoint(text, layer, style, labelsLayer) {
    let latlng = layer.getLatLng();
    let iconWidth = 30;
    let iconHeight = 30;
    let positionPoint = this._setPositionPoint(iconWidth, iconHeight);
    let anchor = positionPoint.anchor;
    let className = 'label';
    className += ' point ' + positionPoint.cssClass;
    let html = '<div style="' + style + positionPoint.style + '">' + text + '</div>';

    let label = this._createLabelMarker(layer, latlng, className, html, iconWidth, iconHeight, anchor, this.get('_paneLabel'));
    layer._label = label;

    if (!latlng) {
      return;
    }

    // adding labels to layers
    this._addLabelsToLayers(labelsLayer, label);
  },

  _createLabelForPolygon(text, layer, style, labelsLayer, additionalLabelLayer) {
    let latlng = null;
    let iconWidth = 10;
    let iconHeight = 40;
    let anchor = null;
    let html = '';
    let label;

    let geojsonWriter = new jsts.io.GeoJSONWriter();
    let className = 'label';

    let multi = additionalLabelLayer ? additionalLabelLayer.check === 'multi' : false;
    let objJsts = layer.toJsts(L.CRS.EPSG4326);

    try {
      if (multi) {
        let countGeometries = objJsts.getNumGeometries();
        if (countGeometries > 1) { // сюда попадаем только если нужны мультинадписи и по настройке и по факту
          label = L.featureGroup();
          for (let i = 0; i < countGeometries; i++) {
            let polygonN = objJsts.getGeometryN(i);
            let centroidNJsts = polygonN.isValid() ? polygonN.getInteriorPoint() : polygonN.getCentroid();

            let centroidN = geojsonWriter.write(centroidNJsts);
            latlng = L.latLng(centroidN.coordinates[1], centroidN.coordinates[0]);
            html = '<div style="' + style + '">' + text + '</div>';

            let labelN = this._createLabelMarker(layer, latlng, className, html, iconWidth, iconHeight, anchor, additionalLabelLayer._paneLabel);
            label.addLayer(labelN);
          }

          label.feature = layer.feature;
          label.leafletMap = this.get('leafletMap');
          label.zoomCheck = additionalLabelLayer.check;
        }
      }

      // если либо нет настройки, либо нет составных частей
      if (!label) {
        let centroidJsts = objJsts.isValid() ? objJsts.getInteriorPoint() : objJsts.getCentroid();
        let centroid = geojsonWriter.write(centroidJsts);
        latlng = L.latLng(centroid.coordinates[1], centroid.coordinates[0]);
        html = '<div style="' + style + '">' + text + '</div>';

        let paneLabel = additionalLabelLayer ? additionalLabelLayer._paneLabel : this.get('_paneLabel');

        // возможно тут тоже надо будет сделать L.featureGroup()
        label = this._createLabelMarker(layer, latlng, className, html, iconWidth, iconHeight, anchor, paneLabel);

        if (additionalLabelLayer) {
          // остальное и так проставилось в _createLabelMarker (feature, leafletMap)
          label.zoomCheck = additionalLabelLayer.check; // флаг для поиска. переделать!
        }
      }
    }
    catch (e) {
      console.error(e.message + ': ' + layer.toGeoJSON().id);
    }

    if (!label) {
      return;
    }

    if (multi) {
      if (!layer._labelAdditional) {
        layer._labelAdditional = Ember.A();
      }

      layer._labelAdditional.addObject(label);
    } else {
      layer._label = label;
    }

    // adding labels to layers
    this._addLabelsToLayers(additionalLabelLayer || labelsLayer, label);
  },

  _createLabelForPolyline(text, layer, style, labelsLayer, additionalLabelLayer) {
    let latlng = null;
    let iconWidth = 10;
    let iconHeight = 40;
    let anchor = null;
    let html = '';

    let label;
    let geojsonWriter = new jsts.io.GeoJSONWriter();
    let optionsLabel = this.get('labelSettings.options');
    let className = 'label';

    let multi = additionalLabelLayer ? additionalLabelLayer.check === 'multi' : false;

    try {
      let objJsts = layer.toJsts(L.CRS.EPSG4326);
      let countGeometries = objJsts.getNumGeometries();

      if (countGeometries > 1) { // для мультилинии у первого кусочка надпись будет вне зависимости от флага multi
        if (multi) {
          label = L.featureGroup();
          label.feature = layer.feature;
          label.leafletMap = this.get('leafletMap');
          label.zoomCheck = additionalLabelLayer.check;
        }

        for (let i = 0; i < (multi ? countGeometries : 1); i++) {
          let partlineJsts = objJsts.getGeometryN(i);
          let partlineGeoJson = geojsonWriter.write(partlineJsts);
          let partline = L.geoJSON(partlineGeoJson).getLayers()[0];

          let bboxJstsN = partlineJsts.getEnvelope();
          let bboxGeoJsonN = geojsonWriter.write(bboxJstsN);
          let bbox = L.geoJSON(bboxGeoJsonN).getLayers()[0];
          latlng = L.latLng(bbox._bounds._northEast.lat, bbox._bounds._southWest.lng);

          let options = {
            fillColor: Ember.get(optionsLabel, 'captionFontColor'),
            align: Ember.get(optionsLabel, 'captionFontAlign')
          };

          layer._svgConteiner = null;
          this._addTextForLine(layer, text, options, style, partline);
          iconWidth = 12;
          iconHeight = 12;
          html = Ember.$(layer._svgConteiner).html();

          if (multi) {
            let labelN = this._createLabelMarker(layer, latlng, className, html, iconWidth, iconHeight, anchor, additionalLabelLayer._paneLabel);
            labelN._parentLayer = partline;

            label.addLayer(labelN);
          } else {
            label = this._createLabelMarker(layer, latlng, className, html, iconWidth, iconHeight, anchor, this.get('_paneLabel'));
          }
        }
      } else {
        latlng = L.latLng(layer._bounds._northEast.lat, layer._bounds._southWest.lng);
        let options = {
          fillColor: Ember.get(optionsLabel, 'captionFontColor'),
          align: Ember.get(optionsLabel, 'captionFontAlign')
        };

        this._addTextForLine(layer, text, options, style);
        iconWidth = 12;
        iconHeight = 12;
        html = Ember.$(layer._svgConteiner).html();

        let paneLabel = additionalLabelLayer ? additionalLabelLayer._paneLabel : this.get('_paneLabel');
        label = this._createLabelMarker(layer, latlng, className, html, iconWidth, iconHeight, anchor, paneLabel);

        if (multi) {
          label.zoomCheck = additionalLabelLayer.check;
        }
      }
    }
    catch (e) {
      console.error(e.message + ': ' + layer.toGeoJSON().id);
    }

    if (!label) {
      return;
    }

    if (multi) {
      if (!layer._labelAdditional) {
        layer._labelAdditional = Ember.A();
      }

      layer._labelAdditional.addObject(label);
    } else {
      layer._label = label;
    }

    // adding labels to layers
    this._addLabelsToLayers(additionalLabelLayer || labelsLayer, label);
  },

  _createLabelMarker(layer, latlng, className, html, iconWidth, iconHeight, anchor, pane) {
    let leafletMap = this.get('leafletMap');
    let label = L.marker(latlng, {
      icon: L.divIcon({
        className: className,
        html: html,
        iconSize: [iconWidth, iconHeight],
        iconAnchor: anchor
      }),
      zIndexOffset: 1000,
      pane: pane
    });

    if (layer._path) {
      label._path = layer._path;
      label._textNode = layer._textNode;
      label._svg = layer._svg;
      label._svgConteiner = layer._svgConteiner;
    }

    label.style = {
      className: className,
      html: html,
      iconSize: [iconWidth, iconHeight]
    };
    label.feature = layer.feature;
    label.leafletMap = leafletMap;

    return label;
  },

  _addLabelsToLayers(labelsLayer, label) {
    if (labelsLayer && label) {
      labelsLayer.addLayer(label);
    }
  },

  /**
    Set position for point.

    @method _setPositionPoint
    @param {Number} width
  */
  _setPositionPoint(width, height) {
    // значения для маркера по умолчанию
    let left = 12.5;
    let right = 12.5;
    let top = 41;
    let bottom = 0;

    let iconSize = this.get('styleSettings.style.marker.style.iconSize');
    let iconAnchor = this.get('styleSettings.style.marker.style.iconAnchor');
    if (!Ember.isNone(iconAnchor) && iconAnchor.length === 2 && !Ember.isNone(iconSize) && iconSize.length === 2) {
      left = iconAnchor[0] || 0;
      right = (iconSize[0] || 0) - (iconAnchor[0] || 0);
      top = iconAnchor[1] || 0;
      bottom = (iconSize[1] || 0) - (iconAnchor[1] || 0);
    }

    let style;
    let anchor;
    let cssClass;

    switch (this.get('labelSettings.location.locationPoint')) {
      case 'overLeft':
        style = 'text-align: right;';
        anchor = [left + width, top + height];
        cssClass = 'over left';
        break;
      case 'overMiddle':
        style = 'text-align: center;';
        anchor = [Math.round((width - (right - left)) / 2), top + height];
        cssClass = 'over middle';
        break;
      case 'overRight':
        style = 'text-align: left;';
        anchor = [-1 * right, top + height];
        cssClass = 'over right';
        break;
      case 'alongLeft':
        style = 'text-align: right;';
        anchor = [left + width, Math.round((height - (bottom - top)) / 2)];
        cssClass = 'along left';
        break;
      case 'alongMidle':
        style = 'text-align: center;';
        anchor = [Math.round((width - (right - left)) / 2), Math.round((height - (bottom - top)) / 2)];
        cssClass = 'along middle';
        break;
      case 'alongRight':
        style = 'text-align: left;';
        anchor = [-1 * right, Math.round((height - (bottom - top)) / 2)];
        cssClass = 'along right';
        break;
      case 'underLeft':
        style = 'text-align: right;';
        anchor = [left + width, -1 * bottom];
        cssClass = 'under left';
        break;
      case 'underMiddle':
        style = 'text-align: center;';
        anchor = [Math.round((width - (right - left)) / 2), -1 * bottom];
        cssClass = 'under middle';
        break;
      case 'underRight':
        style = 'text-align: left;';
        anchor = [-1 * right, -1 * bottom];
        cssClass = 'under right';
        break;
      default:
        style = 'text-align: center;';
        anchor = [Math.round((width - (right - left)) / 2), top + height];
        cssClass = 'over middle';
        break;
    }

    return { style, anchor, cssClass };
  },

  /**
    Get text width for line object.

    @method _getWidthText
    @param {String} text
    @param {String} font
    @param {String} fontSize
    @param {String} fontWeight
    @param {String} fontStyle
    @param {String} textDecoration
  */
  _getWidthText(text, font, fontSize, fontWeight, fontStyle, textDecoration) {
    let div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.height = 'auto';
    div.style.width = 'auto';
    div.style.whiteSpace = 'nowrap';
    div.style.fontFamily = font;
    div.style.fontSize = fontSize + 'px';
    div.style.fontWeight = fontWeight;
    div.style.fontStyle = fontStyle;
    div.style.textDecoration = textDecoration;
    div.innerHTML = text;
    document.body.appendChild(div);

    let clientWidth = div.clientWidth;
    document.body.removeChild(div);

    return clientWidth;
  },

  /**
    Set label for line object

    @method _setLabelLine
    @param {Object} layer
    @param {Object} svg
  */
  _setLabelLine(layer, svg, partline, text) {
    let leafletMap = this.get('leafletMap');
    let latlngArr = layer.getLatLngs();
    if (partline) {
      latlngArr = partline.getLatLngs();
    }

    let rings = [];
    let begCoord;
    let endCoord;
    let lType = (!partline) ? layer.toGeoJSON().geometry.type : partline.toGeoJSON().geometry.type;
    if (lType === 'LineString') {
      begCoord = leafletMap.latLngToLayerPoint(latlngArr[0]);
      endCoord = leafletMap.latLngToLayerPoint(latlngArr[latlngArr.length - 1]);
      for (let i = 0; i < latlngArr.length; i++) {
        rings[i] = leafletMap.latLngToLayerPoint(latlngArr[i]);
      }
    } else {
      begCoord = leafletMap.latLngToLayerPoint(latlngArr[0][0]);
      endCoord = leafletMap.latLngToLayerPoint(latlngArr[0][latlngArr[0].length - 1]);
      for (let i = 0; i < latlngArr[0].length; i++) {
        rings[i] = leafletMap.latLngToLayerPoint(latlngArr[0][i]);
      }
    }

    if (begCoord.x > endCoord.x) {
      rings.reverse();
    }

    // зададим буферную зону вокруг path, чтобы надписи не обрезались
    let buffer = 100;
    let minX = 10000000;
    let minY = 10000000;
    let maxX = 600;
    let maxY = 600;
    let layerPathLength = 0;
    for (let i = 0; i < rings.length; i++) {
      if (rings[i].x < minX) {
        minX = rings[i].x;
      }

      if (rings[i].y < minY) {
        minY = rings[i].y;
      }

      if (i > 0) {
        layerPathLength += Math.sqrt(Math.pow((rings[i].x - rings[i - 1].x), 2) + Math.pow((rings[i].y - rings[i - 1].y), 2));
      }
    }

    let { textLength } = this._getPathAndTextLength(layer, text);

    let d = '';
    let kx = minX - 6;
    let ky = minY - 6;

    for (let i = 0; i < rings.length; i++) {
      d += i === 0 ? 'M' : 'L';

      let x;
      let y;

      // если это последняя точка и нам не хватает длины, то продлим
      if (i === rings.length - 1 && layerPathLength < textLength) {
        // но не будем продлевать больше чем на две длины
        let extraLength = textLength > 3 * layerPathLength ?  2 * layerPathLength : textLength - layerPathLength;
        let newPoint = this._getPoint(rings[i - 1].x, rings[i - 1].y, rings[i].x, rings[i].y, extraLength);
        x = newPoint.x;
        y = newPoint.y;
      } else {
        x = rings[i].x;
        y = rings[i].y;
      }

      x = x - kx + buffer;
      y = y - ky + buffer;

      if (x > maxX) {
        maxX = x;
      }

      if (y > maxY) {
        maxY = y;
      }

      d += x + ' ' + y;
    }

    layer._path.setAttribute('d', d);
    svg.setAttribute('width', maxX + buffer + 'px');
    svg.setAttribute('height', maxY + buffer + 'px');

    // компенсируем сдвиг
    svg.setAttribute('style', 'margin: -' + buffer + 'px 0 0 -' + buffer + 'px');
  },

  _getPoint(x1, y1, x2, y2, length) {
    if (x1 === x2) {
      return { x: x1, y: y2 + (y2 > y1 ? 1 : -1) * length };
    }

    if (y1 === y2) {
      return { x: x2 + (x2 > x1 ? 1 : -1) * length, y: y1 };
    }

    let t = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
    let x = (t + length) * ((x2 - x1) / t) + x1;
    let y = (t + length) * ((y2 - y1) / t) + y1;

    return { x,  y };
  },

  _getPathAndTextLength(layer, text) {
    let pathLength = layer._path.getTotalLength();
    let optionsLabel = this.get('labelSettings.options');
    let textLength = this._getWidthText(
      text,
      Ember.get(optionsLabel, 'captionFontFamily'),
      Ember.get(optionsLabel, 'captionFontSize'),
      Ember.get(optionsLabel, 'captionFontWeight'),
      Ember.get(optionsLabel, 'captionFontStyle'),
      Ember.get(optionsLabel, 'captionFontDecoration')
    );

    return { pathLength, textLength };
  },

  /**
    Set align for line object's label

    @method _setAlignForLine
    @param {Object} layer
    @param {Object} svg
  */
  _setAlignForLine(layer, text, align, textNode) {
    let { pathLength, textLength } = this._getPathAndTextLength(layer, text);

    if (align === 'center') {
      textNode.setAttribute('dx', ((pathLength / 2) - (textLength / 2)));
    }

    if (align === 'left') {
      textNode.setAttribute('dx', 0);
    }

    if (align === 'right') {
      textNode.setAttribute('dx', (pathLength - textLength - 8));
    }
  },

  /**
    Add text for line object

    @method _addTextForLine
    @param {Object} layer
    @param {String} text
    @param {Object} options
    @param {String} style
  */
  _addTextForLine(layer, text, options, style, partline) {
    let lsvg = L.svg();
    lsvg._initContainer();
    lsvg._initPath(layer);
    let svg = lsvg._container;

    layer._text = text;

    let defaults = {
      fillColor: 'black',
      align: 'left',
      location: 'over'
    };
    options = L.Util.extend(defaults, options);

    layer._textOptions = options;

    if (!text) {
      if (layer._textNode && layer._textNode.parentNode) {
        svg.removeChild(layer._textNode);
        delete layer._text;
      }

      return;
    }

    let id = 'pathdef-' + L.Util.stamp(layer);
    if (partline) {
      id = 'pathdef-' + L.Util.stamp(partline);
    }

    layer._path.setAttribute('id', id);

    let textNode = L.SVG.create('text');
    let textPath = L.SVG.create('textPath');
    let dy = 0;
    let sizeFont = parseInt(this.get('labelSettings.options.captionFontSize'));
    let _lineLocationSelect = this.get('labelSettings.location.lineLocationSelect');

    if (_lineLocationSelect === 'along') {
      dy = Math.ceil(sizeFont / 4);
    }

    if (_lineLocationSelect === 'under') {
      dy = Math.ceil(sizeFont / 2);
    }

    textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id);
    textNode.setAttribute('fill', options.fillColor);
    textNode.setAttribute('style', style);
    textNode.setAttribute('id', 'text-' + id);
    textNode.setAttribute('dy', dy);
    textNode.setAttribute('alignment-baseline', 'baseline');
    textPath.appendChild(document.createTextNode(text));
    textNode.appendChild(textPath);

    this._setLabelLine(layer, svg, partline, text);
    layer._path.setAttribute('stroke-opacity', 0);
    layer._textNode = textNode;
    svg.firstChild.appendChild(layer._path);
    svg.setAttribute('id', 'svg-' + id);
    svg.appendChild(textNode);
    layer._svg = svg;
    let div = L.DomUtil.create('div');
    div.appendChild(svg);
    layer._svgConteiner = div;

    this._setAlignForLine(layer, text, options.align, textNode);
  },

  /**
    Update position for line object's label

    @method _updatePositionLabelForLine
  */
  _updatePositionLabelForLine() {
    let additionalZoomLabel = this.get('additionalZoomLabel');
    let leafletObject = this.returnLeafletObject();

    let _this = this;

    let additionalLabelLayer = null;
    if (additionalZoomLabel) {
      let zoom =  this.get('leafletMap').getZoom();

      let aLayers = additionalZoomLabel.filter(l => { return (l.minZoom == null || l.minZoom <= zoom) && (l.maxZoom == null || l.maxZoom >= zoom); });

      if (aLayers.length > 0) {
        additionalLabelLayer = aLayers[0];
      }
    }

    if (!Ember.isNone(leafletObject)) {
      if (additionalLabelLayer && this.get('leafletMap').hasLayer(additionalLabelLayer)) {
        leafletObject.eachLayer(function (layer) {
          if (!Ember.isNone(layer._path) && !Ember.isEmpty(layer._text)) {
            if (!Ember.isNone(layer._labelAdditional)) {
              // тут бы по идее тоже не для всех обновлять, а для нужного
              layer._labelAdditional.forEach(zoomLabel => {
                if (zoomLabel instanceof L.FeatureGroup) {
                  zoomLabel.getLayers().forEach((label) => {
                    _this._updateAttributesSvg(layer, label._parentLayer, label._svg, label._path);
                  });
                } else {
                  _this._updateAttributesSvg(layer, null, zoomLabel._svg, zoomLabel._path);
                }
              });

            } else {
              _this._updateAttributesSvg(layer, null, layer._label._svg, layer._label._path);
            }
          }
        });
      } else {
        leafletObject.eachLayer(function (layer) {
          if (layer._label) {
            _this._updateAttributesSvg(layer, null, layer._label._svg, layer._label._path);
          }
        });
      }
    }
  },

  _updateAttributesSvg(layer, partline, svg, path) {
    this._setLabelLine(layer, svg, partline, layer._text);
    let d = layer._path.getAttribute('d');
    path.setAttribute('d', d);

    // здесь с префиксом pathdef-
    let id = path.getAttribute('id');

    if (partline) {
      // здесь без префикса pathdef-
      id = 'pathdef-' + L.Util.stamp(partline);
    }

    Ember.$('path#' + id).attr('d', d);
    Ember.$('svg#svg-' + id).attr('width', svg.getAttribute('width'));
    Ember.$('svg#svg-' + id).attr('height', svg.getAttribute('height'));

    let options = layer._textOptions;
    let text = layer._text;
    let textNode = layer._textNode;

    this._setAlignForLine(layer, text, options.align, textNode);
    Ember.$('text#text-' + id).attr('dx', textNode.getAttribute('dx'));
  },

  /**
    Show lables

    @method _showLabels
    @param {Array} layers new layers for add labels
    @param {Object} leafletObject leaflet layer
  */
  _showLabels(layers, leafletObject) {
    let labelSettingsString = this.get('labelSettings.labelSettingsString');
    if (!Ember.isNone(labelSettingsString)) {
      let leafletMap = this.get('leafletMap');
      if (!leafletObject) {
        leafletObject = this.returnLeafletObject();
      }

      let additionalZoomLabel = this.get('additionalZoomLabel');
      if (!Ember.isNone(additionalZoomLabel) && Ember.isNone(leafletObject.additionalZoomLabel)) {
        additionalZoomLabel.forEach(zoomLabels => {
          zoomLabels.clearLayers();
        });
      }

      let _labelsLayer = this.get('_labelsLayer');
      if (!Ember.isNone(_labelsLayer) && Ember.isNone(leafletObject._labelsLayer)) {
        _labelsLayer.clearLayers();
      }

      if (Ember.isNone(_labelsLayer)) {
        _labelsLayer = L.featureGroup();
        let minScaleRange = this.get('labelSettings.scaleRange.minScaleRange') || this.get('minZoom');
        let maxScaleRange = this.get('labelSettings.scaleRange.maxScaleRange') || this.get('maxZoom');
        _labelsLayer.minZoom = minScaleRange;
        _labelsLayer.maxZoom = maxScaleRange;
        _labelsLayer.leafletMap = leafletMap;
        _labelsLayer.getContainer = this.get('_getContainerPane').bind(this);
        leafletObject._labelsLayer = _labelsLayer;

        let additionalZoomSettings = this.get('labelSettings.scaleRange.additionalZoom');
        if (additionalZoomSettings) {
          additionalZoomLabel = Ember.A();
          let i = 0;
          additionalZoomSettings.forEach(zoomSettings => {
            try {
              // to switch combine-layer
              let layerId = !Ember.isNone(this.get('layerId')) ? this.get('layerId') : '';
              let _paneLabel = 'labelLayer' + i + '_' + this.get('layerModel.id') + layerId;
              const _getContainerPaneLabel = function () {
                let className = 'leaflet-' + _paneLabel + '-pane';
                let container = Ember.$(`.${className}`);
                return container[0];
              };

              let labelsLayer = L.featureGroup();
              labelsLayer.minZoom = zoomSettings.minZoom;
              labelsLayer.maxZoom = zoomSettings.maxZoom;
              labelsLayer.check = zoomSettings.check;
              labelsLayer.leafletMap = leafletMap;
              labelsLayer.getContainer = _getContainerPaneLabel.bind(this);
              labelsLayer._paneLabel = _paneLabel;
              additionalZoomLabel.addObject(labelsLayer);
            } catch (e) {
              console.error(e);
            }

            i++;
          });

          leafletObject.additionalZoomLabel = additionalZoomLabel;
          this.set('additionalZoomLabel', additionalZoomLabel);
        }

        if (this.get('typeGeometry') === 'polyline') {
          leafletMap.on('zoomend', this._updatePositionLabelForLine, this);
        }

        // для showExisting не грузим все надписи сразу. слишком много. поэтому приходится догружать при сдвиге карты, как будто это continueLoading,
        // но т.к. в обычном варианте надписи рисуются в featureprocesscallback, то в данной ситуации придется вызывать добавление надписей самостоятельно
        // и для слоев с дополнительными слоями с надписями тоже придется вызвать руками, потому что по прямой логике из featureprocesscallback они уже вызывались
        if (this.get('showExisting') !== false || additionalZoomLabel) {
          leafletMap.on('moveend', this._showLabelsMovingMap, this);
        }
      } else {
        leafletObject.additionalZoomLabel = additionalZoomLabel;
        leafletObject._labelsLayer = _labelsLayer;
      }

      this._createStringLabel(layers, _labelsLayer, additionalZoomLabel);
      if (Ember.isNone(this.get('_labelsLayer'))) {
        this.set('additionalZoomLabel', additionalZoomLabel);
        this.set('_labelsLayer', _labelsLayer);
        this._checkZoomPane();
      }

      if (this.get('typeGeometry') === 'polyline') {
        this._updatePositionLabelForLine();
      }
    }
  },

  /**
    Adds labels to it's leaflet container.

    @method _addLabelsToLeafletContainer
    @param {Array} layers new layers for add labels
    @param {Object} leafletObject leaflet layer
    @private
  */
  _addLabelsToLeafletContainer(layers, leafletObject) {
    let additionalZoomLabel = this.get('additionalZoomLabel');
    let _labelsLayer = this.get('_labelsLayer');

    // чтобы слой нормально выключался в группе,
    // он должен быть в контейнере группы, а не просто в карте
    let leafletContainer = this.get('leafletContainer');

    if (!leafletObject) {
      leafletObject = this.returnLeafletObject();
    }

    let thisPane = this.get('_paneLabel');
    if (thisPane) {
      let leafletMap = this.get('leafletMap');
      if (thisPane && !Ember.isNone(leafletMap)) {
        let pane = leafletMap.getPane(thisPane);
        if (!pane || Ember.isNone(pane)) {
          this._createPane(thisPane);
          this._setLayerZIndex();
        }
      }
    }

    if (Ember.isNone(_labelsLayer)) {
      this._showLabels(layers, leafletObject);
      _labelsLayer = this.get('_labelsLayer');
      leafletContainer.addLayer(_labelsLayer);

      additionalZoomLabel = this.get('additionalZoomLabel');
      if (additionalZoomLabel && additionalZoomLabel.length > 0) {
        this._additionalZoomLabelPane();
        additionalZoomLabel.forEach(zoomLabels => {
          leafletContainer.addLayer(zoomLabels);
        });
      }
    } else if (!leafletContainer.hasLayer(_labelsLayer)) {
      leafletContainer.addLayer(_labelsLayer);
      if (additionalZoomLabel && additionalZoomLabel.length > 0) {
        additionalZoomLabel.forEach(zoomLabels => {
          if (zoomLabels && !leafletContainer.hasLayer(zoomLabels)) {
            leafletContainer.addLayer(zoomLabels);
          }
        });
      }
    } else {
      this._showLabels(layers, leafletObject);
      this._additionalZoomLabelPane();
    }
  },

  /**
    Create pane for additional labels.

    @method _additionalZoomLabelPane
    @private
  */
  _additionalZoomLabelPane() {
    let additionalZoomLabel = this.get('additionalZoomLabel');
    if (additionalZoomLabel) {
      additionalZoomLabel.forEach(zoomLabels => {
        let thisPane = zoomLabels._paneLabel;
        if (thisPane) {
          let leafletMap = this.get('leafletMap');
          if (thisPane && !Ember.isNone(leafletMap)) {
            let pane = leafletMap.getPane(thisPane);
            if (!pane || Ember.isNone(pane)) {
              this._createPane(thisPane);
              this._setLayerZIndex();
            }
          }
        }
      });
    }
  },

  /**
    Sets leaflet layer's visibility.

    @method _setLayerVisibility
    @private
  */
  _setLayerVisibilityLabel(leafletObject) {
    if (this.get('labelSettings.signMapObjects') && !Ember.isNone(this.get('_labelsLayer')) &&
        !Ember.isNone(Ember.get(leafletObject, '_labelsLayer'))) {

      // _setLayerVisibility method handles <load> action of default wfs-layer
      // For L.MarkerClusterGroup there is <updateClusterLayer> handler that defines label visibility in its own way
      if (!(this.get('_leafletObject') instanceof L.MarkerClusterGroup)) {
        this._addLabelsToLeafletContainer();
      }

      this._checkZoomPane();
      if (this.get('typeGeometry') === 'polyline') {
        this._updatePositionLabelForLine();
      }
    }
  },
});
