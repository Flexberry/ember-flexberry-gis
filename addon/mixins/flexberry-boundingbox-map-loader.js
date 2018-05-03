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
  /**
   Service for Map loading from store
  */
  mapStore: Ember.inject.service(),

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
    return new Ember.RSVP.Promise((resolve, reject) => {
      let osmmap = this.get('mapStore.osmmap');
      if (Ember.isBlank(mapId)) {
        resolve(osmmap);
      } else {
        this.get('mapStore').getMapById(mapId).then(record => {
          resolve(record);
        }).catch(() => {
          resolve(osmmap);
        });
      }
    });
  }
});
