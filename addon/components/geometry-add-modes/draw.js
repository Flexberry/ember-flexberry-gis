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
  classNames: [flexberryClassNames.wrapper],

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
      let addedLayer = e.layer;
      this.sendAction('complete', addedLayer);
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
