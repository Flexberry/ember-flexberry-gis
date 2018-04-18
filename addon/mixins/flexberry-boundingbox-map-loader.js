/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Mixin containing method for loading flexberry-boundingbox component's map.

  @class FlexberryBoundingboxMapLoaderMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({
  store: Ember.inject.service(),

  /**
   Service for Map loading from store
  */
  _mapStore: Ember.inject.service('map-store'),

  /**
    Map model name.
    @property mapModelName
    @type String
    @default 'new-platform-flexberry-g-i-s-map'
  */
  mapModelName: 'new-platform-flexberry-g-i-s-map',

  /**
    Map id for boundingbox component.
    @property boundingBoxComponentMapId
    @type String
    @default undefined
  */
  boundingBoxComponentMapId: undefined,

  /**
    Gets map model to be displayed in `flexberry-boundingbox` component.

    @method getBoundingBoxComponentMapModel
    @return {Promise} Promise, that returning map model.
  */
  getBoundingBoxComponentMapModel() {
    let config = Ember.getOwner(this).factoryFor('config:environment').class;
    let mapId = this.get('boundingBoxComponentMapId') || Ember.get(config, 'APP.components.flexberryBoundingbox.mapId');
    this.mapStore = this.get('_mapStore');
    return new Ember.RSVP.Promise((resolve, reject) => {
      if (Ember.isBlank(mapId)) {
        resolve(this.mapStore.findMapInStore('defaultOSMMap'));
      } else {
        this.mapStore.getMapById(mapId).then(record => {
          resolve(Ember.isNone(record) ? this.mapStore.findMapInStore('defaultOSMMap') : record);
        }).catch(() => {
          resolve(this.mapStore.findMapInStore('defaultOSMMap'));
        });
      }
    });
  }

});
