/**
  @module ember-flexberry-gis
 */

import { get } from '@ember/object';

import { isArray } from '@ember/array';
import { isNone } from '@ember/utils';
import Mixin from '@ember/object/mixin';
import { zoomToBounds } from '../utils/zoom-to-bounds';

/**
  Mixin with the logic of finding a feature on the map.

  @class LeafletZoomToFeatureMixin
  @uses <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Mixin.create({

  actions: {
    /**
      Handles inner FeatureResultItem's bubbled 'selectFeature' action.
      Invokes component's {{#crossLink "FeatureResultItem/sendingActions.selectFeature:method"}}'selectFeature'{{/crossLink}} action.

      @method actions.selectFeature
      @param {Object} feature Describes inner FeatureResultItem's feature object or array of it.
    */
    selectFeature(feature) {
      let leafletMap = this.get('leafletMap');
      if (isNone(leafletMap)) {
        return;
      }

      let serviceLayer = this.get('serviceLayer');
      if (isNone(serviceLayer)) {
        serviceLayer = L.featureGroup().addTo(leafletMap);
        this.set('serviceLayer', serviceLayer);
      }

      let selectedFeature = this.get('_selectedFeature');
      if (selectedFeature !== feature) {
        serviceLayer.clearLayers();

        if (isArray(feature)) {
          feature.forEach((item) => this._selectFeature(item));
        } else {
          this._selectFeature(feature);
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
    */
    zoomTo(feature) {
      let leafletMap = this.get('leafletMap');
      if (isNone(leafletMap)) {
        return;
      }

      this.send('selectFeature', feature);

      let bounds;
      let serviceLayer = this.get('serviceLayer');
      if (typeof (serviceLayer.getBounds) === 'function') {
        bounds = serviceLayer.getBounds();
      } else {
        let featureGroup = L.featureGroup(serviceLayer.getLayers());
        bounds = featureGroup.getBounds();
      }

      if (!isNone(bounds)) {
        let minZoom = isArray(feature) ? get(feature[0], 'leafletLayer.minZoom') : get(feature, 'leafletLayer.minZoom');
        let maxZoom = isArray(feature) ? get(feature[0], 'leafletLayer.maxZoom') : get(feature, 'leafletLayer.maxZoom');
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
      if (isNone(leafletMap)) {
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
      this.send('selectFeature', feature);
    },

    /**
      Clear selected features
      @method actions.clearSelected
    */
    clearSelected() {
      let serviceLayer = this.get('serviceLayer');
      if (!isNone(serviceLayer)) {
        serviceLayer.clearLayers();
      }

      this.set('_selectedFeature', null);
    }
  },

  /**
    Set selected feature and add its layer to serviceLayer on map.

    @method _selectFeature
    @param {Object} feature Describes feature object or array of it.
    @private
  */
  _selectFeature(feature) {
    let serviceLayer = this.get('serviceLayer');
    if (!isNone(feature)) {
      serviceLayer.addLayer(this._prepareLayer(feature.leafletLayer));
    }
  },

  /**
    Additional preparation of the selected layer.

    @param Object layer
  */
  _prepareLayer(layer) {
    layer.options.interactive = false;
    return layer;
  },

  /**
    Action invoking when feature item was selected.

    @method sendingActions.featureSelected
    @param {Object} feature Describes inner FeatureResultItem's feature object or array of it.
  */
});
