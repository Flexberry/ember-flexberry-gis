/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/map-tools/draw';
import { translationMacro as t } from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-measure-map-tool').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-measure-map-tool').
  @property {String} flexberryClassNames.drawMarker Component's measure-coordinates mode's CSS-class name ('flexberry-measure-coordinates-map-tool').
  @property {String} flexberryClassNames.drawPolyline Component's measure-radius mode's CSS-class name ('flexberry-measure-radius-map-tool').
  @property {String} flexberryClassNames.drawCircle Component's measure-distance mode's CSS-class name ('flexberry-measure-distance-map-tool').
  @property {String} flexberryClassNames.drawRectangle Component's measure-area mode's CSS-class name ('flexberry-measure-area-map-tool').
  @readonly
  @static

  @for DrawMapToolComponent
*/
const flexberryClassNamesPrefix = 'flexberry-draw-map-tool';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix,
  drawMarker: 'flexberry-draw-marker-map-tool',
  drawPolyline: 'flexberry-draw-polyline-map-tool',
  drawCircle: 'flexberry-draw-circle-map-tool',
  drawRectangle: 'flexberry-draw-rectangle-map-tool',
  drawPolygon: 'flexberry-draw-polygon-map-tool',
  drawLabel: 'flexberry-draw-label-map-tool'
};

/**
  Flexberry draw map-tool component.
  Component must be used in combination with {{#crossLink "FlexberryMaptoolbarComponent"}}flexberry-maptoolbar component{{/crossLink}}
  as a wrapper.

  Usage:
  templates/my-map-form.hbs
  ```handlebars
  {{#flexberry-maptoolbar leafletMap=leafletMap as |maptoolbar|}}
    {{map-tools/draw activate=(action "onMapToolActivate" target=maptoolbar)}}
  {{/flexberry-maptoolbar}}
  ```

  @class DrawMapToolComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses <a href="https://github.com/ciena-blueplanet/ember-block-slots#usage">SlotsMixin</a>
*/
let DrawMapToolComponent = Ember.Component.extend({
    /**
      Properties which will be passed to the map-tool when it will be instantiated.

      @property _drawToolProperties
      @type Object
      @default null
    */
    _drawToolProperties: null,

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
      to disable a component's wrapping element.

      @property tagName
      @type String
      @default ''
    */
    tagName: '',

    /**
      Map tool's additional CSS-class.

      @property class
      @type String
      @default null
    */
    class: null,

    /**
      Map tool's caption.

      @property caption
      @type String
      @default t('components.map-tools.draw.caption')
    */
    caption: t('components.map-tools.draw.caption'),

    /**
      Map tool's tooltip text.
      Will be added as wrapper's element 'title' attribute.

      @property tooltip
      @default t('components.map-tools.draw.tooltip')
    */
    tooltip: t('components.map-tools.draw.tooltip'),

    /**
      Map tool's icon CSS-class names.

      @property iconClass
      @type String
      @default 'write icon'
    */
    iconClass: 'write icon',

    /**
      Map tool's 'draw-marker' mode's additional CSS-class.

      @property drawMarker
      @type String
      @default null
    */
    drawMarkerClass: null,

    /**
      Map tool's 'draw-marker' mode's caption.

      @property drawMarkerCaption
      @type String
      @default t('components.map-tools.draw.draw-marker.caption')
    */
    drawMarkerCaption: t('components.map-tools.draw.draw-marker.caption'),

    /**
      Map tool's 'draw-label' mode's caption.

      @property drawLabelCaption
      @type String
      @default t('components.map-tools.draw.draw-label.caption')
    */
    drawLabelCaption: t('components.map-tools.draw.draw-label.caption'),

    /**
      Map tool's 'draw-label' mode's icon CSS-class names.

      @property drawLabelIconClass
      @type String
      @default 'square outline icon'
    */
    drawLabelIconClass: 'label icon',

    /**
      Map tool's 'draw-label' mode's additional CSS-class.

      @property drawLabelClass
      @type String
      @default null
    */
    drawLabelClass: null,

    /**
      Map tool's 'draw-marker' mode's icon CSS-class names.

      @property drawMarkerIconClass
      @type String
      @default 'square outline icon'
    */
    drawMarkerIconClass: 'marker icon',

    /**
      Map tool's 'draw-polyline' mode's additional CSS-class.

      @property drawPolylineClass
      @type String
      @default null
    */
    drawPolylineClass: null,

    /**
      Map tool's 'draw-polyline' mode's caption.

      @property drawPolylineCaption
      @type String
      @default t('components.map-tools.draw.draw-polyline.caption')
    */
    drawPolylineCaption: t('components.map-tools.draw.draw-polyline.caption'),

    /**
      Map tool's 'draw-polyline' mode's icon CSS-class names.

      @property drawPolylineIconClass
      @type String
      @default 'empty star icon'
    */
    drawPolylineIconClass: 'empty star icon',

    /**
      Map tool's 'draw-circle' mode's additional CSS-class.

      @property drawCircleClass
      @type String
      @default null
    */
    drawCircleClass: null,

    /**
      Map tool's 'draw-circle' mode's caption.

      @property drawCircleCaption
      @type String
      @default t('components.map-tools.draw.draw-circle.caption')
    */
    drawCircleCaption: t('components.map-tools.draw.draw-circle.caption'),

    /**
      Map tool's 'draw-circle' mode's icon CSS-class names.

      @property drawCircleIconClass
      @type String
      @default 'circle icon'
    */
    drawCircleIconClass: 'circle icon',

    /**
      Map tool's 'draw-rectangle' mode's additional CSS-class.

      @property drawRectangleClass
      @type String
      @default null
    */
    drawRectangleClass: null,

    /**
      Map tool's 'draw-rectangle' mode's caption.

      @property drawRectangleCaption
      @type String
      @default t('components.map-tools.draw.draw-rectangle.caption')
    */
    drawRectangleCaption: t('components.map-tools.draw.draw-rectangle.caption'),

    /**
      Map tool's 'draw-rectangle' mode's icon CSS-class names.

      @property drawRectangleIconClass
      @type String
      @default 'square icon'
    */
    drawRectangleIconClass: 'square icon',

    /**
      Map tool's 'draw-polygon' mode's additional CSS-class.

      @property drawPolygonClass
      @type String
      @default null
    */
    drawPolygonClass: null,

    /**
      Map tool's 'draw-polygon' mode's caption.

      @property drawPolygonCaption
      @type String
      @default t('components.map-tools.draw.draw-polygon.caption')
    */
    drawPolygonCaption: t('components.map-tools.draw.draw-polygon.caption'),

    /**
      Map tool's 'draw-polygon' mode's icon CSS-class names.

      @property drawPolygonIconClass
      @type String
      @default 'star icon'
    */
    drawPolygonIconClass: 'star icon',

    /**
      Map tool's 'draw-clear' mode's additional CSS-class.

      @property drawClearClass
      @type String
      @default null
    */
    drawClearClass: null,

    /**
      Map tool's 'draw-clear' mode's caption.

      @property drawClearCaption
      @type String
      @default t('components.map-tools.draw.draw-clear.caption')
    */
    drawClearCaption: t('components.map-tools.draw.draw-clear.caption'),

    /**
      Map tool's 'draw-clear' mode's icon CSS-class names.

      @property drawClearIconClass
      @type String
      @default 'trash icon'
    */
    drawClearIconClass: 'trash icon',

    /**
      Flag: is map tool 'draw-marker' enable

      @property drawMarker
      @default true
      @type Boolean
    */
    drawMarker: true,

    /**
      Flag: is map tool 'draw-label' enable

      @property drawLabel
      @default true
      @type Boolean
    */
    drawLabel: true,

    /**
      Flag: is map tool 'draw-polyline' enable

      @property drawPolyline
      @default true
      @type Boolean
    */
    drawPolyline: true,

    /**
      Flag: is map tool 'draw-circle' enable

      @property drawCircle
      @default true
      @type Boolean
    */
    drawCircle: true,

    /**
      Flag: is map tool 'draw-rectangle' enable

      @property drawRectangle
      @default true
      @type Boolean
    */
    drawRectangle: true,

    /**
      Flag: is map tool 'draw-polygon' enable

      @property drawPolygon
      @default true
      @type Boolean
    */
    drawPolygon: true,

    /**
      Flag: is map tool 'draw-clear' enable

      @property drawClear
      @default true
      @type Boolean
    */
    drawClear: true,

    /**
      Flag: indicates whether labelDialog has been requested

      @property _labelDialogHasBeenRequested
      @type boolean
      @default false
    */
    _labelDialogHasBeenRequested: false,

    /**
      Flag: indicates whether labelDialog is visible

      @property _labelDialogIsVisible
      @type boolean
      @default false
    */
    _labelDialogIsVisible: false,

    /**
      Label dialog caption.

      @property labelDialogCaption
      @type String
      @default t('components.map-tools.draw.dialog-label.caption')
    */
    _labelDialogCaption: t('components.map-tools.draw.dialog-label.caption'),

    /**
      Flag: indicates whether has been chosen drawing map-tool.

      @property _isDraw
      @type Boolean
      @default
    */
    _isDraw: false,

    /**
      Tooltip's options.

      @property tooltipOptions
      @type {Object}
      @default
    */
    tooltipOptions: {
      direction: 'top',
      permanent: true
    },

    /**
      Layer.

      @property _layer
      @type <a href="http://leaflet.github.io/Leaflet.Editable/doc/api.html">L.Layer</a>
      @default
    */
    _layer: null,

    /**
      Tool's coordinate reference system (CRS).

      @property crs
      @type <a href="http://leafletjs.com/reference-1.0.0.html#crs">L.CRS</a>
      @default null
    */
    crs: null,

    /**
      Coordinates tool's results precision

      @property precision
      @type Number
      @default 5
    */
    _precision: 5,

    /**
      Count objects layer

      @property _countLayer
      @type Number
      @default 0
    */
    _countLayer: 0,

    actions: {
      /**
        Handles {{#crossLink "BaseMapToolComponent/sendingActions.activate:method"}}base map-tool's 'activate' action{{/crossLink}}.
        Invokes own {{#crossLink "DrawMapToolComponent/sendingActions.activate:method"}}'activate' action{{/crossLink}}.

        @method actions.onMapToolActivate
        @param {Object} e Base map-tool's 'activate' action event-object.
      */
      onMapToolActivate(...args) {
        this.sendAction('activate', ...args);
        this.set('_isDraw', true);

        let e = args[args.length - 1] || {};
        let mapTool = Ember.get(e, 'mapTool');
        if (mapTool.name === 'draw-marker') {
          this.set('_forMarkerIsVisible', true);
        } else {
          this.set('_forMarkerIsVisible', false);
        }

        let leafletMap = Ember.get(mapTool, 'leafletMap');

        if (Ember.isNone(leafletMap)) {
          return;
        } else {
          leafletMap.on('editable:drawing:end', this._showLabelDialog, this);
        }
      },

      /**
        Handles label dialog's 'approve' action.

        @param {Number} _label A hash containing label options.
        @param {Number} _signWithCoord A hash containing parameter to sign with coordinates.
      */
      onLabelDialogApprove(_label, _signWithCoord) {
        if (!Ember.isNone(_label)) {
          let featuresLayer = this.get('_drawToolProperties.featuresLayer');
          let tooltipOptions = this.get('tooltipOptions');
          let text = _label.labelText;

          if (Ember.isNone(text)) {
            text = '';
          }

          let style = _label.style;
          let layer = this.get('_layer');
          this.set('_layer', null);

          if (Ember.isNone(layer)) {
            let layers = featuresLayer.getLayers();
            layer = layers[layers.length - 1];
          }

          let tooltip = layer.getTooltip();
          if (Ember.isNone(tooltip)) {
            tooltip = L.tooltip(tooltipOptions);
            layer.bindTooltip(tooltip, tooltipOptions);
          }

          let coord = '';
          if (_signWithCoord) {
            let br = '';
            if (!Ember.isBlank(text)) {
              br = '</br>';
            }

            coord = br + this._getLabelCoord(layer);
          }

          tooltip.setContent("<p style='" + style + "'>" + text + coord + '</p>');
          layer.on('click', this._changeLabel, [_label, _signWithCoord, this.get('_forMarkerIsVisible'), this]);

          if (layer instanceof L.Marker && _signWithCoord) {
            layer.on('editable:drag', this._changeLabelCoordForMarker, [layer, this]);
          }

          if (!(layer instanceof L.Marker)) {
            layer.on('editable:editing', this._moveTooltip, [layer, this]);
          }
        } else {
          console.log('qwe');
        }
      },

      /**
        Handles label dialog's 'deny' action.

        @param {Number} _label A hash containing label options.
        @param {Number} _signWithCoord A hash containing parameter to sign with coordinates.
      */
      onLabelDialogDeny(_label, _signWithCoord) {
        let featuresLayer = this.get('_drawToolProperties.featuresLayer');
        let layers = featuresLayer.getLayers();
        let layer = layers[layers.length - 1];
        layer.on('click', this._changeLabel, [_label, _signWithCoord, this.get('_forMarkerIsVisible'), this]);
      },
    },


    /**
      Initializes component.
    */
    init() {
      this._super(...arguments);

      this.set('_drawToolProperties', {
        editLayer: new L.LayerGroup(),
        featuresLayer: new L.LayerGroup()
      });
    },

    /**
      Shows a dialog for entering the attributes label.

      @param {Boolean} isClick Containing 'true' if open dialog to edit label.
    */
    _showLabelDialog(isClick) {
      let featuresLayer = this.get('_drawToolProperties.featuresLayer');
      let count = featuresLayer.getLayers().length;

      if (Ember.isNone(this.get('_countLayer')) || this.get('_countLayer') !== count || isClick === true) {
        this.set('_countLayer', count);

        if (this.get('_isDraw')) {
          // Include dialog to markup.
          this.set('_labelDialogHasBeenRequested', true);

          // Show dialog.
          this.set('_labelDialogIsVisible', true);
          this.set('_isDraw', false);
        }
      }
    },

    /**
      Shows a dialog for change the attributes label.
    */
    _changeLabel(e) {
      let [label, signWithCoord, forMarkerIsVisible, _this] = this;
      _this.set('_forMarkerIsVisible', forMarkerIsVisible);
      _this.set('_layer', e.target);
      _this.set('_label', label);
      _this.set('_signWithCoord', signWithCoord);
      _this.set('_isDraw', true);
      _this._showLabelDialog(true);
    },

    /**
      Move tooltip when object is edited.
    */
    _moveTooltip() {
      let [_layer] = this;
      let latlng = _layer.getCenter ? _layer.getCenter() : _layer.getLatLng();
      let tooltip = _layer.getTooltip();
      tooltip.setLatLng(latlng);
    },

    _changeLabelCoordForMarker() {
      let [_layer, _this] = this;
      let tooltip = _layer.getTooltip();
      let text = tooltip.getContent();
      let pos = text.indexOf('</br>');
      let begStr = '';
      if (pos !== -1) {
        begStr = text.substring(0, pos + 5);
      } else {
        begStr = text.substring(0, text.indexOf('>') + 1);
      }

      let coord = begStr + _this._getLabelCoord(_layer) + '</p>';
      _layer.setTooltipContent(coord);
    },

    /**
      Get label coordinates

      @param {Object} layer
     */
    _getLabelCoord(layer) {
      let fixedLatLng = L.Measure.Mixin.Marker.getFixedLatLng(layer.getLatLng());
      let crs = this.get('crs');
      let precision = this.get('_precision');
      let coordCaption = L.Measure.MarkerBase.prototype.basePopupText;

      if (crs) {
        let point = crs.project(fixedLatLng);
        if (point) {
          return Math.abs(point.y).toFixed(precision) + (point.y >= 0 ? coordCaption.northLatitude : coordCaption.southLatitude) +
            Math.abs(point.x).toFixed(precision) + (point.x >= 0 ? coordCaption.eastLongitude : coordCaption.westLongitude);
        }
      }

      return Math.abs(fixedLatLng.lat).toFixed(precision) + (fixedLatLng.lat >= 0 ? coordCaption.northLatitude : coordCaption.southLatitude) +
        Math.abs(fixedLatLng.lng).toFixed(precision) + (fixedLatLng.lng >= 0 ? coordCaption.eastLongitude : coordCaption.westLongitude);
    },

    /**
      Component's action invoking when map-tool must be activated.

      @method sendingActions.activate
      @param {Object} e Action's event object from
      {{#crossLink "BaseMapToolComponent/sendingActions.activate:method"}}base map-tool's 'activate' action{{/crossLink}}.
    */
  }
);

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
DrawMapToolComponent.reopenClass({
  flexberryClassNames
});

export default DrawMapToolComponent;
