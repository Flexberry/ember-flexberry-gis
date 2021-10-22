import Route from '@ember/routing/route';
import generateUniqueId from 'ember-flexberry-data/utils/generate-unique-id';

export default Route.extend({

  /**
    Returns model related to current route.
    @method model
  */
  model(params) {
    const store = this.get('store');

    // Create map model.
    const map = store.createRecord('new-platform-flexberry-g-i-s-map', {
      id: generateUniqueId(),
      name: 'testmap',
      lat: 43.4012499836,
      lng: 39.8487556040693,
      zoom: 9.39874552061525,
      public: true,
      coordinateReferenceSystem: '{"code":"EPSG:4326"}',
    });

    // Create layer model & add to map model.
    const openStreetMapLayer = store.createRecord('new-platform-flexberry-g-i-s-map-layer', {
      id: generateUniqueId(),
      name: 'OSM',
      type: 'tile',
      visibility: true,
      index: 0,
      coordinateReferenceSystem: '{"code":"EPSG:3857","definition":null}',
      settings: '{"opacity": 1, "url":"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}',
    });
    map.get('mapLayer').pushObject(openStreetMapLayer);
    return map;
  },
});
