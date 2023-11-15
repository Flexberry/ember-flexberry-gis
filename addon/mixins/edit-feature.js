
import Ember from 'ember';
import { getLeafletCrs } from '../utils/leaflet-crs';

export default Ember.Mixin.create({

  zoomFeatureStyle: {
    color: 'salmon',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.3
  },

  /**
    Leaflet.Editable drawing tools instance.

    @property _editTools
    @type <a href="http://leaflet.github.io/Leaflet.Editable/doc/api.html">L.Ediatble</a>
    @default null
    @private
  */
  _editTools: null,

  /**
    Returns Leaflet.Editable instance.
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
    Overrides {{#crosslink "LeafletZoomToFeatureMixin/_prepareLayer:method"}} to make a copy of passed layer
    and apply a style to the layer to make it more visible.
    @method _prepareLayer
    @param {Object} layer
    @return {<a href="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>} Prepared layer.
    @private
  */
  _prepareLayer: function _prepareLayer(layer) {
    let leafletMap = this.get('leafletMap');
    let pane = leafletMap.getPane('zoomto');
    if (!pane || Ember.isNone(pane)) {
      pane = leafletMap.createPane('zoomto');
      pane.style.pointerEvents = 'none';
    }

    return L.geoJson(layer.toGeoJSON(), {
      pane: 'zoomto'
    }).setStyle(this.get('zoomFeatureStyle'));
  },

  /**
    Sends request to trancate GeoWebCache for layer by boundingBox.

    @method trancateGeoWebCache
    @param {Object} leafletObject laeflet layer.
    @param {Object} leafletMap laeflet map.
  */
  trancateGeoWebCache(leafletObject, leafletMap) {
    let layers = leafletObject.wmsParams.layers.split();
    let workspace;
    let layer;
    let geoWebCache;
    if (layers.length === 2) {
      workspace = layers[0];
      layer = layers[1];
    } else {
      let urlSplit = leafletObject._url.split('/');
      let indexGeoserver = urlSplit.indexOf('geoserver');
      if (indexGeoserver > -1 && urlSplit.length === indexGeoserver + 3) {
        workspace = urlSplit.at(indexGeoserver + 1);
      } else {
        console.error('Can\'t get workspace in geoserver');
        return;
      }

      layer = layers[0];
    }

    if (!Ember.isBlank(leafletObject._url.match(new RegExp('(https?|ftp)://(-\.)?([^\s/?\.#-]+\.?)+(/[^\s]*)?')))) {
      let indexGeoserver = leafletObject._url.indexOf('geoserver');
      if (indexGeoserver === -1) {
        console.error('Can\'t get url geoserver');
        return;
      }

      geoWebCache = leafletObject._url.slice(0, indexGeoserver + 10) + '/gwc/rest/seed/';
    }

    if (!Ember.isNone(geoWebCache)) {
      let url = geoWebCache + workspace + ':' + layer;
      let gridSetId = leafletObject.wmsParams.crs + '_' + leafletObject.wmsParams.width;
      let zoom = Math.trunc(leafletMap.getZoom());
      let zoomStart = zoom - 1 > 0 ? zoom - 1 : zoom;
      let zoomStop = zoom + 1 < 20 ? zoom + 1 : zoom;
      let styles = leafletObject.wmsParams.styles;
      let parameterStyles = '';
      if (!Ember.isNone(styles)) {
        parameterStyles = `parameter_STYLES=${workspace}:${styles}&`;
      }

      let crsName = leafletObject.wmsParams.crs;
      let crs;
      if (!Ember.isNone(crsName)) {
        crs = getLeafletCrs('{ "code": "' + crsName.toUpperCase() + '", "definition": "" }', this);
      }

      let bounds = leafletMap.getBounds();
      let minXY = L.marker(bounds._southWest).toProjectedGeoJSON(crs);
      let maxXY = L.marker(bounds._northEast).toProjectedGeoJSON(crs);

      Ember.$.ajax({
        method: 'POST',
        url: url,
        async: true,
        data: `threadCount=01&type=truncate&gridSetId=${gridSetId}&tileFormat=image%2Fpng&zoomStart=${zoomStart}&zoomStop=${zoomStop}&` +
          `${parameterStyles}minX=${minXY.geometry.coordinates[0]}&minY=${minXY.geometry.coordinates[1]}` +
          `&maxX=${maxXY.geometry.coordinates[0]}&maxY=${maxXY.geometry.coordinates[1]}`,
        contentType: 'text/html',
        error: function (data) {
          console.error(data);
        }
      });
    }
  }
});
