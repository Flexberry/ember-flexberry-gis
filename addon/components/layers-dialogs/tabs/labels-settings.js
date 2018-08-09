import Ember from 'ember';
import layout from '../../../templates/components/layers-dialogs/tabs/labels-settings';

export default Ember.Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    "signMapObjectsLabel" checkbox label locale key.

    @property signMapObjectsLabel
    @type String
    @default 'components.layers-dialogs.settings.group.tab.labels-settings.sign-map-objects-label'
  */
  _signMapObjectsLabel: 'components.layers-dialogs.settings.group.tab.labels-settings.sign-map-objects-label',

  /**
    displayPropertyIsCallback textbox css class.

    @property displayPropertyIsCallbackClass
    @type String
    @default 'toggle'
  */
  _signMapObjectsClass: 'toggle',

  /**
    Indicates when leaflet's layer object is loading.

    @property _leafletObjectIsLoading
    @type Boolean
    @default false
    @private
  */
  _leafletObjectIsLoading: false,

  /**
    Leaflet's layer object.

    @property _leafletObject
    @type Object
    @default undefined
    @private
  */
  _leafletObject: undefined,

  /**
    Fields caption

    @property _fieldsCaption
    @type String
    @default 'components.layers-dialogs.settings.group.tab.labels-settings.field-caption'
  */
  _fieldsCaption: 'components.layers-dialogs.settings.group.tab.labels-settings.field-caption',

  /**
    Placeholder when fields isn't loaded

    @property _noFields
    @type String
    @default 'components.layers-dialogs.settings.group.tab.labels-settings.no-fields'
  */
  _noFields: 'components.layers-dialogs.settings.group.tab.labels-settings.no-fields',

  /**
    Available layer's properties.

    @property _availableLayerProperties
    @type Object
    @default undefined
  */
  _availableLayerProperties: undefined,

  /**
    Contains selected field.

    @property _selectedField
    @type String
    @default undefined
    @private
  */
  _selectedField: undefined,

  /**
    Label

    @property _label
    @type String
    @default 'components.layers-dialogs.settings.group.tab.labels-settings.field-caption'
  */
  _label: 'components.layers-dialogs.settings.group.tab.labels-settings.label',

  /**
    Class for operator buttons.

    @property operatorButtonClass
    @type String
    @default 'filter-operator-button'
  */
  _operatorButtonClass: 'filter-operator-button',

  /**
    Class for operator buttons.

    @property _fontCaption
    @type String
    @default 'components.layers-dialogs.settings.group.tab.labels-settings.font-caption
  */
  _fontCaption: 'components.layers-dialogs.settings.group.tab.labels-settings.font-caption',

  /**
    Available font families.

    @property _availableFontFamilies
    @type String[]
    @default null
    @private
  */
  _availableFontFamilies: null,

  /**
    Available font sizes.

    @property _availableFontSizes
    @type String[]
    @default null
    @private
  */
  _availableFontSizes: null,

  /**
    Hash containing location label.

    @property _locationCaption
    @type String
    @default 'components.layers-dialogs.settings.group.tab.labels-settings.location-caption'
    @private
  */
  _locationCaption: 'components.layers-dialogs.settings.group.tab.labels-settings.location-caption',

  /**
    Hash containing geometry type of the layer.

    @property _layerType
    @type String
    @default null
    @private
  */
  _layerType: null,

  /**
    Hash containing location label.

    @property _scaleRangeCaption
    @type String
    @default null
    @private
  */
  _scaleRangeCaption: 'components.layers-dialogs.settings.group.tab.labels-settings.scale-range-caption',

  /**
    Containing available location of the line layer.

    @property _availableLineLocation
    @type String[]
    @default null
    @private
  */
  _availableLineLocation: Ember.computed('i18n.locale', function() {
    let result = [];
    let i18n = this.get('i18n');
    let over = i18n.t(`components.layers-dialogs.settings.group.tab.labels-settings.availableLineLocation.over`).toString();
    let along = i18n.t(`components.layers-dialogs.settings.group.tab.labels-settings.availableLineLocation.along`).toString();
    let under = i18n.t(`components.layers-dialogs.settings.group.tab.labels-settings.availableLineLocation.under`).toString();
    result = Ember.A([over, along, under]);
    return result;
  }),

  /**
    Containing labels layer.

    @property _labelsLayer
    @type Object[]
    @default null
    @private
  */
  _labelsLayer: null,

  /**
    Containing array of strings and feature properies.

    @property _arrLabelString
    @type Object[]
    @default null
    @private
  */
  _arrLabelString: null,

  _error: Ember.computed('_leafletObject', 'leafletMap', function() {
    let leafletObject = this.get('_leafletObject');
    let leafletMap = this.get('leafletMap');
    return !leafletMap.hasLayer(leafletObject);
  }),

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    // There is no easy way to programmatically get list of all available system fonts (in JavaScript),
    // so we can only list some web-safe fonts statically (see https://www.w3schools.com/csSref/css_websafe_fonts.asp).
    this.set('_availableFontFamilies', Ember.A([
      'Georgia',
      'Palatino Linotype',
      'Times New Roman',
      'Arial',
      'Arial Black',
      'Comic Sans MS',
      'Impact',
      'Lucida Sans Unicode',
      'Tahoma',
      'Trebuchet MS',
      'Verdana',
      'Courier New',
      'Lucida Console'
    ]));

    // Same situation with available font sizes.
    this.set('_availableFontSizes', Ember.A(['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '26', '28', '36', '48', '72']));
  },

  /**
    Gets all layers's properties, makes some initializations.

    @method getAllProperties
  */
  getAllProperties() {
    let _this = this;
    let leafletObject = _this.get('_leafletObject');
    if (Ember.isNone(leafletObject)) {
      let type = _this.get('layerType');
      let leafletObjectMethod = _this.get('leafletObjectMethod');
      if (!(Ember.isBlank(leafletObjectMethod) || Ember.isBlank(type))) {
        _this.set('_leafletObjectIsLoading', true);
        leafletObjectMethod().then(leafletObject => {
          _this.set('_leafletObject', leafletObject);
          _this.set('_leafletObjectIsLoading', false);
          let layerClass = Ember.getOwner(_this).knownForType('layer', type);
          if (!Ember.isBlank(layerClass)) {
            let allProperties = Ember.A(layerClass.getLayerProperties(leafletObject));

            let localizedProperties = this.get(`value.featuresPropertiesSettings.localizedProperties.${this.get('i18n.locale')}`) || {};
            let excludedProperties = this.get(`value.featuresPropertiesSettings.excludedProperties`);
            excludedProperties = Ember.isArray(excludedProperties) ? Ember.A(excludedProperties) : Ember.A();
            let availableLayerProperties = {};
            for (var propertyName of allProperties) {
              if (excludedProperties.contains(propertyName)) {
                continue;
              }

              let propertyCaption = Ember.get(localizedProperties, propertyName);
              availableLayerProperties[propertyName] = !Ember.isBlank(propertyCaption) ? propertyCaption : propertyName;
            }

            _this.set('_availableLayerProperties', availableLayerProperties);

            let lType = leafletObject.getLayers()[0].toGeoJSON().geometry.type;
            if (lType === 'Point' || lType === 'MultiPoint') {
              this.set('_layerType', 'point');
            }

            if (lType === 'LineString' || lType === 'MultiLineString') {
              this.set('_layerType', 'line');
            }
          }
        }).catch(() => {
          _this.set('_leafletObjectIsLoading', false);
        });
      }
    }
  },

  /**
    Paste specified string into label string.

    @method _pasteIntoLabelString
    @param {String} pasteString String for pasting
    @param {Integer} caretShift Caret shift after string is pasted
    @private
  */
  _pasteIntoLabelString(pasteString, caretShift) {
    let textarea = this.$('.edit-label-textarea')[0];
    let labelString = this.get('value.labelSettingsString') || '';
    let newLabelString = '';
    let caretPosition = 0;
    if (labelString.length > 0) {
      newLabelString = `${labelString.slice(0, textarea.selectionStart)}${pasteString}${labelString.slice(textarea.selectionEnd)}`;
      caretPosition = textarea.selectionStart + pasteString.length;
    } else {
      newLabelString = pasteString;
      caretPosition = pasteString.length;
    }

    caretPosition = caretPosition + (caretShift || 0);
    this.set('value.labelSettingsString', newLabelString);
    Ember.run.scheduleOnce('afterRender', this, function () {
      textarea.focus();
      textarea.setSelectionRange(caretPosition, caretPosition);
    });
  },

  /**
    Hook, working after element was inserted.

    @method didInsertElement
  */
  didInsertElement() {
    this.getAllProperties();
    if (this.get('value.signMapObjects')) {
      this.$('textarea').removeAttr('readonly');
    } else {
      this.$('textarea').attr('readonly', true);
    }
  },

  /**
    Create array of strings and feature properies.

    @method _parseString
    @param {String} expression String for parsing
  */
  _parseString(expression) {
    if (Ember.isBlank(expression)) {
      return null;
    }

    let exp = expression.trim();
    let reg = /'(.+?)'/g;
    let expResult = exp.split(reg).filter(x => x !== '');
    return expResult ?  expResult : null;
  },

  /**
    Create label string for every object of layer.

    @method _createStringLabel
    @param {Array} expResult Create array of strings and feature properies
    @param {Object} labelsLayer Labels layer
  */
  _createStringLabel(expResult, labelsLayer) {
    let _availableLayerProperties = this.get('_availableLayerProperties');
    let isProp = false;
    var self = this;
    let leafletObject = this.get('_leafletObject') || this._targetObject._leafletObject;
    let style = Ember.String.htmlSafe(
      `font-family: ${this.get('value.options.captionFontFamily')}; ` +
      `font-size: ${this.get('value.options.captionFontSize')}px; ` +
      `font-weight: ${this.get('value.options.captionFontWeight')}; ` +
      `font-style: ${this.get('value.options.captionFontStyle')}; ` +
      `text-decoration: ${this.get('value.options.captionFontDecoration')}; ` +
      `color: ${this.get('value.options.captionFontColor')}; ` +
      `text-align: ${this.get('value.options.captionFontAlign')}; `);

    let leafletMap = this.get('leafletMap') || this._targetObject.leafletMap;
    let bbox = leafletMap.getBounds();
    leafletObject.eachLayer(function(layer) {
      if (!layer._layers && !layer._label && bbox.contains(layer.getBounds ? layer.getBounds() : layer.getLatLng()) && leafletMap.hasLayer(layer)) {
        let label = '';
        expResult.forEach(function(element) {
          for (let key in _availableLayerProperties) {
            if (key === element && !Ember.isNone(layer.feature.properties[key]) && !Ember.isBlank(layer.feature.properties[key])) {
              label += layer.feature.properties[key];
              isProp = true;
            }
          }

          label += !isProp ?  element : '';
          isProp = false;
        });
        self._createLabel(label, layer, style, labelsLayer);
      }

      if (!layer._layers && layer._label && !bbox.contains(layer.getBounds ? layer.getBounds() : layer.getLatLng())) {
        labelsLayer.removeLayer(layer._label);
        layer._label = null;
      }
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
  _createLabel(text, layer, style, labelsLayer) {
    let _layerType = this.get('_layerType');
    let lType = layer.toGeoJSON().geometry.type;

    // because sometimes it happens, although it should not be
    if ((lType === 'Point' || lType === 'MultiPoint') && _layerType !== 'point') {
      _layerType = 'point';
    }

    if ((lType === 'LineString' || lType === 'MultiLineString') && _layerType !== 'line') {
      _layerType = 'line';
    }

    if (lType === 'Polygon' || lType === 'MultiPolygon') {
      _layerType = 'polygon';
    }

    let latlng = null;
    let ctx = layer._renderer ? layer._renderer._ctx : document.getElementsByTagName('canvas')[0].getContext('2d');
    let widthText = ctx ? ctx.measureText(text).width : 100;
    let iconWidth = widthText;

    let iconHeight = 40;
    let positionPoint = '';
    let html = '';

    if (_layerType !== 'point' && _layerType !== 'line') {
      latlng = layer.getCenter();
      html = '<p style="' + style + '">' + text + '</p>';
    }

    if (_layerType === 'point') {
      latlng = layer.getLatLng();
      positionPoint = this._setPositionPoint(iconWidth);
      html = '<p style="' + style + positionPoint + '">' + text + '</p>';
    }

    if (_layerType === 'line') {
      latlng = L.latLng(layer._bounds._northEast.lat, layer._bounds._southWest.lng);
      let options = {
        fillColor: this.get('value.options.captionFontColor'),
        align: this.get('value.options.captionFontAlign')
      };
      this._addTextForLine(layer, text, options, style);
      iconWidth = 12;
      iconHeight = 12;
      html = Ember.$(layer._svgConteiner).html();
    }

    let label = L.marker(latlng, {
      icon: L.divIcon({
        className: 'label',
        html: html,
        iconSize: [iconWidth, iconHeight]
      }),
      zIndexOffset: 1000
    });
    labelsLayer.addLayer(label);
    layer._label = label;
  },

  /**
    Set position for point.

    @method _setPositionPoint
    @param {Number} width
  */
  _setPositionPoint(width) {
    let stylePoint = '';
    let shiftHor = Math.round(width / 2);
    let shiftVerTop = '-60px;';
    let shiftVerBottom = '30px;';

    switch (this.get('value.location.locationPoint')) {
      case '1':
        stylePoint = 'margin-right: ' + shiftHor + 'px; margin-top: ' + shiftVerTop;
        break;
      case '2':
        stylePoint = 'margin-top: ' + shiftVerTop;
        break;
      case '3':
        stylePoint = 'margin-left: ' + shiftHor + 'px; margin-top: ' + shiftVerTop;
        break;
      case '4':
        stylePoint = 'margin-right: ' + shiftHor + 'px;';
        break;
      case '5':
        break;
      case '6':
        stylePoint = 'margin-left: ' + shiftHor + 'px;';
        break;
      case '7':
        stylePoint = 'margin-right: ' + shiftHor + 'px; margin-top: ' + shiftVerBottom;
        break;
      case '8':
        stylePoint = 'margin-top: ' + shiftVerBottom;
        break;
      case '9':
        stylePoint = 'margin-left: ' + shiftHor + 'px; margin-top: ' + shiftVerBottom;
        break;
      default:
        stylePoint = 'margin-left: ' + shiftHor + 'px; margin-top: ' + shiftVerTop;
        break;
    }

    return stylePoint;
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
    div.style.fontSize = fontSize;
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
  _setLabelLine(layer, svg) {
    let leafletMap = this.get('leafletMap') || this._targetObject.leafletMap;
    let latlngArr = layer.getLatLngs();
    let begCoord = leafletMap.latLngToLayerPoint(latlngArr[0]);
    let endCoord = leafletMap.latLngToLayerPoint(latlngArr[latlngArr.length - 1]);

    let rings = [];
    for (let i = 0; i < latlngArr.length; i++) {
      rings[i] = leafletMap.latLngToLayerPoint(latlngArr[i]);
    }

    if (begCoord.x > endCoord.x || begCoord.y > endCoord.y) {
      rings.reverse();
    }

    let minX = 10000000;
    let minY = 10000000;
    let maxX = 600;
    let maxY = 600;
    for (let i = 0; i < rings.length; i++) {
      if (rings[i].x < minX) {
        minX = rings[i].x;
      }

      if (rings[i].y < minY) {
        minY = rings[i].y;
      }
    }

    let d = '';
    let kx = minX - 6;
    let ky = minY - 6;

    for (let i = 0; i < rings.length; i++) {
      d += i === 0 ? 'M' : 'L';
      let x = rings[i].x - kx;
      let y = rings[i].y - ky;
      if (x > maxX) {
        maxX = x;
      }

      if (y > maxY) {
        maxY = y;
      }

      d += x + ' ' + y;
    }

    layer._path.setAttribute('d', d);
    svg.setAttribute('width', maxX + 'px');
    svg.setAttribute('height', maxY + 'px');
  },

  /**
    Set align for line object's label

    @method _setAlignForLine
    @param {Object} layer
    @param {Object} svg
  */
  _setAlignForLine(layer, text, align, textNode) {
    let pathLength = layer._path.getTotalLength();
    let textLength = this._getWidthText(
      text,
      this.get('value.options.captionFontFamily'),
      this.get('value.options.captionFontSize'),
      this.get('value.options.captionFontWeight'),
      this.get('value.options.captionFontStyle'),
      this.get('value.options.captionFontDecoration')
    );

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
  _addTextForLine(layer, text, options, style) {
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
    layer._path.setAttribute('id', id);

    let textNode = L.SVG.create('text');
    let textPath = L.SVG.create('textPath');
    let dy =  0;
    let sizeFont = parseInt(this.get('value.options.captionFontSize'));
    let i18n = this.get('i18n');
    let along = i18n.t(`components.layers-dialogs.settings.group.tab.labels-settings.availableLineLocation.along`).toString();
    let under = i18n.t(`components.layers-dialogs.settings.group.tab.labels-settings.availableLineLocation.under`).toString();
    let _lineLocationSelect = this.get('value.location.lineLocationSelect');

    if (_lineLocationSelect === along) {
      dy = Math.ceil(sizeFont / 4);
    }

    if (_lineLocationSelect === under) {
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

    this._setLabelLine(layer, svg);
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
    let _this = this;
    let leafletObject = _this.get('_leafletObject') || _this._targetObject._leafletObject;
    if (!Ember.isNone(leafletObject)) {
      leafletObject.eachLayer(function(layer) {
        if (!Ember.isNone(layer._path)) {
          let svg = layer._svg;
          _this._setLabelLine(layer, svg);
          let d = layer._path.getAttribute('d');
          let path = svg.firstChild.firstChild;
          path.setAttribute('d', d);
          let id = path.getAttribute('id');

          Ember.$('path#' + id).attr('d', d);
          Ember.$('svg#svg-' + id).attr('width', svg.getAttribute('width'));
          Ember.$('svg#svg-' + id).attr('height', svg.getAttribute('height'));

          let options = layer._textOptions;
          let text = layer._text;
          let textNode = layer._textNode;

          _this._setAlignForLine(layer, text, options.align, textNode);
          Ember.$('text#text-' + id).attr('dx', textNode.getAttribute('dx'));
        }
      });
    }
  },

  /**
    Set visibility for scale range

    @method _setVisibilityScaleRange
  */
  _setVisibilityScaleRange() {
    let _this = this;
    let scale = parseInt(Ember.$('.map-control-scalebar-ratiomenu>text')[0].innerHTML.split(':')[1]);
    let minScaleRange = _this.get('value.scaleRange.minScaleRange');
    let maxScaleRange = _this.get('value.scaleRange.maxScaleRange');
    let visibility = false;
    if ((Ember.isBlank(minScaleRange) || Ember.isNone(minScaleRange)) && (Ember.isBlank(maxScaleRange) || Ember.isNone(maxScaleRange))) {
      visibility = true;
    } else {
      if (!Ember.isBlank(minScaleRange) && !Ember.isNone(minScaleRange) && !Ember.isBlank(maxScaleRange) && !Ember.isNone(maxScaleRange) &&
          scale >= minScaleRange && scale < maxScaleRange) {
        visibility = true;
      }

      if (!Ember.isBlank(minScaleRange) && !Ember.isNone(minScaleRange) &&
          (Ember.isBlank(maxScaleRange) || Ember.isNone(maxScaleRange)) && scale >= minScaleRange) {
        visibility = true;
      }

      if (!Ember.isBlank(maxScaleRange) && !Ember.isNone(maxScaleRange) &&
          (Ember.isBlank(minScaleRange) || Ember.isNone(minScaleRange)) && scale < maxScaleRange) {
        visibility = true;
      }
    }

    if (visibility) {
      _this._addLabelsToLeafletContainer();
    } else {
      _this._removeLabelsFromLeafletContainer();
    }

  },

  /**
    Show lables

    @method _showLabels
  */
  _showLabels() {
    let labelSettingsString = this.get('value.labelSettingsString');
    let arrLabelString = this._parseString(labelSettingsString);
    this.set('_arrLabelString', arrLabelString);
    if (!Ember.isNone(arrLabelString)) {
      let leafletMap = this.get('leafletMap');
      let leafletObject = this.get('_leafletObject');
      let labelsLayer = this.get('_labelsLayer');
      if (Ember.isNone(labelsLayer)) {
        labelsLayer = L.featureGroup();
        labelsLayer._idLeafletObject = leafletObject._leaflet_id;
        labelsLayer._this = this;
      } else {
        labelsLayer.clearLayers();
      }

      this._createStringLabel(arrLabelString, labelsLayer);
      this.set('_labelsLayer', labelsLayer);

      this.set('value.labelsLayer', leafletObject._leaflet_id);
      this._setVisibilityScaleRange();
      leafletMap.on('moveend', this._showLabelsMovingMap, this);
      let minScaleRange = this.get('value.scaleRange.minScaleRange');
      let maxScaleRange = this.get('value.scaleRange.maxScaleRange');
      if ((Ember.isBlank(minScaleRange) || Ember.isNone(minScaleRange)) && (Ember.isBlank(maxScaleRange) || Ember.isNone(maxScaleRange))) {
        return;
      } else {
        leafletMap.on('zoomend', this._setVisibilityScaleRange, this);
      }

      if (this.get('_layerType') === 'line') {
        leafletMap.on('zoomend', this._updatePositionLabelForLine, this);
      }
    }
  },

  /**
    Adds labels to it's leaflet container.

    @method _addLabelsToLeafletContainer
    @private
  */
  _addLabelsToLeafletContainer() {
    let labelsLayer = this.get('_labelsLayer');

    if (Ember.isNone(labelsLayer)) {
      this._showLabels();
      labelsLayer = this.get('_labelsLayer');
    }

    let leafletMap = this.get('leafletMap') || this._targetObject.leafletMap;
    leafletMap.addLayer(labelsLayer);

    if (this.get('_layerType') === 'line') {
      this._updatePositionLabelForLine();
    }
  },

  /**
    Removes labels from it's leaflet container.

    @method _removeLabelsFromLeafletContainer
    @private
  */
  _removeLabelsFromLeafletContainer() {
    let labelsLayer = this.get('_labelsLayer');

    if (Ember.isNone(labelsLayer)) {
      return;
    }

    let leafletMap = this.get('leafletMap') || this._targetObject.leafletMap;
    leafletMap.removeLayer(labelsLayer);
  },

  /**
    Show labels when map moving

    @method _showLabelsMovingMap
  */
  _showLabelsMovingMap() {
    let _this = this;
    let labelsLayer = _this.get('_labelsLayer');
    let arrLabelString = this.get('_arrLabelString');

    _this._createStringLabel(arrLabelString, labelsLayer);
    _this._setVisibilityScaleRange();
  },

  actions: {
    /**
      Handles signMapObjects-checkbox change.
      @method actions.signMapObjectsCheckboxDidChange
    */
    signMapObjectsCheckboxDidChange() {
      if (!this.get('value.signMapObjects')) {
        this.$('textarea').removeAttr('readonly');
      } else {
        this.$('textarea').attr('readonly', true);
      }
    },

    /**
      This action is called when an item in Fields list is pressed.

      @method actions.fieldClick
      @param {String} text Selected field
    */
    fieldClick(text) {
      if (this.get('_selectedField') !== text && this.get('value.signMapObjects')) {
        this.set('values', Ember.A());
        this.set('_selectedField', text);
      }
    },

    /**
      Paste selected field or field value into filter string.

      @method actions.pasteFieldValue
      @param {String} value
    */
    pasteFieldValue(value) {
      if (this.get('value.signMapObjects')) {
        if (Ember.isNone(value)) {
          this._pasteIntoLabelString('NULL');
          return;
        }

        let newString = `'${value}'`;
        this._pasteIntoLabelString(newString);
      }
    },

    /**
      This action is called when Apply button is pressed.

      @method actions.applyLabel
    */
    applyLabel() {
      let leafletMap = this.get('leafletMap');
      let leafletObject = this.get('_leafletObject');
      if (this.get('value.signMapObjects') && leafletMap.hasLayer(leafletObject)) {
        let labelsLayer = this.get('_labelsLayer');

        this.set('_labelsLayer', labelsLayer);
        let idlabelsLayer = this.get('value.labelsLayer');

        if (!Ember.isNone(idlabelsLayer)) {
          leafletMap.eachLayer(function(layer) {
            if (layer._idLeafletObject === idlabelsLayer) {
              var self = layer._this;
              leafletMap.off('moveend', self._showLabelsMovingMap, self);
              leafletMap.off('zoomend', self._setVisibilityScaleRange, self);
              if (self.get('_layerType') === 'line') {
                leafletMap.off('zoomend', self._updatePositionLabelForLine, self);
              }

              leafletMap.removeLayer(layer);
            }

            if (layer._label) {
              layer._label = null;
            }
          });
        }

        this._showLabels();
      }
    },

    /**
      This action is called when Clear button is pressed.

      @method actions.clearLabel
    */
    clearLabel() {
      this.set('value.labelSettingsString', undefined);
    },

    /**
      Handler for bold font button's 'click' action.

      @method actions.onBoldFontButtonClick
    */
    onBoldFontButtonClick() {
      let previousFontWeight = this.get('value.options.captionFontWeight');
      this.set('value.options.captionFontWeight', previousFontWeight !== 'bold' ? 'bold' : 'normal');
    },

    /**
      Handler for italic font button's 'click' action.

      @method actions.onItalicFontButtonClick
    */
    onItalicFontButtonClick() {
      let previousFontWeight = this.get('value.options.captionFontStyle');
      this.set('value.options.captionFontStyle', previousFontWeight !== 'italic' ? 'italic' : 'normal');
    },

    /**
      Handler for underline font button's 'click' action.

      @method actions.onUnderlineFontButtonClick
    */
    onUnderlineFontButtonClick() {
      let previousFontWeight = this.get('value.options.captionFontDecoration');
      this.set('value.options.captionFontDecoration', previousFontWeight !== 'underline' ? 'underline' : 'none');
    },

    /**
      Handler for left font button's 'click' action.

      @method actions.onLeftFontButtonClick
    */
    onLeftFontButtonClick() {
      let previousFontWeight = this.get('value.options.captionFontAlign');
      this.set('value.options.captionFontAlign', previousFontWeight !== 'left' ? 'left' : 'auto');
    },

    /**
      Handler for center font button's 'click' action.

      @method actions.onCenterFontButtonClick
    */
    onCenterFontButtonClick() {
      let previousFontWeight = this.get('value.options.captionFontAlign');
      this.set('value.options.captionFontAlign', previousFontWeight !== 'center' ? 'center' : 'auto');
    },

    /**
      Handler for right font button's 'click' action.

      @method actions.onRightFontButtonClick
    */
    onRightFontButtonClick() {
      let previousFontWeight = this.get('value.options.captionFontAlign');
      this.set('value.options.captionFontAlign', previousFontWeight !== 'right' ? 'right' : 'auto');
    },

    /**
      Handler for font colorpicker's 'change' action.

      @method actions.onCaptionFontColorChange
    */
    onCaptionFontColorChange(e) {
      this.set('value.options.captionFontColor', e.newValue);
    },

    /**
      Handler for font colorpicker's 'change' action.

      @method actions.onCaptionFontColorChange
    */
    onLocationPointButtonClick(num) {
      this.set('value.location.locationPoint', num);
    }
  }
});
