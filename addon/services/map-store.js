import Ember from 'ember';
import { Query } from 'ember-flexberry-data';
import epsg3857 from '../coordinate-reference-systems/epsg-3857';

const {
  Builder
} = Query;

const defaultMapName = 'defaultOSMMap';

export default Ember.Service.extend({
  store: Ember.inject.service(),

  _mapModelName: 'new-platform-flexberry-g-i-s-map',

  _layerModelname: 'new-platform-flexberry-g-i-s-map-layer',

  _defaultModelProjName: 'MapE',

  defaultOSMMap: null,

  init() {
    this._super(...arguments);
    this.setupCustomMaps();
  },

  setupCustomMaps() {
    let store = this.get('store');
    let crs = JSON.stringify(epsg3857);
    let mapModel = store.createRecord(this.get('_mapModelName'), {
      name: defaultMapName,
      lat: 0,
      lng: 0,
      zoom: 0,
      public: true,
      coordinateReferenceSystem: crs
    });
    let openStreetMapLayer = store.createRecord(this.get('_layerModelname'), {
      name: 'OSM',
      type: 'tile',
      visibility: true,
      index: 0,
      coordinateReferenceSystem: crs,
      settings: '{"opacity": 1, "url":"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}'
    });
    mapModel.get('mapLayer').pushObject(openStreetMapLayer);
    this.set('defaultOSMMap', mapModel);
  },

  getMapById(mapId, modelProjName) {
    modelProjName = Ember.isNone(modelProjName) ? this.get('_defaultModelProjName') : modelProjName;
    let store = this.get('store');
    let builder = new Builder(store)
      .from(this.get('_mapModelName'))
      .selectByProjection(modelProjName)
      .byId(mapId);
    return store.queryRecord(this.this.get('_mapModelName'), builder.build());
  }
});
