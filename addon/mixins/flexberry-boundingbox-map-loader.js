/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import { Query } from 'ember-flexberry-data';

const {
  Builder
} = Query;

/**
  Mixin containing method for loading flexberry-boundingbox component's map.

  @class FlexberryBoundingboxMapLoaderMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({
  store: Ember.inject.service(),

  /**
    Map model name.
    @property mapModelName
    @type String
    @default 'new-platform-flexberry-g-i-s-map'
  */
  mapModelName: 'new-platform-flexberry-g-i-s-map',

  /**
    Gets map model to be displayed in `flexberry-boundingbox` component.

    @method getBoundingBoxComponentMapModel
    @return {Promise} Promise, that returning map model.
  */
  getBoundingBoxComponentMapModel() {
    let config = Ember.getOwner(this).factoryFor('config:environment').class;
    let mapId = Ember.get(config, 'APP.components.flexberryBoundingbox.mapId');
    return new Ember.RSVP.Promise((resolve, reject) => {
      if (Ember.isBlank(mapId)) {
        resolve(this.getDefaultBoundingBoxComponentMapModel());
      } else {
        let builder = new Builder(this.get('store'))
          .from(this.get('mapModelName'))
          .selectByProjection('MapE')
          .byId(mapId);
        this.get('store').queryRecord(this.get('mapModelName'), builder.build()).then(record => {
          resolve(Ember.isNone(record) ? this.getDefaultBoundingBoxComponentMapModel() : record);
        }).catch(() => {
          resolve(this.getDefaultBoundingBoxComponentMapModel());
        });
      }
    });
  },

  /**
    Gets default map model to be displayed in `flexberry-boundingbox` component.

    @method getDefaultBoundingBoxComponentMapModel
    @return {Promise} Promise, that returning map model.
  */
  getDefaultBoundingBoxComponentMapModel() {
    // Create map model to be displayed in `flexberry-boundingbox` component.
    let mapModel = this.get('store').createRecord(this.get('mapModelName'), {
      name: 'testmap',
      lat: 0,
      lng: 0,
      zoom: 0,
      public: true,
      coordinateReferenceSystem: '{"code":"EPSG:4326"}'
    });

    // Create layer model & add to map model.
    let openStreetMapLayer = this.get('store').createRecord('new-platform-flexberry-g-i-s-map-layer', {
      name: 'OSM',
      type: 'tile',
      visibility: true,
      index: 0,
      coordinateReferenceSystem: '{"code":"EPSG:3857","definition":null}',
      settings: '{"opacity": 1, "url":"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}'
    });
    mapModel.get('mapLayer').pushObject(openStreetMapLayer);

    return mapModel;
  }
});
