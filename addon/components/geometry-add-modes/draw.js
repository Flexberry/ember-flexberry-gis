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
    Offset validation flags.

    @property _offsetInvalid
    @type Object
    @default {
      x: false,
      y: false
    }
    @private
  */
  _offsetInvalid: {
    x: false,
    y: false
  },

  /**
    Offset

    @property s
    @type Object
    @default {
      x: null,
      y: null
    }
    @private
  */
  _offset: {
    x: null,
    y: null
  },

  /**
    Component settings.
  */
  settings: null,

  layer: null,

  edit: Ember.computed('layer', function () {
    if (this.get('layer')) {
      return true;
    }

    return false;
  }),

  initialSettings: Ember.on('init', Ember.observer('settings', function () {
    this._dragAndDrop(false);
  })),

  getLayer() {
    let layer = this.get('layer');

    return [Ember.isNone(layer), layer];
  },

  /**
    Number check.

    @method _validFloatNumber
  */
  _validOffset(str) {
    const regex = /^(([0-9]*[.])?[0-9]+)$/;
    return regex.exec(str);
  },

  _dragLayer: null,
  _nowDragging: false,
  _tempCoords: null,

  _dragAndDrop(enable) {
    // если не было включено и не включаем
    if (!this.get('_moveEnabled') && !enable) {
      return;
    }

    this.set('_moveEnabled', enable);

    // слой, для которого включено перемещение
    let dragLayer = this.get('_dragLayer');
    if (dragLayer) {
      this._stopDragging(dragLayer, false);
      dragLayer.off('mousedown', this._dragOnMouseDown, this);
      this.set('_dragLayer', null);
    }

    let layer = this.get('layer');
    if (Ember.isNone(layer)) {
      return;
    }

    if (enable) {
      this.set('_dragLayer', layer);
      layer.on('mousedown', this._dragOnMouseDown, this);

      this._setClickEnable(false, layer);

      if (layer.bringToFront) {
        layer.bringToFront();
      }
    } else {
      // сюда попадаем, если до этого было включено перетаскивание
      this._setClickEnable(true, layer);
    }
  },

  _setClickEnable(enable, layer) {
    let leafletMap = this.get('leafletMap');
    let panes = [];

    try {
      let curPane = layer.getPane();

      if (Ember.isNone(curPane.style.zIndex)) {
        return;
      }

      panes = Object.values(leafletMap.getPanes()).filter((p) => {
        return p !== curPane && !Ember.isNone(p.style.zIndex) && parseInt(p.style.zIndex) >= parseInt(curPane.style.zIndex);
      });
    }
    catch (ex) {
      console.log(ex);

      if (enable) {
        panes = Object.values(leafletMap.getPanes());
      }
    }

    panes.forEach((p) => {
      if (!enable) {
        p.style.pointerEventsOld = p.style.pointerEvents;
        p.style.pointerEvents = 'none';
      }

      if (enable && !Ember.isNone(p.style.pointerEventsOld)) {
        p.style.pointerEvents = p.style.pointerEventsOld;
      }
    });
  },

  _stopDragging(dragLayer, editAfter) {
    let leafletMap = this.get('leafletMap');
    leafletMap.dragging.enable();

    dragLayer.off('mouseup', this._dragOnMouseUp, this);
    leafletMap.off('mousemove', this._dragOnMouseMove, this);

    if (editAfter) {
      dragLayer.enableEdit();
    }

    this.set('_nowDragging', false);
  },

  _dragOnMouseDown(e) {
    if (this.isDestroyed) {
      return;
    }

    // cancel if mouse button is NOT the left button
    if (e.originalEvent.button > 0) {
      return;
    }

    let nowDragging = this.get('_nowDragging');
    if (nowDragging) {
      this._stopDragging(this.get('_dragLayer'), true);
      this.sendAction('updateLayer', this.get('_dragLayer'), true);
    } else {
      this.set('_nowDragging', true);

      this.set('_tempCoords', e.latlng);

      let dragLayer = this.get('_dragLayer');
      dragLayer.disableEdit();

      if (dragLayer.bringToFront) {
        dragLayer.bringToFront();
      }

      dragLayer.on('mouseup', this._dragOnMouseUp, this);

      let leafletMap = this.get('leafletMap');
      leafletMap.on('mousemove', this._dragOnMouseMove, this);
      leafletMap.dragging.disable();
    }
  },

  _dragOnMouseUp(e) {
    let nowDragging = this.get('_nowDragging');
    if (nowDragging) {
      this._stopDragging(this.get('_dragLayer'), true);
      this.sendAction('updateLayer', this.get('_dragLayer'), true);
    }
  },

  _dragOnMouseMove(e) {
    // latLng of mouse event
    let { latlng } = e;

    // delta coords (how far was dragged)
    let deltaLatLng = {
      lat: latlng.lat - this.get('_tempCoords.lat'),
      lng: latlng.lng - this.get('_tempCoords.lng'),
    };

    // move the coordinates by the delta
    let moveCoords = coords => {
      if (Ember.isArray(coords)) {
        return coords.map((currentLatLng) => {
          return moveCoords(currentLatLng);
        });
      }

      let res = {
        lat: coords.lat + deltaLatLng.lat,
        lng: coords.lng + deltaLatLng.lng,
      };

      return res;
    };

    // create the new coordinates array
    let newCoords;
    let dragLayer = this.get('_dragLayer');

    let moveLayer = (layer) => {
      if (layer instanceof L.Marker) {
        newCoords = moveCoords(layer._latlng);
      } else {
        newCoords = moveCoords(layer._latlngs);
      }

      // set new coordinates and redraw
      if (layer.setLatLngs) {
        layer.setLatLngs(newCoords).redraw();
      } else {
        layer.setLatLng(newCoords);
      }

      let label = this.get('_dragLayer._label');
      if (label) {
        newCoords = moveCoords(label._latlng);
        label.setLatLng(newCoords);
      }
    };

    moveLayer(dragLayer);

    // save current latlng for next delta calculation
    this.set('_tempCoords', latlng);
  },

  willDestroyElement() {
    this._super(...arguments);
    this._dragAndDrop(false);
  },

  /**
    Calculates new coordinates layer's feature after the move

    @param {Arrey} latlngs A hash containing  coordinates.
    @param {Number} x A hash containing move by X.
    @param {Number} y A hash containing move by Y.
    @param {Object} crs A hash containing layer's crs.
  */
  move(latlngs, x, y, crs) {
    if (Ember.isArray(latlngs)) {
      return latlngs.map((currentLatLng) => {
        return this.move(currentLatLng, x, y, crs);
      });
    }

    let pointO = crs.unproject(L.point(0, 0));
    let pointOX = crs.unproject(L.point(x, 0));
    let pointOY = crs.unproject(L.point(0, y));

    let res = {
      lat: latlngs.lat + (pointOY.lat - pointO.lat),
      lng: latlngs.lng + (pointOX.lng - pointO.lng)
    };

    if (res.lat > 90 || res.lat < -90 || res.lng > 180 || res.lng < -180) {
      this.set('_moveWithError', true);
    }

    return res;
  },

  actions: {
    /**
      Handles change start point.
    */
    validOffset(field) {
      this.set('_offsetInvalid.' + field, !this._validOffset(this.get('_offset.' + field)));
    },

    applyXY() {
      let _moveX = parseFloat(this.get('_offset.x')) || 0;
      let _moveY = parseFloat(this.get('_offset.y')) || 0;

      let layer = this.get('layer');

      if (Ember.isNone(layer)) {
        return;
      }

      layer.disableEdit();

      let crs = this.get('settings.layerCRS');

      this.set('_moveWithError', false);

      let coords;
      if (layer.getLatLngs) {
        coords = layer.getLatLngs();
      } else {
        coords = layer.getLatLng();
      }

      let newLatLngs = this.move(coords, _moveX, _moveY, crs);
      if (!this.get('_moveWithError')) {
        if (layer.setLatLngs) {
          layer.setLatLngs(newLatLngs).redraw();
        } else {
          layer.setLatLng(newLatLngs);
        }

        let label = this.get('layer._label');
        if (label) {
          newLatLngs = this.move(label.getLatLng(), _moveX, _moveY, crs);
          label.setLatLng(newLatLngs);
        }
      }

      layer.enableEdit();

      this.sendAction('updateLayer', layer, true);
    },

    /**
      Handles click on available geometry type.

      @method onGeometryTypeSelect
      @param {String} geometryType Selected geometry type.
    */
    onMoveSelect(geometryType) {
      this.set('_moveWithError', false);
      this.set('geometryType', geometryType);

      let editTools = this._getEditTools();
      if (!Ember.isNone(editTools)) {
        editTools.stopDrawing();
      }

      let leafletMap = this.get('leafletMap');
      leafletMap.flexberryMap.tools.enableDefault();

      if (geometryType === 'move') {
        let enable = this.get('_moveEnabled');
        this._dragAndDrop(!enable);
      }
    },

    /**
      Handles click on available geometry type.

      @method onGeometryTypeSelect
      @param {String} geometryType Selected geometry type.
    */
    onGeometryTypeSelect(geometryType) {
      this._dragAndDrop(false);

      this.sendAction('drawStart', geometryType);

      this.set('geometryType', geometryType);

      let editTools = this._getEditTools();

      if (!Ember.isNone(editTools)) {
        editTools.stopDrawing();
      }

      editTools.off('editable:drawing:end', this._disableDraw, this);
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
      this.sendAction('block', true);

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
    editTools.off('editable:drawing:end', this._disableDraw, this);

    this.$().closest('body').off('keydown');
    if (!Ember.isNone(editTools)) {
      editTools.stopDrawing();
    }

    this.sendAction('block', false);

    if (!Ember.isNone(e)) {
      let geometryType = this.get('geometryType');

      if (geometryType !== 'multyPolygon' && geometryType !== 'multyLine') {
        this.set('layer', e.layer);
        this.sendAction('updateLayer', e.layer, false);
      } else {
        let layer = this.get('layer');
        if (Ember.isNone(layer)) {
          this.set('layer', e.layer);
          return;
        }

        var featureCollection = {
          type: 'FeatureCollection',
          features: [layer.toGeoJSON(), e.layer.toGeoJSON()]
        };

        let fcCombined = turfCombine.default(featureCollection);
        const featureCombined = L.geoJSON(fcCombined);
        const combinedLeaflet = featureCombined.getLayers()[0];
        layer.setLatLngs(combinedLeaflet.getLatLngs());
        layer.disableEdit();
        layer.enableEdit();

        e.layer.remove();
        this.sendAction('updateLayer', layer, false);
      }
    }
  }
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryGeometryAddModeDrawComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryGeometryAddModeDrawComponent;
