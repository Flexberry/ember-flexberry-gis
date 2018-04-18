/**
  @module ember-flexberry-gis-dummy
*/

import MapStore from 'ember-flexberry-gis/services/map-store';

/**
  Application map store service.
*/
export default MapStore.extend({

  init() {
    this._super(...arguments);
    let store = this.get('store');
    let mapModel = store.createRecord(this._mapModelName, {
      name: 'permOSMMap',
      lat: 58.003996,
      lng: 56.191976,
      zoom: 12,
      public: true,
      coordinateReferenceSystem: '{"code":"EPSG:4326"}'
    });
    let openStreetMapLayer = store.createRecord(this._layerModelname, {
      name: 'OSM',
      type: 'tile',
      visibility: true,
      index: 0,
      coordinateReferenceSystem: '{"code":"EPSG:3857","definition":null}',
      settings: '{"opacity": 1, "url":"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}'
    });
    mapModel.get('mapLayer').pushObject(openStreetMapLayer);
  }
});
