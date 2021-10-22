import { isNone } from '@ember/utils';
import Service, { inject as service } from '@ember/service';
import epsg3857 from '../coordinate-reference-systems/epsg-3857';
import generateUniqueId from 'ember-flexberry-data/utils/generate-unique-id';

import QueryBuilder from 'ember-flexberry-data/query/builder';

/**
  Service for interact with maps

  @class MapStoreService
  @extends Ember.Service
*/
export default Service.extend({

  /**
   Model name for store operations with Map

   @property _mapModelName
   @private
   */
  _mapModelName: 'new-platform-flexberry-g-i-s-map',

  /**
   Model name for store operations with MapLayer

   @property _layerModelName
   @private
   */
  _layerModelname: 'new-platform-flexberry-g-i-s-map-layer',

  /**
   Default projection for Map loading
   */
  _defaultModelProjName: 'MapE',

  store: service(),

  /**
   Map stub with one layer based on OSM public tile service
   @property osmmap
   */
  osmmap: null,

  init() {
    this._super(...arguments);
    this.setupCustomMaps();
  },

  /**
   Create stubs for quick map access

   @method setupCustomMaps
   */
  setupCustomMaps() {
    let store = this.get('store');
    let crs = JSON.stringify(epsg3857);
    let mapModel = store.createRecord(this.get('_mapModelName'), {
      id: generateUniqueId(),
      name: 'OSM',
      lat: 0,
      lng: 0,
      zoom: 0,
      public: true,
      coordinateReferenceSystem: crs
    });

    let openStreetMapLayer = store.createRecord(this.get('_layerModelname'), {
      id: generateUniqueId(),
      name: 'OSM',
      type: 'osm',
      visibility: true,
      index: 0,
      coordinateReferenceSystem: crs,
      opacity: 1
    });

    mapModel.get('mapLayer').pushObject(openStreetMapLayer);
    this.set('osmmap', mapModel);
  },

  /**
    Get map from store based on Id and specified projection name

    @method getMapById
    @param {ID} mapId
    @param {string} modelProjName
   */
  getMapById(mapId, modelProjName) {
    modelProjName = isNone(modelProjName) ? this.get('_defaultModelProjName') : modelProjName;
    let store = this.get('store');
    let builder = new QueryBuilder(store)
      .from(this.get('_mapModelName'))
      .selectByProjection(modelProjName)
      .byId(mapId);
    return store.queryRecord(this.get('_mapModelName'), builder.build());
  }
});
