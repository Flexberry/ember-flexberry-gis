/**
  @module ember-flexberry-gis
*/
import Ember from 'ember';
import BaseMapTool from './base';

/**
  Drag map-tool.

  @class DragMapTool
  @extends BaseMapTool
*/
export default BaseMapTool.extend({
  /**
    Tool's cursor CSS-class.

    @property cursor
    @type String
    @default ''
  */
  cursor: '',
  mapLayers: [],

  /**
    Enables tool.

    @method _enable
    @private
  */
  _enable() {
    this._super(...arguments);
    let map = this.get('leafletMap');
    let layer1 = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap<\/a> contributors'
    });
    let layer2 = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye'
    });
    let layers = this.get('mapLayers');
    map.eachLayer(function (layer) {
      layers.push(layer);
    });
    map.eachLayer(function (layer) {
      map.removeLayer(layer);
    });

    let l = [layer1];
    layer1.addTo(map);
    layer2.addTo(map);
    L.control.sideBySide(l, layer2).addTo(map);
  },

  /**
    Disables tool.

    @method _disable
    @private
  */
  _disable() {
    let map = this.get('leafletMap');
    this._super(...arguments);
    let layers = this.get('mapLayers');
    Ember.$('.leaflet-sbs').remove();

    // this.get('mapApi').getFromApi('')
    // layer1.remove();
    // layer2.remove();
    map.eachLayer(function (layer) {
      map.removeLayer(layer);
    });

    layers.forEach(item => {
      item.addTo(map);
    });
  }
});
