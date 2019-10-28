/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseNonclickableMapTool from './base-nonclickable';

/**
  Draw map-tool.

  @class DrawMapTool
  @extends BaseNonclickableMapTool
*/
export default BaseNonclickableMapTool.extend({
  /**
    Leaflet.Editable drawing tools instance.

    @property _editTools
    @type <a href="http://leaflet.github.io/Leaflet.Editable/doc/api.html">L.Ediatble</a>
    @default null
    @private
  */
  _editTools: null,

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

    let editTools = this.get('_editTools');
    if (Ember.isNone(editTools)) {
      editTools = new L.Editable(leafletMap, {
        editLayer: editLayer,
        featuresLayer: featuresLayer
      });
      this.set('_editTools', editTools);
      Ember.set(leafletMap, 'drawTools', editTools);
    }

    editTools.on('editable:drawing:end', this._onDrawingEnd, this);
  },

  /**
    Disables tool.

    @method _disable
    @private
  */
  _disable() {
    this._super(...arguments);

    let editTools = this.get('_editTools');
    if (!Ember.isNone(editTools)) {
      editTools.off('editable:drawing:end', this._onDrawingEnd, this);
      editTools.stopDrawing();
    }
  },

  /**
    Handles edit tools 'editable:drawing:end' event.

    @method _onDrawingEnd
    @private
  */
  _onDrawingEnd() {
    let leafletMap = this.get('leafletMap');
    if (!Ember.isNone(leafletMap)) {
      // Disable current draw tool in favor of default map tool.
      leafletMap.flexberryMap.tools.disable();
    }
  },

  /**
    Destroys map-tool.
  */
  willDestroy() {
    this._super(...arguments);

    let editLayer = this.get('_editTools.editLayer');
    if (!Ember.isNone(editLayer)) {
      editLayer.clearLayers();
      editLayer.remove();
    }

    let featuresLayer = this.get('_editTools.featuresLayer');
    if (!Ember.isNone(featuresLayer)) {
      featuresLayer.clearLayers();
      featuresLayer.remove();
    }

    this.set('editLayer', null);
    this.set('featuresLayer', null);
    this.set('_editTools', null);
  }
});
