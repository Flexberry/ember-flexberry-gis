/**
  @module ember-flexberry-gis
 */

import Ember from 'ember';
import { zoomToBounds } from '../utils/zoom-to-bounds';

/**
  Mixin with the logic of finding a feature on the map.

  @class LeafletZoomToFeatureMixin
  @uses <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({

  serviceRenderer: null,

  zoomToCopy: false,
  copyStyle: null,

  pane: 'overlayPane',

  actions: {
    /**
      Handles inner FeatureResultItem's bubbled 'selectFeature' action.
      Invokes component's {{#crossLink "FeatureResultItem/sendingActions.selectFeature:method"}}'selectFeature'{{/crossLink}} action.

      @method actions.selectFeature
      @param {Object} feature Describes inner FeatureResultItem's feature object or array of it.
      @param {Boolean} layerInteractive Flag indicating whether to enable layer interactivity.
      @param {Boolean} clearLayers Flag indicating whether to clear the result service layer.
    */
    selectFeature(feature, layerInteractive = false, clearLayers = true) {
      let leafletMap = this.get('leafletMap');
      if (Ember.isNone(leafletMap)) {
        return;
      }

      let serviceRenderer = this.get('serviceRenderer');
      if (Ember.isNone(serviceRenderer)) {
        let paneName = this.get('pane');
        let pane = leafletMap.getPane(paneName);
        if (!pane || Ember.isNone(pane)) {
          pane = leafletMap.createPane(paneName);
          pane.style.pointerEvents = 'none';
        }

        serviceRenderer = L.canvas({ pane: paneName });
        this.set('serviceRenderer', serviceRenderer);
      }

      let serviceLayer = this.get('serviceLayer');
      if (Ember.isNone(serviceLayer)) {
        serviceLayer = L.featureGroup().addTo(leafletMap);
        this.set('serviceLayer', serviceLayer);
      }

      let selectedFeature = this.get('_selectedFeature');
      if (selectedFeature !== feature) {
        if (clearLayers) {
          serviceLayer.clearLayers();
        }

        if (Ember.isArray(feature)) {

          // Adding objects to the layer (serviceRenderer) occurs at the end, which confuses the hierarchy on the map.
          // Correct addition, taking into account indexes - to the beginning
          feature.reverse().forEach((item) => this._selectFeature(item, layerInteractive));
        } else {
          this._selectFeature(feature, layerInteractive);
        }

        this.set('_selectedFeature', feature);
      }

      // Send action despite of the fact feature changed or not. User can disable layer anytime.
      this.sendAction('featureSelected', feature);
    },

    /**
      Select passed feature and zoom map to its layer bounds
      @method actions.zoomTo
      @param {Object} feature Describes inner FeatureResultItem's feature object or array of it.
      @param {Boolean} layerInteractive Flag indicating whether to enable layer interactivity.
      @param {Boolean} clearLayers Flag indicating whether to clear the result service layer.
    */
    zoomTo(feature, layerInteractive = false, clearLayers = true) {
      let leafletMap = this.get('leafletMap');
      if (Ember.isNone(leafletMap)) {
        return;
      }

      if (Ember.isNone(feature) || (Ember.isArray(feature) && feature.length === 0)) {
        return;
      }

      this.send('selectFeature', feature, layerInteractive, clearLayers);

      let bounds;
      let serviceLayer = this.get('serviceLayer');
      if (typeof (serviceLayer.getBounds) === 'function') {
        bounds = serviceLayer.getBounds();
      } else {
        let featureGroup = L.featureGroup(serviceLayer.getLayers());
        bounds = featureGroup.getBounds();
      }

      if (!Ember.isNone(bounds)) {
        let minZoom = Ember.isArray(feature) ? Ember.get(feature[0], 'leafletLayer.minZoom') : Ember.get(feature, 'leafletLayer.minZoom');
        let maxZoom = Ember.isArray(feature) ? Ember.get(feature[0], 'leafletLayer.maxZoom') : Ember.get(feature, 'leafletLayer.maxZoom');
        zoomToBounds(bounds, leafletMap, minZoom, maxZoom);
      }
    },

    /**
      Select passed feature and pan map to its layer centroid
      @method actions.panTo
      @param {Object} feature Describes inner FeatureResultItem's feature object or array of it.
    */
    panTo(feature) {
      let leafletMap = this.get('leafletMap');
      if (Ember.isNone(leafletMap)) {
        return;
      }

      let latLng;
      if (typeof (feature.leafletLayer.getBounds) === 'function') {
        latLng = feature.leafletLayer.getBounds().getCenter();
      } else {
        latLng = feature.leafletLayer.getLatLng();
      }

      // TODO: pass action with panTo latLng outside
      this.get('leafletMap').panTo(latLng);
    },

    /**
      Clear selected features
      @method actions.clearSelected
    */
    clearSelected() {
      let serviceLayer = this.get('serviceLayer');
      if (!Ember.isNone(serviceLayer)) {
        serviceLayer.clearLayers();
      }

      this.set('_selectedFeature', null);
    }
  },

  /**
    Set selected feature and add its layer to serviceLayer on map.

    @method _selectFeature
    @param {Object} feature Describes feature object or array of it.
    @param {Boolean} layerInteractive Flag indicating whether to enable layer interactivity.
    @private
  */
  _selectFeature(feature, layerInteractive) {
    let serviceLayer = this.get('serviceLayer');
    if (!Ember.isNone(feature)) {
      serviceLayer.addLayer(this._prepareLayer(feature.leafletLayer, layerInteractive));
    }
  },

  /**
    Additional preparation of the selected layer.
    @param {Object} layer
    @param {Boolean} layerInteractive Flag indicating whether to enable layer interactivity.
  */
  _prepareLayer(layer, layerInteractive) {
    let l = layer;

    if (this.get('zoomToCopy')) {
      // кажется options у geoJSON слоя нельзя менять динамически, нужно задавать сразу правильные
      l = L.geoJson(layer.toGeoJSON(), {
        pane: this.get('pane')
      });

      let style = this.get('copyStyle');
      if (style) {
        l.setStyle(style);
      }
    }

    l.options.interactive = layerInteractive ? true : false;
    if (layerInteractive) {
      l.options.pane = this.get('pane');

      let serviceRenderer = this.get('serviceRenderer');
      l.options.renderer = serviceRenderer;
    }

    return l;
  },

  /**
    Action invoking when feature item was selected.

    @method sendingActions.featureSelected
    @param {Object} feature Describes inner FeatureResultItem's feature object or array of it.
  */
});
