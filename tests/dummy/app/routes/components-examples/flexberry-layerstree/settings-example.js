import Ember from 'ember';

export default Ember.Route.extend({
  setupController: function(controller, model) {
    // Call _super for default behavior.
    this._super(controller, model);

    let store = this.get('store');
    Ember.assert('Store is not defined.', store);
    let modelType = 'new-platform-flexberry-g-i-s-map-layer';
    let resultArray = Ember.A([
      store.createRecord(modelType, {
        name: 'jsonLayer1',
        type: 'wms',
        visibility: 'true',
        settings: '{"url":"http://172.17.1.15:8080/geoserver/ows", ' +
                  '"layers":"osm_perm_region:perm_water_line", ' +
                  '"format":"image/png", ' +
                  '"transparent":"true", ' +
                  '"version":"1.3.0"}',
        coordinateReferenceSystem: null,
        layers: Ember.A([
          store.createRecord(modelType, {
            name: 'jsonLayer1.1',
            type: 'tile',
            visibility: true,
            settings: '{"url": "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}',
            coordinateReferenceSystem: null,
            layers: Ember.A([
              store.createRecord(modelType, {
                name: 'jsonLayer1.1.1',
                type: 'wms',
                visibility: true,
                settings: '{"url":"http://172.17.1.15:8080/geoserver/ows",' +
                          '"layers":"osm_perm_region:perm_points_of_interest",' +
                          '"format":"image/png",' +
                          '"transparent":"true",' +
                          '"version":"1.3.0"}',
                coordinateReferenceSystem: null,
                layers: null
              })
            ])
          }),
          store.createRecord(modelType, {
            name: 'jsonLayer1.2',
            type: 'wms',
            visibility: false,
            settings: '{"url":"http://172.17.1.15:8080/geoserver/ows",' +
                      '"layers":"osm_perm_region:water_polygon_all",' +
                      '"format":"image/png",' +
                      '"transparent":"true",' +
                      '"version":"1.3.0"}',
            coordinateReferenceSystem: null,
            layers: null
          })
        ])
      })
    ]);

    controller.set('jsonLayersTreeNodes', resultArray);
  }
});
