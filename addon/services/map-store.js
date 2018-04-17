import Ember from 'ember';

export default Ember.Service.extend({
  store: Ember.inject.service(),

  _mapModelName: 'new-platform-flexberry-g-i-s-map',

  _layerModelname: 'new-platform-flexberry-g-i-s-map-layer',

  _modelProjName: 'MapE',

  init() {
    this._super(...arguments);
    let store = this.get('store');
    let mapModel = store.createRecord(this._mapModelName, {
      name: 'defaultOSMMap',
      lat: 0,
      lng: 0,
      zoom: 0,
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
  },

  findMapInStore(mapName) {
    let store = this.get('store');
    let maps = store.peekAll(this._mapModelName);
    let map = maps.findBy('name', mapName);
    return map;
  },

  getMapById(mapId) {
    let findRecordParameters = { reload: true, projection: this._modelProjName };
    let store = this.get('store');
    let ret = store.findRecord(this._mapModelName, mapId, findRecordParameters);
    return ret;
  }

});
