import Ember from 'ember';
import jsts from 'npm:jsts';
import { checkMapZoom } from '../utils/check-zoom';

export default Ember.Mixin.create({
  /**
    Array with labels layers

    @property labelsLayers
    @type Array
    @default null
  */
  labelsLayers: null,

  /**
    Sets leaflet layer's zindex.

    @method _setLayerZIndex
    @private
  */
  _setLayerLabelZIndex: function (begIndex) {
    let labelsLayers = this.get('labelsLayers');
    let leafletMap = this.get('leafletMap');
    if (labelsLayers) {
      labelsLayers.forEach(labelsLayer => {
        let _paneLabel = labelsLayer._paneLabel;
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
    let labelsLayers = leafletObject.labelsLayers;
    let map = this.get('leafletMap');
    if (layer.get('settingsAsObject.labelSettings.signMapObjects') && !Ember.isNone(labelsLayers)) {
      labelsLayers.forEach(labelsLayer => {
        if (map.hasLayer(labelsLayer)) {
          labelsLayer.eachLayer(function (labelLayer) {
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
    let labelsLayers = leafletObject.labelsLayers;
    let map = this.get('leafletMap');
    if (layer.get('settingsAsObject.labelSettings.signMapObjects') && !Ember.isNone(labelsLayers)) {
      labelsLayers.forEach(labelsLayer => {
        if (map.hasLayer(labelsLayer)) {
          labelsLayer.eachLayer(function (labelLayer) {
            if (map.hasLayer(labelLayer)) {
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
    let labelsLayers = leafletObject.labelsLayers;
    if (layer.get('settingsAsObject.labelSettings.signMapObjects') && !Ember.isNone(labelsLayers)) {
      objectIds.forEach(objectId => {
        labelsLayers.forEach(labelsLayer => {
          let objects = Object.values(labelsLayer._layers).filter(shape => {
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
  },

  /**
    Reload layer label.

    @method reloadLabel
    @private
  */
  reloadLabel(leafletObject) {
    let map = this.get('leafletMap');
    if (this.get('labelSettings.signMapObjects') && !Ember.isNone(this.get('labelsLayers')) &&
      !Ember.isNone(leafletObject.labelsLayers)) {
      this.get('labelsLayers').forEach(labelsLayer => {
        labelsLayer.eachLayer((layerShape) => {
          if (map.hasLayer(layerShape)) {
            map.removeLayer(layerShape);
          }
        });
        labelsLayer.clearLayers();
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
    let labelsLayers = this.get('labelsLayers');
    if (labelsLayers) {
      labelsLayers.forEach(labelsLayer => {
        let _paneLabel = labelsLayer && labelsLayer._paneLabel;
        if (this.get('labelSettings.signMapObjects') && !Ember.isNone(leafletMap) && _paneLabel && !Ember.isNone(leafletObject)) {
          let pane = leafletMap.getPane(_paneLabel);
          let mapPane = leafletMap._mapPane;
          if (!Ember.isNone(mapPane) && !Ember.isNone(pane)) {
            let existPaneDomElem = Ember.$(mapPane).children(`[class*='${_paneLabel}']`).length;
            if (existPaneDomElem > 0 && !checkMapZoom(labelsLayer)) {
              L.DomUtil.remove(pane);
            } else if (existPaneDomElem === 0 && checkMapZoom(labelsLayer)) {
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
  _applyProperty(str, layer, leafletObject) {
    let hasReplace = false;
    let propName;

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
      for (let prop of propName) {
        let property = prop.innerHTML;
        if (prop.localName !== 'propertyname') {
          property = prop.innerText;
        }

        if (property && layer.feature.properties && layer.feature.properties.hasOwnProperty(property)) {
          str = this._labelValue(layer, property, prop, str, leafletObject);
        }
      }
    }

    if (hasReplace) {
      return str.replaceAll('\\"', '"').replaceAll('\\(', '(').replaceAll('\\)', ')');
    } else {
      return str;
    }
  },

  _labelValue(layer, property, prop, str, leafletObject) {
    if (Ember.isNone(leafletObject)) {
      leafletObject = this.returnLeafletObject();
    }

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

    return str;
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
      for (let item of func) {
        let nameFunc = Ember.$(item).attr('name');
        if (!Ember.isNone(nameFunc)) {
          nameFunc = Ember.$(item).attr('name').replaceAll('\\"', '');
          if (nameFunc === 'toFixed') {
            str = this._toFixedFunction(item, str);
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

  _toFixedFunction(item, str) {
    let attr = Ember.$(item).attr('attr').replaceAll('\\"', '');
    let property = item.innerHTML;
    let numProp = Number.parseFloat(property);
    let numAttr = Number.parseFloat(attr);
    if (!Ember.isNone(attr) && !Ember.isNone(property) && !Number.isNaN(numProp) && !Number.isNaN(numAttr)) {
      let newStr = numProp.toFixed(numAttr);
      str = str.replace(item.outerHTML, newStr);
    }

    return str;
  },

  /**
    Show labels when map moving
    @method _showLabelsMovingMap
  */
  _showLabelsMovingMap() {
    let leafletObject = this.returnLeafletObject();
    this._createStringLabel(leafletObject.getLayers(), leafletObject);
  },

  /**
    Create label string for every object of layer.

    @method _createStringLabel
    @param {Array} layers new layers for add labels
  */
  _createStringLabel(layers, leafletObject) {
    if (layers) {
      let labelsLayerZoom = this._getLabelsLayersZoom();
      if (labelsLayerZoom) {
        let optionsLabel = labelsLayerZoom.settings.options;
        let labelSettingsString = labelsLayerZoom.settings.labelSettingsString;
        let haloColor = Ember.get(optionsLabel, 'captionFontHalo');
        let halo = !Ember.isNone(haloColor) ? `-webkit-text-stroke: 1px ${haloColor}; text-stroke: 1px ${haloColor};` : '';
        let style = Ember.String.htmlSafe(
          `font-family: ${Ember.get(optionsLabel, 'captionFontFamily')}; ` +
          `font-size: ${Ember.get(optionsLabel, 'captionFontSize')}px; ` +
          `font-weight: ${Ember.get(optionsLabel, 'captionFontWeight')}; ` +
          `font-style: ${Ember.get(optionsLabel, 'captionFontStyle')}; ` +
          `text-decoration: ${Ember.get(optionsLabel, 'captionFontDecoration')}; ` +
          `color: ${Ember.get(optionsLabel, 'captionFontColor')}; ` +
          `text-align: ${Ember.get(optionsLabel, 'captionFontAlign')};${halo}`);

        this._checkLabelInView(layers, labelsLayerZoom).forEach(layer => {
          let label = layer.labelValue || this._applyFunction(this._applyProperty(labelSettingsString, layer, leafletObject));
          this._createLabel(label, layer, style, labelsLayerZoom);
        });
      }
    }
  },

  _checkLabelInView(layers, labelsLayerZoom, checkExist = true) {
    let leafletMap = this.get('leafletMap');
    let currentLabelExists = false;
    let bbox = leafletMap.getBounds();
    let zoom = Number(leafletMap.getZoom().toFixed(1));
    return layers.filter((layer) => {
      if (labelsLayerZoom && layer._label) {
        currentLabelExists = layer._label.filter(l => {
          return (l.minZoom == null || l.minZoom <= zoom) && (l.maxZoom == null || l.maxZoom >= zoom);
        }).length > 0;
      } else {
        currentLabelExists = !Ember.isNone(layer._label);
      }

      currentLabelExists = checkExist && currentLabelExists;

      let showExisting = this.get('showExisting');
      let intersectBBox = layer.getBounds ? bbox.intersects(layer.getBounds()) : bbox.contains(layer.getLatLng());
      let staticLoad = showExisting !== false && intersectBBox;
      return !currentLabelExists && (showExisting === false || staticLoad);
    });
  },

  /**
    Create label for object of layer.

    @method _createLabel
    @param {String} text
    @param {Object} layer
    @param {String} style
    @param {Object} labelsLayer
  */
  _createLabel(text, layer, style, labelsLayerZoom) {
    if (Ember.isEmpty(text) || Ember.isEmpty(layer)) {
      return;
    }

    let lType = layer.toGeoJSON().geometry.type;

    if (lType.indexOf('Polygon') !== -1) {
      this._createLabelForPolygon(text, layer, style, labelsLayerZoom);
    }

    if (lType.indexOf('Point') !== -1) {
      this._createLabelForPoint(text, layer, style, labelsLayerZoom);
    }

    if (lType.indexOf('LineString') !== -1) {
      this._createLabelForPolyline(text, layer, style, labelsLayerZoom);
    }
  },

  _createLabelForPoint(text, layer, style, labelsLayerZoom) {
    let latlng = layer.getLatLng();
    let iconWidth = 30;
    let iconHeight = 30;
    let positionPoint = this._setPositionPoint(iconWidth, iconHeight, labelsLayerZoom.settings);
    let anchor = positionPoint.anchor;
    let className = 'label';
    className += ' point ' + positionPoint.cssClass;
    let html = '<div style="' + style + positionPoint.style + '">' + text + '</div>';
    let optionsMarker = this._optionsMarker(latlng, className, html, positionPoint.iconSize, anchor);
    let label = this._createLabelMarker(layer, optionsMarker, labelsLayerZoom._paneLabel);
    this._addLabel(label, labelsLayerZoom, layer);
  },

  _createLabelForPolygon(text, layer, style, labelsLayerZoom) {
    let latlng = null;
    let iconWidth = 40;
    let iconHeight = 40;

    let labelSize = labelsLayerZoom.settings.size;
    if (labelSize) {
      iconWidth = labelSize[0];
      iconHeight = labelSize[1];
    }

    let anchor = null;
    let html = '';
    let label;

    let geojsonWriter = new jsts.io.GeoJSONWriter();
    let className = 'label polygon';

    let multi = labelsLayerZoom.settings.multi;
    let objJsts = layer.toJsts(L.CRS.EPSG4326);

    try {
      if (multi) {
        label = this._polygonMultiLabel(layer, style, text, labelsLayerZoom);
      }

      // если либо нет настройки, либо нет составных частей
      if (!label) {
        let centroidJsts = objJsts.isValid() ? objJsts.getInteriorPoint() : objJsts.getCentroid();
        let centroid = geojsonWriter.write(centroidJsts);
        latlng = L.latLng(centroid.coordinates[1], centroid.coordinates[0]);
        html = '<div style="' + style + '">' + text + '</div>';

        let paneLabel = labelsLayerZoom._paneLabel;
        let optionsMarker = this._optionsMarker(latlng, className, html, [iconWidth, iconHeight], anchor);

        // возможно тут тоже надо будет сделать L.featureGroup()
        label = this._createLabelMarker(layer, optionsMarker, paneLabel);
      }
    }
    catch (e) {
      console.error(e.message + ': ' + layer.toGeoJSON().id);
    }

    if (!label) {
      return;
    }

    label.minZoom = labelsLayerZoom.minZoom;
    label.maxZoom = labelsLayerZoom.maxZoom;

    if (!layer._label) {
      layer._label = Ember.A();
    }

    layer._label.addObject(label);

    // adding labels to layers
    this._addLabelsToLayers(labelsLayerZoom, label);
  },

  _polygonMultiLabel(layer, style, text, labelsLayerZoom) {
    let latlng = null;
    let iconWidth = 40;
    let iconHeight = 40;

    let labelSize = labelsLayerZoom.settings.size;
    if (labelSize) {
      iconWidth = labelSize[0];
      iconHeight = labelSize[1];
    }

    let anchor = null;
    let html = '';
    let className = 'label polygon multi';
    let label;
    let geojsonWriter = new jsts.io.GeoJSONWriter();
    let objJsts = layer.toJsts(L.CRS.EPSG4326);
    let countGeometries = objJsts.getNumGeometries();
    if (countGeometries > 1) { // сюда попадаем только если нужны мультинадписи и по настройке и по факту
      label = L.featureGroup();
      for (let i = 0; i < countGeometries; i++) {
        let polygonN = objJsts.getGeometryN(i);
        let centroidNJsts = polygonN.isValid() ? polygonN.getInteriorPoint() : polygonN.getCentroid();

        let centroidN = geojsonWriter.write(centroidNJsts);
        latlng = L.latLng(centroidN.coordinates[1], centroidN.coordinates[0]);
        html = '<div style="' + style + '">' + text + '</div>';
        let optionsMarker = this._optionsMarker(latlng, className, html, [iconWidth, iconHeight], anchor);
        let labelN = this._createLabelMarker(layer, optionsMarker, labelsLayerZoom._paneLabel);
        label.addLayer(labelN);
      }

      label.feature = layer.feature;
      label.leafletMap = this.get('leafletMap');
    }

    return label;
  },

  _createLabelForPolyline(text, layer, style, labelsLayerZoom) {
    let latlng = null;
    let iconWidth = 10;
    let iconHeight = 40;
    let anchor = null;
    let html = '';

    let label;
    let geojsonWriter = new jsts.io.GeoJSONWriter();
    let optionsLabel = labelsLayerZoom.settings.options;
    let className = 'label';

    let multi = labelsLayerZoom.settings.multi;

    let options = {
      fillColor: Ember.get(optionsLabel, 'captionFontColor'),
      align: Ember.get(optionsLabel, 'captionFontAlign'),
      haloColor: Ember.get(optionsLabel, 'captionFontHalo'),
      fontSize: Ember.get(optionsLabel, 'captionFontSize')
    };

    try {
      let objJsts = layer.toJsts(L.CRS.EPSG4326);
      let countGeometries = objJsts.getNumGeometries();

      if (countGeometries > 1) { // для мультилинии у первого кусочка надпись будет вне зависимости от флага multi
        if (multi) {
          label = L.featureGroup();
          label.feature = layer.feature;
          label.leafletMap = this.get('leafletMap');
        }

        for (let i = 0; i < (multi ? countGeometries : 1); i++) {
          let partlineJsts = objJsts.getGeometryN(i);
          let partlineGeoJson = geojsonWriter.write(partlineJsts);
          let partline = L.geoJSON(partlineGeoJson).getLayers()[0];

          let bboxJstsN = partlineJsts.getEnvelope();
          let bboxGeoJsonN = geojsonWriter.write(bboxJstsN);
          let bbox = L.geoJSON(bboxGeoJsonN).getLayers()[0];
          latlng = L.latLng(bbox._bounds._northEast.lat, bbox._bounds._southWest.lng);

          layer._svgConteiner = null;
          this._addTextForLine(layer, text, options, style, partline, labelsLayerZoom.settings);
          iconWidth = 12;
          iconHeight = 12;
          html = Ember.$(layer._svgConteiner).html();
          let optionsMarker = this._optionsMarker(latlng, className, html, [iconWidth, iconHeight], anchor);

          if (multi) {
            let labelN = this._createLabelMarker(layer, optionsMarker, labelsLayerZoom._paneLabel);
            labelN._parentLayer = partline;

            label.addLayer(labelN);
          } else {
            label = this._createLabelMarker(layer, optionsMarker, labelsLayerZoom._paneLabel);
          }
        }
      } else {
        latlng = L.latLng(layer._bounds._northEast.lat, layer._bounds._southWest.lng);

        this._addTextForLine(layer, text, options, style, null, labelsLayerZoom.settings);
        iconWidth = 12;
        iconHeight = 12;
        html = Ember.$(layer._svgConteiner).html();

        let optionsMarker = this._optionsMarker(latlng, className, html, [iconWidth, iconHeight], anchor);
        label = this._createLabelMarker(layer, optionsMarker, labelsLayerZoom._paneLabel);
      }
    }
    catch (e) {
      console.error(e.message + ': ' + layer.toGeoJSON().id);
    }

    this._addLabel(label, labelsLayerZoom, layer);
  },

  _optionsMarker(latlng, className, html, iconSize, anchor) {
    return {
      latlng,
      className,
      html,
      iconSize,
      anchor
    };
  },

  _addLabel(label, labelsLayerZoom, layer) {
    if (!label) {
      return;
    }

    label.minZoom = labelsLayerZoom.minZoom;
    label.maxZoom = labelsLayerZoom.maxZoom;

    if (!layer._label) {
      layer._label = Ember.A();
    }

    layer._label.addObject(label);

    // adding labels to layers
    this._addLabelsToLayers(labelsLayerZoom, label);
  },

  _createLabelMarker(layer, options, pane) {
    let leafletMap = this.get('leafletMap');
    let paramsDivIcon = {
      className: options.className,
      html: options.html,
      iconSize: options.iconSize,
      iconAnchor: options.anchor
    };
    let icon = L.divIcon(paramsDivIcon);
    let paramsMarker = {
      icon: icon,
      zIndexOffset: 1000,
      pane: pane
    };
    let label = L.marker(options.latlng, paramsMarker);

    if (layer._path) {
      label._path = layer._path;
      label._textNode = layer._textNode;
      label._svg = layer._svg;
      label._svgConteiner = layer._svgConteiner;
    }

    label.style = {
      className: options.className,
      html: options.html,
      iconSize: [options.iconWidth, options.iconHeight]
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

  _positionMax(maxPosition, position) {
    if (position >= maxPosition) {
      return position;
    }

    return maxPosition;
  },

  _positionMin(minPosition, position) {
    if (position >= minPosition) {
      return position;
    }

    return minPosition;
  },

  _defaultMarkerOptions(locationPoint) {
    return {
      iconSize: [25, 41],
      iconAnchor: locationPoint.indexOf('over') >= 0 ? [12, 41] : [12, 20]
    };
  },

  _positionForComboStyle(stylesMarker, locationPoint) {
    let leftMin = 0;
    let rightMax = 0;
    let topMin = 0;
    let bottomMax = 0;
    let widthMax = 0;
    let heightMax = 0;

    let left = 0;
    let right = 0;
    let top = 0;
    let bottom = 0;
    let width = 0;
    let height = 0;
    stylesMarker.forEach(styleMarker => {
      let style = styleMarker.style;
      if (styleMarker.type === 'default') {
        style = this._defaultMarkerOptions(locationPoint);
      }

      if (!Ember.isNone(style)) {
        let iconSize = style.iconSize;
        let iconAnchor = style.iconAnchor;
        if (!Ember.isNone(iconAnchor) && iconAnchor.length === 2 && !Ember.isNone(iconSize) && iconSize.length === 2) {
          left = iconAnchor[0] || 0;
          right = (iconSize[0] || 0) - (iconAnchor[0] || 0);
          top = iconAnchor[1] || 0;
          bottom = (iconSize[1] || 0) - (iconAnchor[1] || 0);
          width = iconSize[0];
          height = iconSize[1];
          leftMin = this._positionMin(leftMin, left);
          rightMax = this._positionMax(rightMax, right);
          topMin = this._positionMin(topMin, top);
          bottomMax = this._positionMax(bottomMax, bottom);
          widthMax = this._positionMax(widthMax, width);
          heightMax = this._positionMax(heightMax, height);
        }
      }
    });

    return {
      left: leftMin,
      right: rightMax,
      top: topMin,
      bottom: bottomMax,
      width: widthMax,
      height: heightMax
    };
  },

  /**
    Set position for point.

    @method _setPositionPoint
    @param {Number} width
    @param {Number} height
    @param {Object} settingsLabel
  */
  _setPositionPoint(width, height, settingsLabel) {
    // значения для маркера по умолчанию
    let left = 12.5;
    let right = 12.5;
    let top = 20.5;
    let bottom = 0;

    let stylesMarker = this.get('styleSettings.style.marker');
    if (stylesMarker && Ember.isArray(stylesMarker) && stylesMarker.length > 0) {
      let options = this._positionForComboStyle(stylesMarker, settingsLabel.location.locationPoint);
      left = options.left;
      right = options.right;
      top = options.top;
      bottom = options.bottom;
      width = options.width;
      height = options.height;
    } else {
      let style = stylesMarker.style;
      if (stylesMarker.type === 'default') {
        style = this._defaultMarkerOptions(settingsLabel.location.locationPoint);
      }

      let iconSize = style.iconSize;
      let iconAnchor = style.iconAnchor;
      if (!Ember.isNone(iconAnchor) && iconAnchor.length === 2 && !Ember.isNone(iconSize) && iconSize.length === 2) {
        left = iconAnchor[0] || 0;
        right = (iconSize[0] || 0) - (iconAnchor[0] || 0);
        top = iconAnchor[1] || 0;
        bottom = (iconSize[1] || 0) - (iconAnchor[1] || 0);
        width = iconSize[0] || 0;
        height = iconSize[1] || 0;
      }
    }

    let style;
    let anchor;
    let cssClass;

    switch (settingsLabel.location.locationPoint) {
      case 'overLeft':
        style = 'text-align: right;';
        anchor = [left + width - 2, top + height - 2];
        cssClass = 'over left';
        break;
      case 'overRight':
        style = 'text-align: left;';
        anchor = [-1 * right + 2, top + height - 2];
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
        anchor = [left + width, -1 * bottom + 2];
        cssClass = 'under left';
        break;
      case 'underMiddle':
        style = 'text-align: center;';
        anchor = [Math.round((width - (right - left)) / 2), -1 * bottom + 2];
        cssClass = 'under middle';
        break;
      case 'underRight':
        style = 'text-align: left;';
        anchor = [-1 * right, -1 * bottom + 2];
        cssClass = 'under right';
        break;
      default: // and overMiddle
        style = 'text-align: center;';
        anchor = [Math.round((width - (right - left)) / 2), top + height - 2];
        cssClass = 'over middle';
        break;
    }

    let iconSize = [width, height];

    return { style, anchor, cssClass, iconSize };
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

  _getRings(lType, latlngArr) {
    let leafletMap = this.get('leafletMap');
    let rings = [];
    let begCoord;
    let endCoord;
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

    return rings;
  },

  /**
    Set label for line object

    @method _setLabelLine
    @param {Object} layer
    @param {Object} svg
  */
  _setLabelLine(layer, svg, partline, text, settingsLabel) {
    let latlngArr = partline ? partline.getLatLngs() : layer.getLatLngs();
    let lType = (!partline) ? layer.toGeoJSON().geometry.type : partline.toGeoJSON().geometry.type;
    let rings = this._getRings(lType, latlngArr);

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

    let { textLength } = this._getPathAndTextLength(layer, text, settingsLabel);
    let options = { buffer, minX, minY, maxX, maxY };
    let d = this._calcPath(rings, options, layerPathLength, textLength);

    layer._path.setAttribute('d', d);
    svg.setAttribute('width', maxX + buffer + 'px');
    svg.setAttribute('height', maxY + buffer + 'px');

    // компенсируем сдвиг
    svg.setAttribute('style', 'margin: -' + buffer + 'px 0 0 -' + buffer + 'px');
  },

  _calcPath(rings, options, layerPathLength, textLength) {
    let d = '';
    let kx = options.minX - 6;
    let ky = options.minY - 6;
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

      x = x - kx + options.buffer;
      y = y - ky + options.buffer;

      if (x > options.maxX) {
        options.maxX = x;
      }

      if (y > options.maxY) {
        options.maxY = y;
      }

      d += x + ' ' + y;
    }

    return d;
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

  _getPathAndTextLength(layer, text, settingsLabel) {
    let pathLength = layer._path.getTotalLength();
    let optionsLabel = settingsLabel.options;
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
  _setAlignForLine(layer, text, align, textNode, settingsLabel) {
    let { pathLength, textLength } = this._getPathAndTextLength(layer, text, settingsLabel);

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
    Calculate radius for halo by font size.

    @method _haloRadiusByFontSize
    @param {String} size
  */
  _haloRadiusByFontSize(size) {
    switch (size) {
      case '8':
      case '9':
      case '10':
        return '0.02%';
      case '11':
      case '12':
        return '0.03%';
      case '14':
      case '15':
      case '16':
        return '0.04%';
      case '18':
      case '20':
        return '0.06%';
      case '22':
      case '24':
        return '0.08%';
      case '26':
      case '28':
        return '0.1%';
      case '36':
        return '0.15%';
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
  _addTextForLine(layer, text, options, style, partline, settingsLabel) {
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
    let sizeFont = parseInt(settingsLabel.options.captionFontSize);
    let _lineLocationSelect = settingsLabel.location.lineLocationSelect;

    if (_lineLocationSelect === 'along') {
      dy = Math.ceil(sizeFont / 4);
    }

    if (_lineLocationSelect === 'under') {
      dy = Math.ceil(sizeFont / 2);
    }

    textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id);
    textNode.setAttribute('fill', options.fillColor);
    if (options.haloColor) {
      let size = this._haloRadiusByFontSize(options.fontSize);
      textNode.setAttribute('stroke-width', size);
      textNode.setAttribute('stroke', options.haloColor);
    }

    textNode.setAttribute('style', style);
    textNode.setAttribute('id', 'text-' + id);
    textNode.setAttribute('dy', dy);
    textNode.setAttribute('alignment-baseline', 'baseline');
    textPath.appendChild(document.createTextNode(text));
    textNode.appendChild(textPath);

    this._setLabelLine(layer, svg, partline, text, settingsLabel);
    layer._path.setAttribute('stroke-opacity', 0);
    layer._textNode = textNode;
    svg.firstChild.appendChild(layer._path);
    svg.setAttribute('id', 'svg-' + id);
    svg.appendChild(textNode);
    layer._svg = svg;
    let div = L.DomUtil.create('div');
    div.appendChild(svg);
    layer._svgConteiner = div;

    this._setAlignForLine(layer, text, options.align, textNode, settingsLabel);
  },

  _getLabelsLayersZoom() {
    let labelsLayers = this.get('labelsLayers');
    let labelsLayersZoom = null;
    let zoom =  Number(this.get('leafletMap').getZoom().toFixed(1));
    if (labelsLayers) {
      let aLayers = labelsLayers.filter(l => { return (l.minZoom == null || l.minZoom <= zoom) && (l.maxZoom == null || l.maxZoom >= zoom); });

      if (aLayers.length > 0) {
        labelsLayersZoom = aLayers[0];
      }
    }

    return labelsLayersZoom;
  },

  /**
    Update position for line object's label

    @method _updatePositionLabelForLine
  */
  _updatePositionLabelForLine() {
    let leafletObject = this.returnLeafletObject();
    let _this = this;
    let labelsLayersZoom = this._getLabelsLayersZoom();

    if (!Ember.isNone(leafletObject) && labelsLayersZoom && this.get('leafletMap').hasLayer(labelsLayersZoom)) {
      // обновлять будем только то что видно
      this._checkLabelInView(leafletObject.getLayers(), labelsLayersZoom, false).forEach(layer => {
        if (!Ember.isNone(layer._path) && !Ember.isEmpty(layer._text) && !Ember.isNone(layer._label)) {
          layer._label.forEach(zoomLabel => {
            if (zoomLabel instanceof L.FeatureGroup) {
              zoomLabel.getLayers().forEach((label) => {
                _this._updateAttributesSvg(layer, label._parentLayer, label._svg, label._path, labelsLayersZoom.settings);
              });
            } else {
              _this._updateAttributesSvg(layer, null, zoomLabel._svg, zoomLabel._path, labelsLayersZoom.settings);
            }
          });
        }
      });
    }
  },

  /**
    Update position for marker object's label

    @method _updatePositionLabelForLine
  */
  _updatePositionLabelForMarker() {
    let leafletObject = this.returnLeafletObject();
    let _this = this;
    let labelsLayersZoom = this._getLabelsLayersZoom();

    if (!Ember.isNone(leafletObject) && labelsLayersZoom && this.get('leafletMap').hasLayer(labelsLayersZoom)) {
      // обновлять будем только то что видно
      this._checkLabelInView(leafletObject.getLayers(), labelsLayersZoom, false).forEach(layer => {
        if (!Ember.isNone(layer._icon) && !Ember.isNone(layer._label)) {
          layer._label.forEach(zoomLabel => {
            if (zoomLabel instanceof L.FeatureGroup) {
              zoomLabel.getLayers().forEach((label) => {
                _this._updateAttributesMarker(label, labelsLayersZoom.settings);
              });
            } else {
              _this._updateAttributesMarker(zoomLabel, labelsLayersZoom.settings);
            }
          });
        }
      });
    }
  },

  _updateAttributesMarker(label, settings) {
    let options = this._setPositionPoint(label.options.icon.options.iconSize[0],
      label.options.icon.options.iconSize[1], settings);

    let icon = label.getIcon();
    icon.options.iconAnchor = options.anchor;
    icon.options.iconSize = options.iconSize;
    icon.options.className = 'label point ' + options.cssClass;
    label.setIcon(icon);
  },

  _updateAttributesSvg(layer, partline, svg, path, settingsLabel) {
    this._setLabelLine(layer, svg, partline, layer._text, settingsLabel);
    let d = layer._path.getAttribute('d');
    path.setAttribute('d', d);

    // здесь с префиксом pathdef-
    let id = path.getAttribute('id');

    if (partline) {
      // здесь без префикса pathdef-
      id = 'pathdef-' + L.Util.stamp(partline);
    }

    Ember.$('path#' + id).attr('d', d);

    let text = layer._text;
    let textNode = layer._textNode;

    this._setAlignForLine(layer, text, settingsLabel.options.captionFontAlign, textNode, settingsLabel);
    Ember.$('text#text-' + id).attr('dx', textNode.getAttribute('dx'));

    let buffer = 150;
    let pathElement = document.getElementById(id);
    if (pathElement) {
      let bbox = pathElement.getBBox();
      layer._svg.setAttribute('height', bbox.height + buffer);
      layer._svg.setAttribute('width', bbox.width + buffer);
      let svgElement = document.getElementById(Ember.$(layer._svg)[0].getAttribute('id'));
      if (svgElement) {
        svgElement.setAttribute('height', bbox.height + buffer);
        svgElement.setAttribute('width', bbox.width + buffer);
      }
    }
  },

  _createLabelsLayerOldSettings(labelsLayersArray) {
    let i = 0;
    let labelLayer = this._commonSettingsLabelsLayer(i);
    let minScaleRange = this.get('labelSettings.scaleRange.minScaleRange') || this.get('minZoom');
    let maxScaleRange = this.get('labelSettings.scaleRange.maxScaleRange') || this.get('maxZoom');
    labelLayer.minZoom = minScaleRange;
    labelLayer.maxZoom = maxScaleRange;
    labelLayer.settings = this.get('labelSettings');
    labelLayer.settings.multi = false;
    labelsLayersArray.addObject(labelLayer);
    i++;

    let additionalZoomSettings = this.get('labelSettings.scaleRange.additionalZoom');
    if (additionalZoomSettings) {
      additionalZoomSettings.forEach(zoomSettings => {
        let labelLayer = this._commonSettingsLabelsLayer(i);
        labelLayer.minZoom = zoomSettings.minZoom;
        labelLayer.maxZoom = zoomSettings.maxZoom;
        labelLayer.check = zoomSettings.check;
        labelLayer.settings = Object.assign({}, this.get('labelSettings'));
        labelLayer.settings.multi = zoomSettings.check === 'multi';
        labelsLayersArray.addObject(labelLayer);

        i++;
      });
    }
  },

  _createLabelsLayer(labelsLayersArray) {
    let labelSettings = this.get('labelSettings.rules');
    let i = 0;
    labelSettings.forEach(settings => {
      let labelsLayer = this._commonSettingsLabelsLayer(i);
      labelsLayer.minZoom = settings.scaleRange.minScaleRange;
      labelsLayer.maxZoom = settings.scaleRange.maxScaleRange;
      labelsLayer.settings = settings;
      labelsLayersArray.addObject(labelsLayer);
      i++;
    });
  },

  _commonSettingsLabelsLayer(i) {
    let labelsLayer = L.featureGroup();
    labelsLayer.leafletMap = this.get('leafletMap');
    let layerId = !Ember.isNone(this.get('layerId')) ? this.get('layerId') : '';
    let _paneLabel = 'labelLayer' + i + '_' + this.get('layerModel.id') + layerId;
    const _getContainerPaneLabel = function () {
      let className = 'leaflet-' + _paneLabel + '-pane';
      let container = Ember.$(`.${className}`);
      return container[0];
    };

    labelsLayer.getContainer = _getContainerPaneLabel.bind(this);
    labelsLayer._paneLabel = _paneLabel;

    return labelsLayer;
  },

  _labelsLayersCreate(leafletObject) {
    let labelsLayers = this.get('labelsLayers');
    let leafletMap = this.get('leafletMap');

    if (Ember.isNone(labelsLayers)) {
      let labelsLayersArray = Ember.A();

      let rules = this.get('labelSettings.rules');
      if (!Ember.isNone(rules)) {
        this._createLabelsLayer(labelsLayersArray);
      } else {
        this._createLabelsLayerOldSettings(labelsLayersArray);
      }

      leafletObject.labelsLayers = labelsLayersArray;
      this.set('labelsLayers', labelsLayersArray);

      if (this.get('typeGeometry') === 'polyline') {
        leafletMap.on('zoomend', this._updatePositionLabelForLine, this);
      } else if (this.get('typeGeometry') === 'marker') {
        leafletMap.on('zoomend', this._updatePositionLabelForMarker, this);
      }

      // для showExisting не грузим все надписи сразу. слишком много. поэтому приходится догружать при сдвиге карты, как будто это continueLoading,
      // но т.к. в обычном варианте надписи рисуются в featureprocesscallback, то в данной ситуации придется вызывать добавление надписей самостоятельно
      // и для слоев с дополнительными слоями с надписями тоже придется вызвать руками, потому что по прямой логике из featureprocesscallback они уже вызывались
      if (this.get('showExisting') !== false || labelsLayersArray) {
        leafletMap.on('moveend', this._showLabelsMovingMap, this);
      }
    } else {
      leafletObject.labelsLayers = labelsLayers;
    }
  },

  /**
    Show lables

    @method _showLabels
    @param {Array} layers new layers for add labels
    @param {Object} leafletObject leaflet layer
  */
  _showLabels(layers, leafletObject) {
    let labelSettingsString = this.get('labelSettings.labelSettingsString');
    let rules = this.get('labelSettings.rules');
    if (!leafletObject) {
      leafletObject = this.returnLeafletObject();
    }

    if (!Ember.isNone(labelSettingsString) || !Ember.isNone(rules)) {
      let labelsLayers = this.get('labelsLayers');
      if (!Ember.isNone(labelsLayers) && Ember.isNone(leafletObject.labelsLayers)) {
        labelsLayers.forEach(labelLayer => {
          labelLayer.clearLayers();
        });
      }

      this._labelsLayersCreate(leafletObject);
      labelsLayers = this.get('labelsLayers');
      this._createStringLabel(layers, leafletObject);
      if (Ember.isNone(this.get('labelsLayers'))) {
        this.set('labelsLayers', labelsLayers);
        this._checkZoomPane();
      }

      if (this.get('typeGeometry') === 'polyline') {
        this._updatePositionLabelForLine();
      } else if (this.get('typeGeometry') === 'marker') {
        this._updatePositionLabelForMarker();
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
    let labelsLayers = this.get('labelsLayers');

    // чтобы слой нормально выключался в группе,
    // он должен быть в контейнере группы, а не просто в карте
    let leafletContainer = this.get('leafletContainer');

    if (!leafletObject) {
      leafletObject = this.returnLeafletObject();
    }

    let notInMapLabels = this._containerHasLabelsLayers();

    if (Ember.isNone(labelsLayers)) {
      this._showLabels(layers, leafletObject);
      labelsLayers = this.get('labelsLayers');
      if (labelsLayers && labelsLayers.length > 0) {
        this._additionalZoomLabelPane();
        labelsLayers.forEach(labelLayer => {
          leafletContainer.addLayer(labelLayer);
          labelLayer.eachLayer(layer => {
            if (layer instanceof L.FeatureGroup) {
              layer.eachLayer(partLayer => { this._setOptionsForSvg(partLayer); });
            } else {
              this._setOptionsForSvg(layer);
            }
          });
        });
      }
    } else if (notInMapLabels.length > 0) {
      notInMapLabels.forEach(labelLayer => {
        leafletContainer.addLayer(labelLayer);
      });
    } else {
      this._showLabels(layers, leafletObject);
      this._additionalZoomLabelPane();
    }
  },

  _setOptionsForSvg(layer) {
    let buffer = 150;
    if (this.get('typeGeometry') === 'polyline' && !Ember.isNone(layer._path) && !Ember.isNone(layer._svg)) {
      let bbox = document.getElementById(Ember.$(layer._path)[0].getAttribute('id')).getBBox();
      if (!Ember.isNone(bbox)) {
        layer._svg.setAttribute('height', bbox.height + buffer);
        layer._svg.setAttribute('width', bbox.width + buffer);
        document.getElementById(Ember.$(layer._svg)[0].getAttribute('id')).setAttribute('height', bbox.height + buffer);
        document.getElementById(Ember.$(layer._svg)[0].getAttribute('id')).setAttribute('width', bbox.width + buffer);
      }
    }
  },

  /**
    Check label layer in continer.

    @method _checkLabelsLayers
    @private
  */
  _containerHasLabelsLayers() {
    let check = [];
    let labelsLayers = this.get('labelsLayers');
    let leafletContainer = this.get('leafletContainer');
    if (labelsLayers && labelsLayers.length > 0) {
      check = labelsLayers.filter(labelLayer => {
        return labelLayer && !leafletContainer.hasLayer(labelLayer);
      });
    }

    return check;
  },

  /**
    Create pane for labels.

    @method _additionalZoomLabelPane
    @private
  */
  _additionalZoomLabelPane() {
    let labelsLayers = this.get('labelsLayers');
    if (labelsLayers) {
      labelsLayers.forEach(labelLayers => {
        let thisPane = labelLayers._paneLabel;
        let leafletMap = this.get('leafletMap');
        if (thisPane && !Ember.isNone(leafletMap)) {
          let pane = leafletMap.getPane(thisPane);
          if (!pane || Ember.isNone(pane)) {
            this._createPane(thisPane);
            this._setLayerZIndex();
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
    if (this.get('labelSettings.signMapObjects') && !Ember.isNone(this.get('labelsLayers')) &&
        !Ember.isNone(Ember.get(leafletObject, 'labelsLayers'))) {

      // _setLayerVisibility method handles <load> action of default wfs-layer
      // For L.MarkerClusterGroup there is <updateClusterLayer> handler that defines label visibility in its own way
      if (!(this.get('_leafletObject') instanceof L.MarkerClusterGroup)) {
        this._addLabelsToLeafletContainer();
      }

      this._checkZoomPane();
      if (this.get('typeGeometry') === 'polyline') {
        this._updatePositionLabelForLine();
      } else if (this.get('typeGeometry') === 'marker') {
        this._updatePositionLabelForMarker();
      }
    }
  },
});
