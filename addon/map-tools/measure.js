/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseNonclickableMapTool from './base-nonclickable';

/**
  Measure map-tool.

  @class MeasureMapTool
  @extends BaseNonclickableMapTool
*/
export default BaseNonclickableMapTool.extend({
  /**
    Leaflet.Editable.Measure tools instance.

    @property _measureTools
    @type Object
    @default null
    @private
  */
  _measureTools: null,

  /**
    Layer group for Leaflet.Editable temporary markers & other objects.

    @property editLayer
    @type <a href="http://leafletjs.com/reference-1.0.0.html#layergroup">L.LayerGroup</a>
    @default null
  */
  editLayer: null,

  /**
    Layer group for Leaflet.Editable drawn features.

    @property featuresLayer
    @type <a href="http://leafletjs.com/reference-1.0.0.html#layergroup">L.LayerGroup</a>
    @default null
  */
  featuresLayer: null,

  /**
    Enables tool.

    @method _enable
    @private
  */
  _enable() {
    this._super(...arguments);

    let leafletMap = this.get('leafletMap');
    let editLayer = this.get('editLayer');
    if (!Ember.isNone(editLayer) && !leafletMap.hasLayer(editLayer)) {
      editLayer.addTo(leafletMap);
    }

    let featuresLayer = this.get('featuresLayer');
    if (!Ember.isNone(featuresLayer) && !leafletMap.hasLayer(featuresLayer)) {
      featuresLayer.addTo(leafletMap);
    }

    let measureTools = this.get('_measureTools');
    if (Ember.isNone(measureTools)) {
      measureTools = new L.MeasureBase(leafletMap, {
        editOptions: {
          editLayer: editLayer,
          featuresLayer: featuresLayer
        }
      });
      this.set('_measureTools', measureTools);
    }

    // Disable tool when measure will be created.
    leafletMap.on('measure:created', this._onMeasurCreated, this);
  },

  /**
    Disables tool.

    @method _disable
    @private
  */
  _disable() {
    this._super(...arguments);

    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletMap)) {
      leafletMap.off('measure:created', this._onMeasurCreated, this);
    }

    let measureTools = this.get('_measureTools');
    if (!Ember.isNone(measureTools)) {
      measureTools.stopMeasuring();
    }
  },

  /**
    Handles edit tools 'editable:drawing:end' event.

    @method _onDrawingEnd
    @private
  */
  _onMeasurCreated() {
    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletMap)) {
      // Disable current measure tool in favor of default map tool.
      leafletMap.flexberryMap.tools.disable();
    }
  },

  /**
    Destroys map-tool.
  */
  willDestroy() {
    this._super(...arguments);

    let editLayer = this.get('_measureTools.options.editOptions.editLayer');
    if (!Ember.isNone(editLayer)) {
      editLayer.clearLayers();
      editLayer.remove();
    }

    let featuresLayer = this.get('_measureTools.options.editOptions.featuresLayer');
    if (!Ember.isNone(featuresLayer)) {
      featuresLayer.clearLayers();
      featuresLayer.remove();
    }

    this.set('editLayer', null);
    this.set('featuresLayer', null);
    this.set('_measureTools', null);
  }
});
